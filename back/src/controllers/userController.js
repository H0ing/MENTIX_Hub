import { user } from '../db/query.js';
import * as userRepository from '../repositories/userRepository.js';
import * as projectRepository from '../repositories/projectRepository.js';
import { success, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getProfile = catchAsync(async (req, res, next) => {
  const result = await userRepository.findById(req.user.id);

  if (!result.rows.length) {
    throw new AppError('User not found', 404);
  }

  const countResult = await user('SELECT COUNT(*) as total FROM projects WHERE author_id = ?', [req.user.id]);
  const projectCount = countResult.rows[0].total;

  const userData = result.rows[0];
  delete userData.password_hash;

  success(res, { ...userData, project_count: projectCount });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const current = await userRepository.findById(req.user.id);

  if (!current.rows.length) {
    throw new AppError('User not found', 404);
  }

  const existing = current.rows[0];

  const merged = {
    username: req.body.username !== undefined ? req.body.username : existing.username,
    full_name: req.body.full_name !== undefined ? req.body.full_name : existing.full_name,
    bio: req.body.bio !== undefined ? req.body.bio : existing.bio,
    github: req.body.github !== undefined ? req.body.github : existing.github,
    twitter: req.body.twitter !== undefined ? req.body.twitter : existing.twitter,
    linkedin: req.body.linkedin !== undefined ? req.body.linkedin : existing.linkedin,
    avatar_url: req.body.avatar_url !== undefined ? req.body.avatar_url : existing.avatar_url
  };

  if (merged.username !== existing.username) {
    const existingUser = await userRepository.findByUsername(merged.username);
    if (existingUser.rows.length) {
      throw new AppError('Username is already taken.', 409);
    }
  }

  await userRepository.updateProfile(req.user.id, merged);

  const result = await userRepository.findById(req.user.id);
  const userData = result.rows[0];
  delete userData.password_hash;

  success(res, userData, 'Profile updated successfully');
});

export const listUsers = catchAsync(async (req, res, next) => {
  const { role, search, sort } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const result = await userRepository.findAll({ page, limit, offset, role, search, sort });

  const safeUsers = result.rows.map(({ password_hash, token_version, ...rest }) => rest);

  paginated(res, { rows: safeUsers, count: result.count, page, limit });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await user(
    `SELECT id, username, full_name, bio, avatar_url, github, twitter, linkedin,
            role, created_at
     FROM users WHERE id = ?`,
    [id]
  );

  if (!result.rows.length) {
    throw new AppError('User not found', 404);
  }

  success(res, result.rows[0]);
});

export const getUserProjects = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userResult = await user('SELECT id FROM users WHERE id = ?', [id]);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  const page = parseInt(req.query.page, 10)  ;
  const limit = parseInt(req.query.limit, 10);
  const offset = (page - 1) * limit;

  const result = await projectRepository.findAll({
    author_id: id,
    page,
    limit,
    offset
  });

  success(res, {
    projects: result.rows,
    pagination: {
      page,
      limit,
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      hasNextPage: page < Math.ceil(result.count / limit),
      hasPrevPage: page > 1
    }
  });
});