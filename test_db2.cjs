const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('data/database.sqlite');
const problems = db.prepare("SELECT id, title FROM problems").all();
for (const p of problems) {
  if (typeof p.title !== 'string') {
    console.log("BAD TITLE:", p);
  }
}
console.log("Done checking titles. Total:", problems.length);
