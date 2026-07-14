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

console.log('=== Moving default covers to uploads/default-covers/ ===\n');

for (const [cat, filename] of Object.entries(categoryDefaultMap)) {
  const oldId = `default-covers/${path.parse(filename).name}`;
  try {
    await cloudinary.uploader.destroy(oldId);
    console.log(`  Deleted old: ${oldId}`);
  } catch (e) {}

  const filePath = path.join(BACK_DIR, 'uploads', 'default-covers', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  MISS: ${filename}`);
    continue;
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'uploads/default-covers',
    resource_type: 'image',
    public_id: path.parse(filename).name,
    overwrite: true,
  });
  categoryDefaultMap[cat] = result.secure_url;
  console.log(`  Uploaded: ${result.secure_url}`);
}

console.log('\n=== Updating all project thumbnails ===\n');

const [projects] = await userDB.query('SELECT id, category FROM projects ORDER BY id');
let updated = 0;
for (const p of projects) {
  let url = categoryDefaultMap[p.category] || categoryDefaultMap['Other'];
  if (p.id === 10) {
    // Project 10's custom thumbnail is already at correct path, keep it
    continue;
  }
  await userDB.query('UPDATE projects SET thumbnail = ? WHERE id = ?', [url, p.id]);
  updated++;
}
console.log(`  ${updated} projects updated (project 10 custom thumbnail kept as-is).`);

console.log('\n=== Unused images in uploads/projects/ ===');
const usedImage = 'project_1783405303578_853408975.jpg';
const allImages = [
  'project_1782664882176_651580288.png',
  'project_1782805318998_791317231.jpg',
  'project_1783239906294_747652951.png',
  usedImage,
];
const unused = allImages.filter(f => f !== usedImage);
for (const f of unused) {
  const fp = path.join(BACK_DIR, 'uploads', 'projects', f);
  console.log(`  ${f} (${(fs.statSync(fp).size / 1024).toFixed(1)} KB) - not linked to any project`);
}

console.log(`\n  Only ${usedImage} is used by project ID 10.`);

await userDB.end();
