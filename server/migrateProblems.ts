import 'dotenv/config';
import db from './db';
import { loadProblemCatalog, seedProblemCatalog } from './problemCatalog';
import { seedHiddenTests } from './seedHiddenTests';

const problems = loadProblemCatalog();
const result = seedProblemCatalog(db, problems);
const hidden = seedHiddenTests(db);
console.log(
  `Seeded ${result.imported} coding problems into SQLite (archived ${result.archived} legacy placeholders) and ${hidden.inserted} hidden test cases (${hidden.alreadyPresent} existing across ${hidden.problemsMatched} problems).`
);
db.close();
