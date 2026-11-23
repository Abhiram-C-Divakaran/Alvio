import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  authSecret,
  clearAuthCookies,
  createAuthSession,
  csrfProtection,
  extractSessionIdFromRequest,
  parseCookies,
  publicUser,
  REFRESH_COOKIE_NAME,
  requireAuth,
  revokeAllUserSessions,
  revokeSessionById,
  rotateRefreshSession,
  setAuthCookies,
} from "./server/auth";
import {rateLimit,securityHeaders,safeErrors,logFailure} from "./server/security";
import {registerProgress} from "./server/progress";
import {registerSubmissions} from "./server/submissions";
import db from "./server/db";
import { registerVisualizer } from './server/visualizer';
import { registerChat } from './server/chat';

authSecret();

function getEpicLevel(xp: number) {
  if (xp < 100) return 'Bronze V';
  if (xp < 250) return 'Bronze IV';
  if (xp < 500) return 'Bronze I';
  if (xp < 800) return 'Silver V';
  if (xp < 1200) return 'Silver I';
  if (xp < 1800) return 'Gold V';
  if (xp < 2500) return 'Gold I';
  if (xp < 3500) return 'Platinum V';
  if (xp < 4800) return 'Platinum I';
  if (xp < 6200) return 'Diamond V';
  if (xp < 7800) return 'Diamond I';
  if (xp < 9500) return 'Crown';
  if (xp < 12000) return 'Ace';
  return 'Conqueror';
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
  }
  const origins=(process.env.ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);
  if(process.env.NODE_ENV==='production'&&!origins.length)throw Error('ALLOWED_ORIGINS is required in production.');
  app.use(securityHeaders);
  app.use(cors({
    origin:(origin,done)=>done(null,!origin||origins.includes(origin)||(process.env.NODE_ENV!=='production'&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))),
    credentials: true,
    exposedHeaders: ['X-Auth-Expired', 'X-Request-ID'],
  }));
  app.use('/api',(_req,res,next)=>{res.setHeader('Cache-Control','no-store');next()});
  app.use('/api', csrfProtection(origins));
  app.use(express.json({limit:'512kb'}));
  registerProgress(app);
  registerVisualizer(app);
  registerSubmissions(app);
  registerChat(app);



  // --- Auth Routes ---
  app.post("/api/auth/signup", rateLimit(5,600000,"signup"), async (req, res) => {
    try {
      const {password}=req.body;const name=typeof req.body.name==='string'?req.body.name.trim():'';const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
      if(name.length<2||name.length>80||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<8||Buffer.byteLength(password)>72)return res.status(400).json({error:'Use a valid name, email, and a password of 8–72 bytes.'});
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingUser = db.prepare("SELECT * FROM users WHERE lower(email) = ?").get(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);
      const insert = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
      const result = insert.run(name, email, hash);

      const user = { id: Number(result.lastInsertRowid), name, email, xp: 0, level: "Apprentice" };
      const session = createAuthSession(Number(user.id), String(req.headers['user-agent'] || ''));

      // Add a welcome activity
      db.prepare("INSERT INTO user_activity (user_id, activity_type, points) VALUES (?, ?, ?)").run(user.id, "Joined Alvio", 0);

      setAuthCookies(req, res, session);
      res.json({ user: publicUser(user), token: session.accessToken });
    } catch {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", rateLimit(10,600000,"login"), async (req, res) => {
    try {
      const {password}=req.body;const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
      if(!email||email.length>254||typeof password!=='string'||Buffer.byteLength(password)>72)return res.status(400).json({error:'Enter a valid email and password.'});
      if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = db.prepare("SELECT * FROM users WHERE lower(email) = ?").get(email) as any;
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const session = createAuthSession(Number(user.id), String(req.headers['user-agent'] || ''));
      setAuthCookies(req, res, session);

      res.json({ user: publicUser(user), token: session.accessToken });
    } catch {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.post("/api/auth/refresh", rateLimit(30, 600000, "refresh"), (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const rawRefresh = cookies[REFRESH_COOKIE_NAME];
      if (!rawRefresh) {
        clearAuthCookies(req, res);
        return res.status(401).json({ error: "Please sign in again.", code: "UNAUTHORIZED" });
      }
      const rotated = rotateRefreshSession(rawRefresh, String(req.headers['user-agent'] || ''));
      if (!rotated) {
        clearAuthCookies(req, res);
        logFailure(req, 'auth_refresh_rejected');
        return res.status(401).json({ error: "Please sign in again.", code: "SESSION_REVOKED" });
      }
      setAuthCookies(req, res, rotated);
      res.json({ user: publicUser(rotated.user), token: rotated.accessToken });
    } catch {
      logFailure(req, 'backend_error');
      res.status(500).json({ error: "Failed to refresh session" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    try {
      const sessionId = extractSessionIdFromRequest(req);
      if (sessionId) {
        revokeSessionById(sessionId);
      }
      clearAuthCookies(req, res);
      res.json({ success: true });
    } catch {
      logFailure(req, 'backend_error');
      clearAuthCookies(req, res);
      res.status(500).json({ error: "Failed to log out" });
    }
  });

  app.post("/api/auth/logout-all", requireAuth, (req, res) => {
    try {
      revokeAllUserSessions(req.userId);
      clearAuthCookies(req, res);
      res.json({ success: true });
    } catch {
      logFailure(req, 'backend_error');
      res.status(500).json({ error: "Failed to revoke sessions" });
    }
  });

  // --- Dashboard Route ---
  app.get("/api/dashboard", requireAuth, (req, res) => {
    try {


      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId) as any;
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const activity = db.prepare("SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 10").all(req.userId);

      const allDates = db.prepare("SELECT DISTINCT date(created_at) as d FROM user_activity WHERE user_id = ? ORDER BY d DESC").all(req.userId) as {d: string}[];
      let dayStreak = 0;
      const today = new Date();
      let currentDate = new Date(today);
      let foundTodayOrYesterday = false;

      if (allDates.length > 0) {
        const firstDate = new Date(allDates[0].d);
        const timeDiff = Math.abs(today.getTime() - firstDate.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (diffDays <= 2) {
            foundTodayOrYesterday = true;
            currentDate = firstDate;
        }
      }

      if (foundTodayOrYesterday) {
        let i = 0;
        while(i < allDates.length) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(currentDate.getDate() - dayStreak);
            const checkDateString = checkDate.toISOString().split('T')[0];
            if (allDates[i].d === checkDateString) {
                dayStreak++;
                i++;
            } else {
                break;
            }
        }
      }

      const snapshot = db.prepare('SELECT progress_json FROM learning_progress WHERE user_id=?').get(req.userId) as any;
      const learning = snapshot ? JSON.parse(snapshot.progress_json) : null;
      const timeSpentMins = learning?.totalTimeSpentMinutes || 0;

      const realLevel = getEpicLevel(user.xp);

      const onlineUsers = null;

      const completedCountQuery = db.prepare("SELECT COUNT(*) as c FROM course_progress WHERE user_id = ?").get(req.userId) as {c: number};
      const topicsCompleted = (completedCountQuery ? completedCountQuery.c : 0);

      res.json({
        user: { id: user.id, name: user.name, xp: user.xp, level: realLevel },
        stats: {
          topicsCompleted: topicsCompleted,
          totalTopics: Math.max(8, topicsCompleted + 7),
          timeSpentMins: timeSpentMins,
          dayStreak: dayStreak,
          daysActive: allDates.length,
          onlineUsers
        },
        activity,
        allDates: allDates.map(d => d.d),
      });
    } catch (error: any) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Unable to load your account. Please try again." });
    }
  });




  // --- Activity Routes ---
  app.post('/api/activity',requireAuth,(_req,res)=>res.status(410).json({error:'Client-reported rewards are no longer accepted. Use learning progress sync.',code:'UNVERIFIED_REWARD'}));
  // Dummy stats seeding removed as per user request to only use real time data

  // --- Problems API Routes (Dedicated Backend) ---
  app.get("/api/problems", (req, res) => {
    try {
      // Return summary info along with accepted and submissions stats
      const problems = db.prepare(`
        SELECT p.id, p.title, p.topic, p.difficulty,
               COALESCE(s.accepted, 0) as accepted,
               COALESCE(s.submissions, 0) as submissions
        FROM problems p
        LEFT JOIN problem_stats s ON p.id = s.problem_id
        ORDER BY p.created_at ASC
      `).all() as any[];

      const cleanedProblems = problems.map(p => ({
        ...p,
        title: p.title.replace(/^Problem\s+\d+:\s*/i, '')
      }));
      res.json(cleanedProblems);
    } catch (error) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/problems/:problemId", (req, res) => {
    try {
      const problem = db.prepare("SELECT * FROM problems WHERE id = ?").get(String(req.params.problemId)) as any;
      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }

      // Clean title
      problem.title = problem.title.replace(/^Problem\s+\d+:\s*/i, '');

      // Parse the JSON fields back to objects for the frontend
      problem.examples = JSON.parse(problem.examples);
      problem.constraints = JSON.parse(problem.constraints);
      problem.signature = JSON.parse(problem.signature);
      problem.starterCode = JSON.parse(problem.starterCode);
      problem.testCases = JSON.parse(problem.testCases);

      // Fetch stats
      const stats = db.prepare("SELECT accepted, submissions FROM problem_stats WHERE problem_id = ?").get(String(req.params.problemId)) as any;
      if (stats) {
        problem.stats = stats;
      } else {
        // Initialize real data starting at 0
        const initialStats = {
          accepted: 0,
          submissions: 0
        };
        db.prepare("INSERT INTO problem_stats (problem_id, accepted, submissions) VALUES (?, ?, ?)").run(String(req.params.problemId), initialStats.accepted, initialStats.submissions);
        problem.stats = initialStats;
      }

      res.json(problem);
    } catch (error) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Problem Interaction Routes ---
  app.post("/api/problems/:problemId/feedback", requireAuth, (req, res) => {
    try {
      const problemId = String(req.params.problemId);
      const { issues, additionalFeedback, rating } = req.body;

      const userId=req.userId;
      if(!Array.isArray(issues)||issues.length>20||issues.some((x:any)=>typeof x!=="string"||x.length>200)||typeof additionalFeedback!=="string"||additionalFeedback.length>5000||!Number.isInteger(rating)||rating<0||rating>5)return res.status(400).json({error:"Invalid feedback."});
      db.prepare("INSERT INTO problem_feedback (user_id, problem_id, issues, additional_feedback, rating) VALUES (?, ?, ?, ?, ?)").run(
        userId,
        problemId,
        JSON.stringify(issues || []),
        additionalFeedback || "",
        rating || null
      );

      res.json({ success: true });
    } catch (error) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.get("/api/problems/:problemId/interaction", requireAuth, (req, res) => {
    try {

      const problemId = String(req.params.problemId);

      const interactions = db.prepare("SELECT interaction_type FROM user_problem_interactions WHERE user_id = ? AND problem_id = ?").all(req.userId, problemId) as any[];

      const state = { liked: false, disliked: false, starred: false };
      interactions.forEach(i => {
        if (i.interaction_type === 'like') state.liked = true;
        if (i.interaction_type === 'dislike') state.disliked = true;
        if (i.interaction_type === 'star') state.starred = true;
      });

      // Also get total likes for the problem
      const totalLikesQuery = db.prepare("SELECT COUNT(*) as c FROM user_problem_interactions WHERE problem_id = ? AND interaction_type = 'like'").get(problemId) as {c: number};
      const totalLikes = totalLikesQuery ? totalLikesQuery.c : 0;

      res.json({ ...state, totalLikes });
    } catch (error) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Coding submission routes are registered by registerSubmissions(app) above.

  app.post("/api/problems/:problemId/interaction", requireAuth, (req, res) => {
    try {

      const problemId = String(req.params.problemId);
      const { type, action } = req.body;
      if(!['like','dislike','star'].includes(type)||!['add','remove'].includes(action))return res.status(400).json({error:'Invalid interaction.'}); // type: 'like' | 'dislike' | 'star', action: 'add' | 'remove'

      if (action === 'add') {
        // If adding a like, remove dislike (and vice versa)
        if (type === 'like') {
          db.prepare("DELETE FROM user_problem_interactions WHERE user_id = ? AND problem_id = ? AND interaction_type = 'dislike'").run(req.userId, problemId);
        } else if (type === 'dislike') {
          db.prepare("DELETE FROM user_problem_interactions WHERE user_id = ? AND problem_id = ? AND interaction_type = 'like'").run(req.userId, problemId);
        }

        // Insert new interaction (ignore if exists due to unique constraint)
        db.prepare("INSERT OR IGNORE INTO user_problem_interactions (user_id, problem_id, interaction_type) VALUES (?, ?, ?)").run(req.userId, problemId, type);
      } else if (action === 'remove') {
        db.prepare("DELETE FROM user_problem_interactions WHERE user_id = ? AND problem_id = ? AND interaction_type = ?").run(req.userId, problemId, type);
      }

      res.json({ success: true });
    } catch (error) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/profile/favourites", requireAuth, (req, res) => {
    try {


      const favourites = db.prepare("SELECT problem_id, created_at FROM user_problem_interactions WHERE user_id = ? AND interaction_type = 'star' ORDER BY created_at DESC").all(req.userId);
      res.json(favourites);
    } catch (error) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Leaderboard Routes ---
  app.get("/api/leaderboard", requireAuth, (req, res) => {
    try {
      const topUsers = db.prepare("SELECT name, xp FROM users ORDER BY xp DESC LIMIT 5").all();
      res.json(topUsers);
    } catch (error) {
      logFailure(req,'backend_error');
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // --- Profile Routes ---
  app.get("/api/profile", requireAuth, (req, res) => {
    try {


      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const activity = db.prepare("SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.userId);
      const courses = db.prepare("SELECT * FROM course_progress WHERE user_id = ? ORDER BY updated_at DESC").all(req.userId);
      const solvedProblems = db.prepare(`
        SELECT p.id, p.title, p.difficulty, MAX(us.created_at) as solved_at
        FROM user_submissions us
        JOIN problems p ON us.problem_id = p.id
        WHERE us.user_id = ? AND us.status = 'Passed' AND us.verified = 1
        GROUP BY p.id, p.title, p.difficulty
        ORDER BY solved_at DESC
      `).all(req.userId);

      const attemptedProblems = db.prepare("SELECT DISTINCT problem_id as id FROM user_submissions WHERE user_id = ?").all(req.userId);
      const practiceActivity = db.prepare(`
        SELECT strftime('%Y-%m-%dT%H:00:00Z', created_at) as recordedAt, COUNT(*) as attempts
        FROM user_submissions WHERE user_id = ? AND created_at >= datetime('now', '-62 days')
        GROUP BY strftime('%Y-%m-%dT%H:00:00Z', created_at)
        ORDER BY recordedAt
      `).all(req.userId);
      res.json({ user: { ...publicUser(user), location:user.location, university:user.university, github:user.github, linkedin:user.linkedin, avatar_url:user.avatar_url }, activity, courses, solvedProblems, attemptedProblems, practiceActivity });
    } catch (error) {
      res.status(500).json({ error: "The service is temporarily unavailable." });
    }
  });

  app.post("/api/profile/update", requireAuth, (req, res) => {
    try {


      const {location='',university='',github='',linkedin='',avatar_url=''}=req.body;
      if([location,university,github,linkedin,avatar_url].some(v=>typeof v!=='string'||v.length>2000)||[github,linkedin,avatar_url].some(v=>v&&!/^https?:\/\//i.test(v)))return res.status(400).json({error:'Invalid profile details.'});

      db.prepare("UPDATE users SET location = ?, university = ?, github = ?, linkedin = ?, avatar_url = ? WHERE id = ?")
        .run(location, university, github, linkedin, avatar_url, req.userId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "The service is temporarily unavailable." });
    }
  });

  app.get('/api/auth/me',requireAuth,(req,res)=>res.json({user:publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(req.userId))}));
  app.use('/api',(_req,res)=>res.status(404).json({error:'API route not found.'}));
  app.use(safeErrors);
  // Vite middleware for development


  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { redirect: false }));
    app.get("/*splat", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
