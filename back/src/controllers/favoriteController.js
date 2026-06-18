import { addFavorite, removeFavorite, findFavorite, findByUserId } from '../repositories/favoriteRepository.js';
import { findById } from '../repositories/projectRepository.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function addFavoriteFn(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  const projectResult = await findById(projectId);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const existing = await findFavorite(userId, projectId);
  if (existing.rows.length > 0) {
    throw new AppError('Project already in favorites', 409);
  }

  await addFavorite(userId, projectId);
  created(res, null, 'Project added to favorites');
}

async function removeFavoriteFn(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  const existing = await findFavorite(userId, projectId);
  if (!existing.rows.length) {
    throw new AppError('Project not in favorites', 404);
  }

  await removeFavorite(userId, projectId);
  success(res, null, 'Project removed from favorites');
}

async function getMyFavorites(req, res) {
  const userId = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const result = await findByUserId(userId, { page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function checkFavorite(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  const existing = await findFavorite(userId, projectId);

  success(res, { isFavorited: existing.rows.length > 0 });
}

export {
  addFavoriteFn as addFavorite,
  removeFavoriteFn as removeFavorite,
  getMyFavorites,
  checkFavorite
};
