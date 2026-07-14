import { userDB } from '../src/db/pool.js';

console.log('=== Full audit of all file-related columns ===\n');

const [projects] = await userDB.query('SELECT id, title, thumbnail, file_name, file_path, file_original_name FROM projects ORDER BY id');

let thumbOk = 0, thumbLocal = 0, thumbNull = 0;
let fileOk = 0, fileLocal = 0, fileNull = 0;

for (const p of projects) {
  const tBad = p.thumbnail && !p.thumbnail.startsWith('http');
  const fBad = p.file_path && !p.file_path.startsWith('http');

  if (tBad) thumbLocal++;
  else if (!p.thumbnail) thumbNull++;
  else thumbOk++;

  if (fBad) fileLocal++;
  else if (!p.file_path) fileNull++;
  else fileOk++;

  const tStatus = !p.thumbnail ? 'NULL  ' : (tBad ? 'LOCAL ' : 'CLOUD ');
  const fStatus = !p.file_path ? 'NULL  ' : (fBad ? 'LOCAL ' : 'CLOUD ');
  console.log(`ID ${String(p.id).padEnd(3)} ${tStatus} ${fStatus} | ${p.title.slice(0,40).padEnd(42)} | thumb: ${(p.thumbnail || 'NULL').slice(0,75)}`);
}

console.log('\n--- Summary ---');
console.log(`Thumbnails:  ${thumbOk} Cloudinary, ${thumbLocal} local, ${thumbNull} NULL`);
console.log(`File paths:  ${fileOk} Cloudinary, ${fileLocal} local, ${fileNull} NULL`);

// Also check users avatar_url
console.log('\n=== Users avatar check ===');
const [users] = await userDB.query('SELECT id, username, avatar_url FROM users');
let avatarOk = 0, avatarLocal = 0, avatarNull = 0;
for (const u of users) {
  if (!u.avatar_url) avatarNull++;
  else if (u.avatar_url.startsWith('http')) avatarOk++;
  else avatarLocal++;
}
console.log(`Avatars:  ${avatarOk} Cloudinary, ${avatarLocal} local, ${avatarNull} NULL`);

// Check uploads table
console.log('\n=== Uploads table check ===');
const [uploads] = await userDB.query('SELECT COUNT(*) AS c FROM uploads');
console.log(`Uploads table has ${uploads[0].c} records`);
if (uploads[0].c > 0) {
  const [localUploads] = await userDB.query("SELECT COUNT(*) AS c FROM uploads WHERE file_path NOT LIKE 'http%'");
  console.log(`  ${localUploads[0].c} with local paths`);
}

await userDB.end();
