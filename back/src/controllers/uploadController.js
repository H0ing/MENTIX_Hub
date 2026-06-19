import path from 'path';
import { fileURLToPath } from 'url';
import * as fileRepo from '../repositories/fileRepository.js';
import { findById as findUserById, updateProfile } from '../repositories/userRepository.js';
import { findById as findProjectById, updateFile, updateThumbnail } from '../repositories/projectRepository.js';
import AppError from '../utils/AppError.js';
import { success, created } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadAvatar(req, res) {
  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  const userId = req.user.id;
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const userResult = await findUserById(userId);
  const currentUser = userResult.rows[0];

  await updateProfile(userId, {
    full_name: currentUser.full_name,
    bio: currentUser.bio,
    website: currentUser.website,
    github: currentUser.github,
    twitter: currentUser.twitter,
    linkedin: currentUser.linkedin,
    avatar_url: avatarUrl
  });

  await fileRepo.saveFile({
    user_id: userId,
    filename: req.file.filename,
    original_name: req.file.originalname,
    mime_type: req.file.mimetype,
    file_size: req.file.size,
    file_path: req.file.path,
    upload_type: 'avatar'
  });

  success(res, { avatar_url: avatarUrl }, 'Avatar uploaded successfully');
}

async function uploadProjectFile(req, res) {
  const { projectId } = req.params;

  const projectResult = await findProjectById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (project.author_id !== req.user.id) {
    throw new AppError('You do not have permission to upload files to this project', 403);
  }

  if (!req.file) {
    throw new AppError('Please upload a ZIP file', 400);
  }

  const { filename, path: filePath, originalname, size } = req.file;

  await updateFile(projectId, {
    file_name: filename,
    file_path: filePath,
    file_original_name: originalname,
    file_size: size
  });

  await fileRepo.saveFile({
    user_id: req.user.id,
    filename,
    original_name: originalname,
    mime_type: req.file.mimetype,
    file_size: size,
    file_path: filePath,
    upload_type: 'project_file'
  });

  success(res, { file_name: filename, file_original_name: originalname, file_size: size }, 'Project file uploaded successfully');
}

async function uploadProjectThumbnail(req, res) {
  const { projectId } = req.params;

  const projectResult = await findProjectById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (project.author_id !== req.user.id) {
    throw new AppError('You do not have permission to update this project', 403);
  }

  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  const thumbnailPath = `/uploads/projects/${req.file.filename}`;
  await updateThumbnail(projectId, thumbnailPath);

  await fileRepo.saveFile({
    user_id: req.user.id,
    filename: req.file.filename,
    original_name: req.file.originalname,
    mime_type: req.file.mimetype,
    file_size: req.file.size,
    file_path: req.file.path,
    upload_type: 'project_thumbnail'
  });

  success(res, { thumbnail: thumbnailPath }, 'Thumbnail uploaded successfully');
}

export {
  uploadAvatar,
  uploadProjectFile,
  uploadProjectThumbnail
};
