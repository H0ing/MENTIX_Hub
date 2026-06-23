import { verifyAccessToken } from '../utils/jwt.js';
import { user } from '../db/query.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

const authenticate = catchAsync(async function(req, res, next) {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw new AppError('You are not logged in. Please log in to access this resource.', 401);
  }
  
  const decoded = await verifyAccessToken(token);
  const result = await user('SELECT id, username, email, role, status, token_version, full_name, avatar_url FROM users WHERE id = ?', [decoded.userId]);
  if (!result.rows.length) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }
  
  const currentUser = result.rows[0];
  
  if (currentUser.status === 'banned') {
    throw new AppError('Your account has been banned. Please contact support for assistance.', 403);
  }
  
  if (currentUser.status === 'suspended') {
    throw new AppError('Your account has been suspended. Please contact support for assistance.', 403);
  }
  
  if (currentUser.token_version !== decoded.version) {
    throw new AppError('Token is no longer valid. Please log in again.', 401);
  }
  
  req.user = currentUser;
  next();
});

export default authenticate;