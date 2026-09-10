const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('data/database.sqlite');
console.log("VIEWS:", db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name='problem_stats';").all());
try {
  console.log(db.prepare(`
        SELECT p.id, p.title, p.topic, p.difficulty,
               COALESCE(s.accepted, 0) as accepted,
               COALESCE(s.submissions, 0) as submissions
        FROM problems p
        LEFT JOIN problem_stats s ON p.id = s.problem_id
        ORDER BY p.created_at ASC
        LIMIT 2
      `).all());
} catch(e) {
  console.error(e.message);
}
