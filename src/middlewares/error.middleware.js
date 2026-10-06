import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? error.statusCode : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, 'INTERNAL_ERROR', false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errorCode: error.errorCode,
    ...(config.env === 'development' && { stack: error.stack }),
  };

  if (error.statusCode === 500) {
    logger.error(`${error.errorCode} - ${error.message}`, { stack: error.stack });
  }

  res.status(error.statusCode).json(response);
};
