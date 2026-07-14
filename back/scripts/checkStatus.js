import { userDB } from '../src/db/pool.js';

const [rows] = await userDB.query(`
  SELECT
    COUNT(*) AS total,
    SUM(thumbnail LIKE 'http%') AS cloud_thumb,
    SUM(file_path LIKE 'http%') AS cloud_file
  FROM projects
`);
console.log(`Total projects: ${rows[0].total}`);
console.log(`Cloudinary thumbnails: ${rows[0].cloud_thumb}`);
console.log(`Cloudinary project files: ${rows[0].cloud_file}`);

await userDB.end();
