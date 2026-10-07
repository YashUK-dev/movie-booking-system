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
    const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    return next(new ApiError(422, `Validation failed: ${errorMessages}`, 'VALIDATION_ERROR'));
  }
};
