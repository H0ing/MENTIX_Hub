import {
  create as createProject, findById, findAll, update as updateProject,
  deleteById, incrementViewCount, updateFile, updateThumbnail
} from '../repositories/projectRepository.js';
import { addHeart, removeHeart, findHeart, findByUserId as findHeartsByUserId } from '../repositories/heartRepository.js';
import { findFavorite } from '../repositories/favoriteRepository.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';
import { verifyAccessToken } from '../utils/jwt.js';

async function create(req, res) {
  const { title, description, tags, external_links } = req.body;
  const author_id = req.user.id;

  const result = await createProject({ title, description, author_id, tags, external_links });

  const projectId = result.rows.insertId;
  const projectResult = await findById(projectId);

  created(res, projectResult.rows[0], 'Project created successfully');
}

async function getAll(req, res) {
  const { search, tags, sort, author_id } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const tagsArray = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;

  const result = await findAll({ page, limit, offset, search, tags: tagsArray, author_id, sort });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getById(req, res) {
  const { id } = req.params;

  let currentUserId = null;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = await verifyAccessToken(token);
      currentUserId = decoded.userId;
    }
  } catch (e) {

  }

  const projectResult = await findById(id);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  let isHearted = false;
  let isFavorited = false;

  if (currentUserId) {
    const heartResult = await findHeart(currentUserId, id);
    isHearted = heartResult.rows.length > 0;

    const favResult = await findFavorite(currentUserId, id);
    isFavorited = favResult.rows.length > 0;
  }

  await incrementViewCount(id);

  success(res, { ...project, isHearted, isFavorited });
}

async function update(req, res) {
  const { id } = req.params;

  const projectResult = await findById(id);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (project.author_id !== req.user.id) {
    throw new AppError('You do not have permission to update this project', 403);
  }

  const { title, description, tags, external_links } = req.body;
  await updateProject(id, { title, description, tags, external_links });

  const updatedProject = await findById(id);
  success(res, updatedProject.rows[0], 'Project updated successfully');
}

async function deleteProject(req, res) {
  const { id } = req.params;

  const projectResult = await findById(id);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const project = projectResult.rows[0];
  if (project.author_id !== req.user.id) {
    throw new AppError('You do not have permission to delete this project', 403);
  }

  await deleteById(id);
  success(res, null, 'Project deleted successfully');
}

async function toggleHeart(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  const projectResult = await findById(id);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const existingHeart = await findHeart(userId, id);

  if (existingHeart.rows.length > 0) {
    await removeHeart(userId, id);
    success(res, { isHearted: false }, 'Heart removed successfully');
  } else {
    await addHeart(userId, id);
    success(res, { isHearted: true }, 'Heart added successfully');
  }
}

async function getHeartedProjects(req, res) {
  const userId = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const result = await findHeartsByUserId(userId, { page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function uploadFile(req, res) {
  const { id } = req.params;

  const projectResult = await findById(id);
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

  await updateFile(id, {
    file_name: filename,
    file_path: filePath,
    file_original_name: originalname,
    file_size: size
  });

  success(res, { file_name: filename, file_original_name: originalname, file_size: size }, 'File uploaded successfully');
}

async function uploadThumbnail(req, res) {
  const { id } = req.params;

  const projectResult = await findById(id);
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
  await updateThumbnail(id, thumbnailPath);

  success(res, { thumbnail: thumbnailPath }, 'Thumbnail uploaded successfully');
}

export {
  create,
  getAll,
  getById,
  update,
  deleteProject as delete,
  toggleHeart,
  getHeartedProjects,
  uploadFile,
  uploadThumbnail
};
