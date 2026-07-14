import { userDB } from '../src/db/pool.js';
import cloudinary from '../src/config/cloudinary.js';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEMP_DIR = path.join(os.tmpdir(), 'mentix-sync');
const HASH = '$2b$12$FhndZKyLs84m7Nyn25RQzeMYtQ8JyRp2jF5kak1PE7aBZhaBJ6OBW';

const missingUsers = [
  { id: 23, username: 'ethan_parker',     email: 'ethan.parker@mentix.dev',     password_hash: HASH, full_name: 'Ethan Parker',       bio: 'Building full-stack web apps with React and Node.',         year: 3, major: 'Computer Engineering',   role: 'student', status: 'active', github: 'ethan_parker',  twitter: '@ethancodes',  linkedin: 'ethanparker' },
  { id: 24, username: 'isabella_cruz',    email: 'isabella.cruz@mentix.dev',    password_hash: HASH, full_name: 'Isabella Cruz',      bio: 'Data science and visualization enthusiast.',                  year: 2, major: 'Data Science',           role: 'student', status: 'active', github: 'isabella_cruz', twitter: '@isabelladata', linkedin: 'isabellacruz' },
  { id: 25, username: 'nathan_brooks',    email: 'nathan.brooks@mentix.dev',    password_hash: HASH, full_name: 'Nathan Brooks',      bio: 'DevOps and cloud infrastructure learner.',                    year: 4, major: 'Software Engineering',   role: 'student', status: 'active', github: 'nathan_brooks', twitter: '@nathancloud', linkedin: 'nathanbrooks' },
  { id: 26, username: 'aria_patel',       email: 'aria.patel@mentix.dev',       password_hash: HASH, full_name: 'Aria Patel',         bio: 'AI and machine learning beginner exploring NLP.',             year: 1, major: 'Computer Science',       role: 'student', status: 'active', github: 'aria_patel',    twitter: '@aria_ml',     linkedin: 'ariapatel' },
  { id: 27, username: 'lucas_foster',     email: 'lucas.foster@mentix.dev',     password_hash: HASH, full_name: 'Lucas Foster',       bio: 'Mobile app developer focused on cross-platform tools.',       year: 3, major: 'Information Technology', role: 'student', status: 'active', github: 'lucas_foster',  twitter: '@lucasapps',   linkedin: 'lucasfoster' },
  { id: 28, username: 'friend_user',      email: 'friend@mentix.dev',           password_hash: HASH, full_name: 'Friend User',       bio: 'User from friend backup.',                                   year: 2, major: 'Computer Science',       role: 'student', status: 'active', github: 'friend_user',  twitter: '@friend',      linkedin: 'frienduser' },
];

