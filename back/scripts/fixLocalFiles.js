import { userDB } from '../src/db/pool.js';
import cloudinary from '../src/config/cloudinary.js';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEMP_DIR = path.join(os.tmpdir(), 'mentix-fix');

function createFakeZip(id, title) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
    const zipPath = path.join(TEMP_DIR, `p${id}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve(zipPath));
    archive.on('error', reject);
    archive.pipe(output);
    archive.append(title, { name: 'README.txt' });
    archive.finalize();
  });
}

const [rows] = await userDB.query("SELECT id, title, file_path FROM projects WHERE file_path IS NOT NULL AND file_path NOT LIKE 'http%'");
console.log('Projects with local file paths: ' + rows.length);

for (const r of rows) {
  console.log(`ID ${r.id}: ${r.title}`);
  const zipPath = await createFakeZip(r.id, r.title);
  const result = await cloudinary.uploader.upload(zipPath, {
    folder: 'uploads/projects',
    resource_type: 'raw',
    public_id: `project_${Date.now()}_${r.id}`
  });
  fs.unlinkSync(zipPath);
  await userDB.query(
    'UPDATE projects SET file_name = ?, file_path = ?, file_original_name = ?, file_size = ? WHERE id = ?',
    [result.public_id, result.secure_url, `${r.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`, result.bytes, r.id]
  );
  console.log(`  -> ${result.secure_url}`);
}

await userDB.end();
