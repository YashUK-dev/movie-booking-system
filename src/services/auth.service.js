import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateTokens = (userId, role) => {
  const payload = { userId, role };
  
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration,
  });
  
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration,
  });

  return { accessToken, refreshToken };
};

export class AuthService {
  static async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      passwordHash: userData.password, // hashed in pre-save hook
      role: 'USER', // explicitly set role to USER, prevent injection
    });

    const tokens = generateTokens(user._id, user.role);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account has been deactivated', 'ACCOUNT_DEACTIVATED');
    }

    const tokens = generateTokens(user._id, user.role);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid refresh token or inactive user', 'INVALID_REFRESH_TOKEN');
      }

      const tokens = generateTokens(user._id, user.role);
      return tokens;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  static async getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash -__v');
    if (!user) {
      throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    }
    
    // Transform to friendly format
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
