/**
 * Optional live-provider smoke test for Alvio's AI Tutor and Mock Interview.
 * Requires GROQ_API_KEY in the environment (or .env) and outbound internet access.
 * Skips cleanly when GROQ_API_KEY is not configured so ordinary offline test runs never fail.
 */
import 'dotenv/config';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { resolveChatModel } from '../server/chat';
import { parseInterviewEvaluation } from '../src/features/ai-tutor/interviewParser';

const hasLiveKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());

let child: ReturnType<typeof spawn> | undefined;
let directory = '';
let origin = '';
let token = '';

async function parseSseResponse(res: Response): Promise<{ deltas: number; text: string }> {
  assert.equal(res.status, 200, `Expected HTTP 200, got ${res.status}`);
  assert.match(res.headers.get('content-type') || '', /text\/event-stream/);
  const raw = await res.text();
  let deltas = 0;
  let combined = '';
  let finalText = '';
  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith('data:')) continue;
    const payload = JSON.parse(line.slice(5).trimStart());
    if (payload.error) throw new Error(`SSE error: ${payload.error}`);
    if (typeof payload.delta === 'string') {
      deltas++;
      combined += payload.delta;
    }
    if (payload.done && typeof payload.text === 'string') {
      finalText = payload.text;
    }
  }
  return { deltas, text: (finalText || combined).trim() };
}

before(async () => {
  if (!hasLiveKey) return;
  directory = await mkdtemp(join(tmpdir(), 'alvio-live-ai-'));
  const socket = createServer();
  await new Promise<void>((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const { port } = socket.address() as { port: number };
  await new Promise<void>((resolve) => socket.close(() => resolve()));
  origin = `http://127.0.0.1:${port}`;

  child = spawn(process.execPath, ['dist/server.cjs'], {
    env: {
      ...process.env,
      JWT_SECRET: randomBytes(48).toString('hex'),
      DATABASE_PATH: join(directory, 'live-ai.sqlite'),
      PORT: String(port),
      NODE_ENV: 'production',
      ALLOWED_ORIGINS: origin,
      GROQ_CHAT_MODEL: resolveChatModel(process.env),
    },
    stdio: 'pipe',
  });

  let stderr = '';
  child.stderr?.on('data', (d) => (stderr += d));
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(origin + '/api/auth/me');
      break;
    } catch {
      if (i === 99 || child.exitCode !== null) throw new Error(`Live smoke server failed: ${stderr}`);
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const signup = await fetch(origin + '/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Live AI Smoke',
      email: 'live-ai@example.test',
      password: 'live-smoke-password-123',
    }),
  });
  assert.equal(signup.status, 200);
  token = (await signup.json()).token;
});

after(async () => {
  child?.kill();
  if (child && child.exitCode === null) {
    await new Promise((resolve) => child!.once('exit', resolve));
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

test('LIVE Groq: AI Tutor streams a real response and retains follow-up context', { skip: !hasLiveKey }, async () => {
  const firstRes = await fetch(origin + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tutorMode: 'Teach me',
      messages: [{ role: 'user', content: 'Briefly explain how binary search works and its time complexity.' }],
    }),
  });
  const first = await parseSseResponse(firstRes);
  assert(first.deltas >= 2, `Expected progressive SSE chunks, got ${first.deltas}`);
  assert(first.text.length > 50, 'Expected substantive tutor response');
  assert.match(first.text, /log\s*n|O\(log/i);

  const followUpRes = await fetch(origin + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tutorMode: 'Give me a hint',
      messages: [
        { role: 'user', content: 'Briefly explain how binary search works and its time complexity.' },
        { role: 'assistant', content: first.text },
        { role: 'user', content: 'Give me one short hint about why the input array must be sorted.' },
      ],
    }),
  });
  const followUp = await parseSseResponse(followUpRes);
  assert(followUp.deltas >= 1);
  assert(followUp.text.length > 20);
});

test('LIVE Groq: Mock Interview generates question, parses evaluation JSON, and generates final report', { skip: !hasLiveKey }, async () => {
  // 1. Start interview
  const startRes = await fetch(origin + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tutorMode: 'Mock Interview',
      messages: [
        {
          role: 'user',
          content:
            'You are a professional technical interviewer. Topic: Arrays & HashMaps. Difficulty: Easy. This interview has 8 questions. Greet the candidate and ask exactly one clear first question. Do not reveal the answer. Output only interview dialogue.',
        },
        { role: 'user', content: 'Begin the interview.' },
      ],
    }),
  });
  const q1 = await parseSseResponse(startRes);
  assert(q1.text.length > 20, 'Expected a real first interview question');
  assert.doesNotMatch(q1.text, /```animated-3d/);

  // 2. Submit answer & validate evaluation JSON
  const candidateAnswer =
    'A hash map uses a hash function to map keys into bucket indices for O(1) average lookup and insertion. Collisions are handled with chaining or open addressing, with O(n) worst-case time.';
  const evalRes = await fetch(origin + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tutorMode: 'Mock Interview',
      messages: [
        {
          role: 'user',
          content:
            'You are a professional technical interview evaluator. Topic: Arrays & HashMaps. Difficulty: Easy. Evaluate only the candidate\'s latest answer against the latest question. Return ONLY valid raw JSON with no markdown fences: {"score":number from 0 to 100,"summary":"brief evidence-based assessment","criteria":[{"label":"question-specific criterion","status":"strong or partial or needs-improvement","detail":"brief evidence"}],"tip":"one actionable tip","nextQuestion":"one relevant follow-up or new question, adapting difficulty to the answer"}. Do not expose answers to future questions. Keep feedback limited to the submitted answer. This is question 1 of 8.',
        },
        { role: 'assistant', content: q1.text },
        { role: 'user', content: candidateAnswer },
      ],
    }),
  });
  const evalSse = await parseSseResponse(evalRes);
  const parsed = parseInterviewEvaluation(evalSse.text);
  assert(parsed.score !== null && parsed.score >= 0 && parsed.score <= 100, 'Expected numeric 0-100 score');
  assert(parsed.summary.length > 10, 'Expected non-empty summary');
  assert(parsed.criteria.length >= 1, 'Expected at least one criterion');
  assert(parsed.tip.length > 5, 'Expected an actionable tip');
  assert(parsed.nextQuestion.length > 10, 'Expected a valid nextQuestion');

  // 3. Generate final Markdown report
  const reportRes = await fetch(origin + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tutorMode: 'Mock Interview',
      messages: [
        {
          role: 'user',
          content:
            'Evaluate this Arrays & HashMaps (Easy) technical interview. Generate a constructive markdown report: Overall Score, Technical Knowledge, Problem Solving, Communication, Clarity, Complexity Analysis, Strengths, Areas to Improve, Recommended Practice, and Review Answers. Assess only evidence in the transcript. For missing evidence write Not assessed; do not invent performance or confidence scores. The session may be partial.',
        },
        {
          role: 'user',
          content: `interviewer: ${q1.text}\n\ncandidate: ${candidateAnswer}`,
        },
      ],
    }),
  });
  const report = await parseSseResponse(reportRes);
  assert(report.text.length > 100, 'Expected substantive Markdown interview report');
  assert.match(report.text, /Overall Score|Strengths|Areas to Improve/i);
});
