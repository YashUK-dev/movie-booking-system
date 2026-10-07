import { ApiError } from '../utils/ApiError.js';

export const notFoundMiddleware = (req, res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
};
