import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import {migrate} from './migrations';
const dbPath=process.env.DATABASE_PATH||path.join(process.cwd(),'data','database.sqlite');
if(dbPath!==':memory:')fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
for (let attempt = 0; attempt < 10; attempt++) {
  try {
    db.exec('PRAGMA journal_mode=WAL;');
    break;
  } catch (err: unknown) {
    if (attempt === 9 || !(err instanceof Error) || !/locked|busy/i.test(err.message)) throw err;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
  }
}
migrate(db);
export default db;
