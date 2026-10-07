import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route', 'UNAUTHENTICATED'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (error) {
    return next(new ApiError(401, 'Token failed or expired', 'UNAUTHENTICATED'));
  }
};