const newProjects = [
  { id: 12, title: 'Sign Language Translator',     description: 'Real-time ASL-to-text translation using computer vision and deep learning.',                     category: 'AI & Machine Learning', author_id: 26, tags: ['ai', 'computervision', 'tensorflow'],     external_links: null, thumbnail: '/uploads/default-covers/AI_ML.webp', view_count: 267, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 13, title: 'Cross-Platform Weather',        description: 'Weather forecast app built with Flutter and OpenWeatherMap API.',                                 category: 'Mobile Development', author_id: 27, tags: ['flutter', 'api', 'weather'],                  external_links: null, thumbnail: '/uploads/default-covers/mobile-development.jpg', view_count: 134, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 14, title: 'Infra as Code Toolkit',         description: 'Reusable Terraform and Ansible modules for cloud infrastructure provisioning.',                    category: 'DevOps', author_id: 25, tags: ['devops', 'terraform', 'ansible'],                 external_links: null, thumbnail: '/uploads/default-covers/devops.jpg', view_count: 201, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 15, title: 'Accessible UI Components',      description: 'React component library built with WCAG 2.1 AA accessibility standards.',                         category: 'UI/UX Design', author_id: 11, tags: ['react', 'accessibility', 'ui-ux'],                external_links: null, thumbnail: '/uploads/default-covers/ux_ui_design.webp', view_count: 178, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 16, title: 'Student Performance Analyzer',  description: 'ML-powered dashboard predicting student outcomes from academic data.',                            category: 'Data Science', author_id: 24, tags: ['python', 'ml', 'education'],                      external_links: null, thumbnail: '/uploads/default-covers/data_science.webp', view_count: 312, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 17, title: 'Smart Parking System',          description: 'IoT-based parking slot detection and reservation mobile application.',                             category: 'IoT', author_id: 23, tags: ['iot', 'mobile', 'sensors'],                           external_links: null, thumbnail: '/uploads/default-covers/IoT.jpg', view_count: 89, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 18, title: 'E-Commerce Microservices',      description: 'Scalable e-commerce backend built with microservices and event-driven architecture.',               category: 'Web Development', author_id: 25, tags: ['microservices', 'nodejs', 'docker'],               external_links: null, thumbnail: '/uploads/default-covers/web-development.webp', view_count: 234, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 19, title: 'AI Content Summarizer',         description: 'Browser extension that summarizes articles using fine-tuned transformer models.',                   category: 'AI & Machine Learning', author_id: 26, tags: ['ai', 'nlp', 'transformers'],                     external_links: null, thumbnail: '/uploads/default-covers/AI_ML.webp', view_count: 345, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 20, title: 'Fitness Social Network',        description: 'Cross-platform social fitness app with workout tracking and friend challenges.',                   category: 'Mobile Development', author_id: 27, tags: ['mobile', 'react-native', 'health'],                external_links: null, thumbnail: '/uploads/default-covers/mobile-development.jpg', view_count: 167, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 21, title: 'Kubernetes Cost Optimizer',     description: 'Tool that analyzes K8s cluster usage and suggests right-sizing recommendations.',                   category: 'DevOps', author_id: 15, tags: ['kubernetes', 'cloud', 'cost'],                        external_links: null, thumbnail: '/uploads/default-covers/devops.jpg', view_count: 199, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-05 15:22:48' },
  { id: 22, title: 'Motion Design Prototyper',      description: 'Figma plugin for creating and previewing micro-interactions and motion designs.',                   category: 'UI/UX Design', author_id: 11, tags: ['figma', 'design', 'animation'],                      external_links: null, thumbnail: '/uploads/default-covers/ux_ui_design.webp', view_count: 145, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 23, title: 'Genomic Data Pipeline',         description: 'Distributed pipeline for processing and analyzing large-scale genomic datasets.',                  category: 'Data Science', author_id: 24, tags: ['bioinformatics', 'pipeline', 'python'],              external_links: null, thumbnail: '/uploads/default-covers/data_science.webp', view_count: 223, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 24, title: 'Wearable Health Monitor',       description: 'Smartwatch app that tracks vitals and detects early signs of health issues.',                      category: 'IoT', author_id: 14, tags: ['iot', 'health', 'wearable'],                             external_links: null, thumbnail: '/uploads/default-covers/IoT.jpg', view_count: 276, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 25, title: 'Live Polling App',              description: 'Real-time audience polling platform with WebSocket-based live results.',                           category: 'Web Development', author_id: 9, tags: ['websocket', 'react', 'real-time'],                    external_links: null, thumbnail: '/uploads/default-covers/web-development.webp', view_count: 154, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 26, title: 'Deepfake Detection Tool',       description: 'AI model that identifies manipulated media using frequency domain analysis.',                       category: 'AI & Machine Learning', author_id: 13, tags: ['ai', 'deepfake', 'security'],                       external_links: null, thumbnail: '/uploads/default-covers/AI_ML.webp', view_count: 312, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 27, title: 'AR Shopping Companion',         description: 'Augmented reality app for trying on clothes virtually before purchasing.',                          category: 'Mobile Development', author_id: 27, tags: ['ar', 'ios', 'shopping'],                             external_links: null, thumbnail: '/uploads/default-covers/mobile-development.jpg', view_count: 198, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 28, title: 'Design Token Manager',          description: 'Centralized design token management system for multi-brand applications.',                           category: 'UI/UX Design', author_id: 11, tags: ['design-tokens', 'ui-ux', 'theming'],                   external_links: null, thumbnail: '/uploads/default-covers/ux_ui_design.webp', view_count: 89, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 22:47:53' },
  { id: 29, title: 'Serverless ETL Pipeline',       description: 'Event-driven ETL pipeline using AWS Lambda, S3, and Redshift for big data.',                        category: 'DevOps', author_id: 15, tags: ['serverless', 'aws', 'etl'],                              external_links: null, thumbnail: '/uploads/default-covers/devops.jpg', view_count: 245, created_at: '2026-07-04 21:54:40', updated_at: '2026-07-04 21:54:40' },
  { id: 30, title: 'Cambodia digital readiness',    description: 'this project show how Cambodia ready with digital',                                                category: 'Data Science', author_id: 28, tags: [], external_links: '[{"url": "", "label": ""}]',          thumbnail: '/uploads/default-covers/data_science.webp', view_count: 2, created_at: '2026-07-04 22:02:42', updated_at: '2026-07-11 16:41:39' },
  { id: 31, title: 'Mentix',                        description: 'kdnfjdf',                                                                                         category: 'Web Development', author_id: 28, tags: ['Python', 'Power BI', 'ML', 'Math'], external_links: '[]', thumbnail: '/uploads/default-covers/web-development.webp', view_count: 4, created_at: '2026-07-05 15:02:03', updated_at: '2026-07-11 16:50:41' },
  { id: 32, title: 'j fhdf',                        description: 'kdnf',                                                                                            category: 'Mobile Development', author_id: 28, tags: ['djfdj fj'], external_links: '[]',                     thumbnail: '/uploads/default-covers/mobile-development.jpg', view_count: 0, created_at: '2026-07-11 16:51:23', updated_at: '2026-07-11 16:51:23' },
];

function createFakeZip(projectId, title) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
    const zipPath = path.join(TEMP_DIR, `project_${projectId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve(zipPath));
    archive.on('error', reject);
    archive.pipe(output);
    archive.append(`${title}`, { name: 'README.txt' });
    archive.finalize();
  });
}

async function uploadToCloudinary(filePath, projectId) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'uploads/projects',
    resource_type: 'raw',
    public_id: `project_${Date.now()}_${projectId}`
  });
  return {
    file_name: result.public_id,
    file_path: result.secure_url,
    file_size: result.bytes
  };
}

async function ensureUsers() {
  const [existing] = await userDB.query('SELECT id FROM users WHERE id >= 23 AND id <= 28');
  const existingIds = new Set(existing.map(r => r.id));
  let created = 0;
  for (const u of missingUsers) {
    if (existingIds.has(u.id)) { console.log(`[SKIP] User ID ${u.id} (${u.username}) - already exists`); continue; }
    await userDB.query(
      'INSERT INTO users (id, username, email, password_hash, full_name, bio, year, major, role, status, github, twitter, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [u.id, u.username, u.email, u.password_hash, u.full_name, u.bio, u.year, u.major, u.role, u.status, u.github, u.twitter, u.linkedin]
    );
    console.log(`[CREATE] User ID ${u.id} (${u.username})`);
    created++;
  }
  return created;
}

async function main() {
  console.log('=== Step 1: Ensure reference users exist ===');
  console.log(`Users created: ${await ensureUsers()}\n`);

  console.log('=== Step 2: Insert missing projects from backup ===');
  let inserted = 0;
  for (const p of newProjects) {
    const [rows] = await userDB.query('SELECT id FROM projects WHERE id = ?', [p.id]);
    if (rows.length) { console.log(`  [SKIP] ID ${p.id} - already exists`); continue; }
    try {
      process.stdout.write(`  [INSERT] ID ${p.id}: "${p.title}" ... `);
      const zipPath = await createFakeZip(p.id, p.title);
      const cd = await uploadToCloudinary(zipPath, p.id);
      fs.unlinkSync(zipPath);
      await userDB.query(
        'INSERT INTO projects (id, title, description, category, author_id, tags, external_links, thumbnail, file_name, file_path, file_original_name, file_size, view_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.title, p.description, p.category, p.author_id, JSON.stringify(p.tags), p.external_links, p.thumbnail, cd.file_name, cd.file_path, `${p.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`, cd.file_size, p.view_count, p.created_at, p.updated_at]
      );
      console.log(`OK (${cd.file_size} B)`);
      inserted++;
    } catch (err) { console.log(`FAIL: ${err.message}`); }
  }
  console.log(`  Inserted: ${inserted}\n`);

  console.log('=== Step 3: Upload files for existing projects with NULL file_path ===');
  const [nullFiles] = await userDB.query('SELECT id, title FROM projects WHERE file_path IS NULL');
  let uploaded = 0;
  for (const r of nullFiles) {
    try {
      process.stdout.write(`  [UPLOAD] ID ${r.id}: "${r.title}" ... `);
      const zipPath = await createFakeZip(r.id, r.title);
      const cd = await uploadToCloudinary(zipPath, r.id);
      fs.unlinkSync(zipPath);
      await userDB.query(
        'UPDATE projects SET file_name = ?, file_path = ?, file_original_name = ?, file_size = ? WHERE id = ?',
        [cd.file_name, cd.file_path, `${r.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`, cd.file_size, r.id]
      );
      console.log(`OK (${cd.file_size} B)`);
      uploaded++;
    } catch (err) { console.log(`FAIL: ${err.message}`); }
  }
  console.log(`  Uploaded: ${uploaded}\n`);

  const [total] = await userDB.query('SELECT COUNT(*) AS c FROM projects');
  const [withFile] = await userDB.query('SELECT COUNT(*) AS c FROM projects WHERE file_path IS NOT NULL');
  console.log(`=== Final: ${total[0].c} projects, ${withFile[0].c} with Cloudinary files ===`);

  await userDB.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
