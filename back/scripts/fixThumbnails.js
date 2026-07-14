import { userDB } from '../src/db/pool.js';
import cloudinary from '../src/config/cloudinary.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACK_DIR = path.resolve(__dirname, '..');

const categoryDefaultMap = {
  'Web Development': 'web-development.webp',
  'AI & Machine Learning': 'AI_ML.webp',
  'Mobile Development': 'mobile-development.jpg',
  'DevOps': 'devops.jpg',
  'UI/UX Design': 'ux_ui_design.webp',
  'Data Science': 'data_science.webp',
  'IoT': 'IoT.jpg',
  'Other': 'other.jpg',
};

// First, delete the wrongly-nested images from Cloudinary
console.log('Cleaning up wrongly-nested Cloudinary resources...');
for (const [cat, filename] of Object.entries(categoryDefaultMap)) {
  const oldPublicId = `default-covers/default-covers/${path.parse(filename).name}`;
  try {
    await cloudinary.uploader.destroy(oldPublicId);
    console.log(`  Deleted: ${oldPublicId}`);
  } catch (e) {
    // might not exist
  }
}

// Re-upload with correct path
console.log('\nRe-uploading with correct paths...');
const coverMap = {};
for (const [cat, filename] of Object.entries(categoryDefaultMap)) {
  const filePath = path.join(BACK_DIR, 'uploads', 'default-covers', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  MISS: ${filename}`);
    continue;
  }
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'default-covers',
    resource_type: 'image',
    public_id: path.parse(filename).name,
    overwrite: true,
  });
  coverMap[cat] = result.secure_url;
  console.log(`  Uploaded: ${cat} -> ${result.secure_url}`);
}

// Also re-upload project 10's custom thumbnail
const thumb10Path = path.join(BACK_DIR, 'uploads', 'projects', 'project_1783405303578_853408975.jpg');
if (fs.existsSync(thumb10Path)) {
  try {
    await cloudinary.uploader.destroy('uploads/projects/project_1784015283618_thumb_10');
  } catch (e) {}
  const result = await cloudinary.uploader.upload(thumb10Path, {
    folder: 'uploads/projects',
    resource_type: 'image',
    public_id: 'project_thumb_10',
    overwrite: true,
  });
  coverMap['__custom_10__'] = result.secure_url;
  console.log(`  Uploaded project 10 thumbnail -> ${result.secure_url}`);
}

// Update all projects
console.log('\nUpdating database...');
const [projects] = await userDB.query('SELECT id, category FROM projects ORDER BY id');
let updated = 0;
for (const p of projects) {
  let url;
  if (p.id === 10 && coverMap['__custom_10__']) {
    url = coverMap['__custom_10__'];
  } else if (coverMap[p.category]) {
    url = coverMap[p.category];
  } else {
    url = coverMap['Other'];
  }
  await userDB.query('UPDATE projects SET thumbnail = ? WHERE id = ?', [url, p.id]);
  updated++;
  console.log(`  ID ${p.id}: updated`);
}
console.log(`\nDone. ${updated} thumbnails updated.`);

await userDB.end();
