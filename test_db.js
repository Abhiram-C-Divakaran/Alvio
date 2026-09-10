const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('data/database.sqlite');
console.log("VIEWS:", db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name='problem_stats';").all());
