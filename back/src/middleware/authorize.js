import AppError from '../utils/AppError.js';

export function authorize(...roles) {
  return function(req, res, next) {
    if (!req.user) {
      throw new AppError('You are not logged in. Please log in to access this resource.', 401);
    }
    
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }
    
    next();
  };
}