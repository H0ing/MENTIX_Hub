import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { findById as findUserById } from '../repositories/userRepository.js';
import { findById as findProjectById } from '../repositories/projectRepository.js';
import AppError from '../utils/AppError.js';
import { success } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

async function downloadAvatar(req, res) {
  const { userId } = req.params;

  const userResult = await findUserById(userId);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  const user = userResult.rows[0];
  if (!user.avatar_url) {
    throw new AppError('User has no avatar', 404);
  }

  const filePath = path.resolve(uploadsDir, 'avatars', path.basename(user.avatar_url));
  if (!fs.existsSync(filePath)) {
    throw new AppError('Avatar file not found', 404);
  }

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath);
}

async function downloadProjectFile(req, res) {
  const { projectId } = req.params;

  const projectResult = await findProjectById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (!project.file_path) {
    throw new AppError('Project has no file', 404);
  }

  const filePath = path.resolve(project.file_path);
  if (!fs.existsSync(filePath)) {
    throw new AppError('Project file not found on disk', 404);
  }

  const downloadName = project.file_original_name || `${project.title}.zip`;
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.sendFile(filePath);
}

async function downloadProjectThumbnail(req, res) {
  const { projectId } = req.params;

  const projectResult = await findProjectById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (!project.thumbnail) {
    throw new AppError('Project has no thumbnail', 404);
  }

  const filePath = path.resolve(uploadsDir, 'projects', path.basename(project.thumbnail));
  if (!fs.existsSync(filePath)) {
    throw new AppError('Thumbnail file not found', 404);
  }

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath);
}

export {
  downloadAvatar,
  downloadProjectFile,
  downloadProjectThumbnail
};
