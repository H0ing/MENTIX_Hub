import { userDB } from '../src/db/pool.js';
import cloudinary from '../src/config/cloudinary.js';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACK_DIR = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(BACK_DIR, 'uploads');
const TEMP_DIR = path.join(os.tmpdir(), 'mentix-media');

const FOLDER_DEFAULTS = path.join(UPLOADS_DIR, 'default-covers');
const FOLDER_PROJECTS = path.join(UPLOADS_DIR, 'projects');

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

async function uploadFile(filePath, folder, resourceType, publicId) {
  if (!fs.existsSync(filePath)) return null;
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
    public_id: publicId,
    overwrite: true,
  });
  return result;
}

async function main() {
  console.log('=== Step 1: Upload default cover images to Cloudinary ===\n');
  const coverMap = {};
  for (const [category, filename] of Object.entries(categoryDefaultMap)) {
    const filePath = path.join(FOLDER_DEFAULTS, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`  [MISS] ${filename} not found, skipping`);
      continue;
    }
    const publicId = `default-covers/${path.parse(filename).name}`;
    const result = await uploadFile(filePath, 'default-covers', 'image', publicId);
    if (result) {
      coverMap[category] = result.secure_url;
      console.log(`  [OK]   ${filename} -> ${result.secure_url}`);
    }
  }

  console.log('\n=== Step 2: Update project thumbnails ===\n');
  const [projects] = await userDB.query('SELECT id, title, category, thumbnail FROM projects ORDER BY id');
  let updated = 0;

  for (const p of projects) {
    if (p.thumbnail && p.thumbnail.startsWith('http')) {
      continue;
    }

    let newThumbnail = null;

    if (p.thumbnail && p.thumbnail.startsWith('/uploads/projects/')) {
      const localFile = path.join(FOLDER_PROJECTS, path.basename(p.thumbnail));
      if (fs.existsSync(localFile)) {
        console.log(`  [UPLOAD] ID ${p.id}: custom thumbnail ${path.basename(p.thumbnail)}`);
        const result = await uploadFile(localFile, 'uploads/projects', 'image', `project_${Date.now()}_thumb_${p.id}`);
        if (result) newThumbnail = result.secure_url;
      }
    }

    if (!newThumbnail && coverMap[p.category]) {
      newThumbnail = coverMap[p.category];
    }

    if (newThumbnail) {
      await userDB.query('UPDATE projects SET thumbnail = ? WHERE id = ?', [newThumbnail, p.id]);
      console.log(`  [UPDATE] ID ${p.id}: thumbnail set to ${newThumbnail}`);
      updated++;
    }
  }

  console.log(`\n  Thumbnails updated: ${updated}\n`);

  console.log('=== Step 3: Upload any remaining local project files to Cloudinary ===\n');
  const [localFiles] = await userDB.query("SELECT id, title, file_path, file_name FROM projects WHERE file_path IS NOT NULL AND file_path NOT LIKE 'http%'");
  if (localFiles.length === 0) {
    console.log('  No local project files remaining.\n');
  } else {
    for (const r of localFiles) {
      const localPath = r.file_path;
      if (fs.existsSync(localPath)) {
        console.log(`  [UPLOAD] ID ${r.id}: ${path.basename(localPath)}`);
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'uploads/projects',
          resource_type: 'raw',
          public_id: `project_${Date.now()}_${r.id}`
        });
        await userDB.query(
          'UPDATE projects SET file_name = ?, file_path = ?, file_size = ? WHERE id = ?',
          [result.public_id, result.secure_url, result.bytes, r.id]
        );
        console.log(`  -> ${result.secure_url}`);
      } else {
        console.log(`  [MISS] ID ${r.id}: ${localPath} not found on disk`);
      }
    }
  }

  const [t] = await userDB.query('SELECT COUNT(*) AS c FROM projects WHERE thumbnail LIKE "http%"');
  const [tf] = await userDB.query('SELECT COUNT(*) AS c FROM projects WHERE file_path LIKE "http%"');
  console.log(`\n=== Final: ${t[0].c}/32 projects with Cloudinary thumbnails, ${tf[0].c}/32 with Cloudinary files ===`);

  await userDB.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
