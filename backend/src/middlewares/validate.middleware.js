// import { AnyZodObject } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    const issues = error.issues || error.errors || [];
    if (issues.length > 0) {
      const errorMessages = issues
        .map((err) => {
          const path = Array.isArray(err.path)
            ? err.path.filter((p) => !['body', 'query', 'params'].includes(p)).join('.')
            : '';
          return path ? `${path}: ${err.message}` : err.message;
        })
        .join(', ');
      return next(new ApiError(422, `Validation failed: ${errorMessages}`, 'VALIDATION_ERROR'));
    }
    return next(new ApiError(422, error.message || 'Validation failed', 'VALIDATION_ERROR'));
  }
};
