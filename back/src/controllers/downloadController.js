import path from 'path';
import { findById as findUserById } from '../repositories/userRepository.js';
import { findById as findProjectById } from '../repositories/projectRepository.js';
import cloudinary from '../config/cloudinary.js';
import config from '../config/env.js';
import AppError from '../utils/AppError.js';

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

  res.redirect(user.avatar_url);
}

async function downloadProjectFile(req, res) {
  const { projectId } = req.params;

  const projectResult = await findProjectById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (!project.file_name) {
    throw new AppError('Project has no file', 404);
  }

  const ext = path.extname(project.file_original_name || '.zip').slice(1) || 'zip';
  const filename = project.file_original_name || `${project.title}.zip`;
  const timestamp = Math.floor(Date.now() / 1000);

  const params = { public_id: project.file_name, format: ext, type: 'upload', attachment: true, timestamp };
  const signature = cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);

  const baseQs = new URLSearchParams({ ...params, api_key: config.cloudinary.apiKey, signature });
  const downloadUrl = `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/raw/download?${baseQs}&filename=${encodeURIComponent(filename)}`;

  res.redirect(downloadUrl);
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

  res.redirect(project.thumbnail);
}

export {
  downloadAvatar,
  downloadProjectFile,
  downloadProjectThumbnail
};
