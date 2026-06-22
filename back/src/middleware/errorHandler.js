import logger from '../utils/logger.js';
import config from '../config/env.js';

export function errorHandler(err, req, res, next) {
  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.isOperational = true;
  }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  logger.error('Error occurred', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user ? req.user.id : null
  });
  
  if (config.env === 'development') {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      error: err
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors || null
      });
    } else {
      logger.error('Unexpected error', {
        message: err.message,
        stack: err.stack
      });
      
      res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.'
      });
    }
  }
}