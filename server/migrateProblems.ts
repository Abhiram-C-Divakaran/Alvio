import 'dotenv/config';
import db from './db';
import { loadProblemCatalog, seedProblemCatalog } from './problemCatalog';

const problems = loadProblemCatalog();
const result = seedProblemCatalog(db, problems);
console.log(`Seeded ${result.imported} coding problems into SQLite (archived ${result.archived} legacy placeholders).`);
db.close();
