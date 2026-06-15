import AppError from '../utils/AppError.js';

export function validate(schema) {
  return function(req, res, next) {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });
    
    if (error) {
      const errors = error.details.map(function(detail) {
        return {
          field: detail.path.join('.'),
          message: detail.message
        };
      });
      
      throw new AppError('Validation failed', 400, errors);
    }
    
    req.body = value;
    next();
  };
}