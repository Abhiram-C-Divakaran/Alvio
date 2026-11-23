import type { DatabaseSync } from 'node:sqlite';
export function migrate(db:DatabaseSync){
db.exec('CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
const migrations=[(db:DatabaseSync)=>db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Apprentice',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS course_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_name TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, course_name)
  );

  CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    topic TEXT,
    difficulty TEXT NOT NULL,
    description TEXT NOT NULL,
    examples TEXT NOT NULL,
    constraints TEXT NOT NULL,
    signature TEXT NOT NULL,
    starterCode TEXT NOT NULL,
    testCases TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_problem_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    problem_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(problem_id) REFERENCES problems(id),
    UNIQUE(user_id, problem_id, interaction_type)
  );

  CREATE TABLE IF NOT EXISTS problem_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    problem_id TEXT NOT NULL,
    issues TEXT NOT NULL,
    additional_feedback TEXT,
    rating INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(problem_id) REFERENCES problems(id)
  );

  CREATE TABLE IF NOT EXISTS user_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    problem_id TEXT NOT NULL,
    status TEXT NOT NULL,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    runtime_ms INTEGER,
    memory_mb REAL,
    passed_testcases INTEGER,
    total_testcases INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(problem_id) REFERENCES problems(id)
  );
`), (db:DatabaseSync)=>{
const fields=new Set((db.prepare('PRAGMA table_info(users)').all() as any[]).map(x=>x.name));
for(const field of ['location','university','github','linkedin','avatar_url'])if(!fields.has(field))db.exec(`ALTER TABLE users ADD COLUMN ${field} TEXT DEFAULT ''`);
db.exec(`CREATE TABLE IF NOT EXISTS problem_stats(problem_id TEXT PRIMARY KEY, accepted INTEGER DEFAULT 0, submissions INTEGER DEFAULT 0, FOREIGN KEY(problem_id) REFERENCES problems(id));
CREATE TABLE learning_progress(user_id INTEGER PRIMARY KEY, progress_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id));`);
},(db:DatabaseSync)=>{const fields=new Set((db.prepare('PRAGMA table_info(user_submissions)').all() as any[]).map(x=>x.name));if(!fields.has('verified'))db.exec('ALTER TABLE user_submissions ADD COLUMN verified INTEGER NOT NULL DEFAULT 0');},(db:DatabaseSync)=>{
  db.exec(`CREATE TABLE learning_progress_cascade(user_id INTEGER PRIMARY KEY, progress_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  INSERT INTO learning_progress_cascade SELECT user_id,progress_json,revision,updated_at FROM learning_progress;
  DROP TABLE learning_progress;
  ALTER TABLE learning_progress_cascade RENAME TO learning_progress;`);
},(db:DatabaseSync)=>{
  const userFields=new Set((db.prepare('PRAGMA table_info(users)').all() as any[]).map(x=>x.name));
  if(!userFields.has('token_version'))db.exec('ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 1');
  db.exec(`CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    user_agent TEXT DEFAULT '',
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);`);
},(db:DatabaseSync)=>{
  db.exec(`CREATE TABLE IF NOT EXISTS xp_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_key TEXT NOT NULL,
    points INTEGER NOT NULL,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, event_type, event_key)
  );
  CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_id ON xp_ledger(user_id);
  CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_created ON xp_ledger(user_id, created_at);
  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  );`);
}];
for(let i=0;i<migrations.length;i++){if(db.prepare('SELECT version FROM schema_migrations WHERE version=?').get(i+1))continue;db.exec('BEGIN IMMEDIATE');try{migrations[i](db);db.prepare('INSERT INTO schema_migrations(version) VALUES(?)').run(i+1);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}
}
