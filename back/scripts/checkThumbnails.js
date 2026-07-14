import { userDB } from '../src/db/pool.js';

const [rows] = await userDB.query('SELECT id, title, thumbnail FROM projects ORDER BY id');
for (const r of rows) {
  console.log(`ID ${r.id}: ${r.thumbnail}`);
}

await userDB.end();
