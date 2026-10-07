import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(new ApiResponse(201, 'User registered successfully', result));
  });

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(new ApiResponse(200, 'User logged in successfully', result));
  });

  static refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refresh(refreshToken);
    res.status(200).json(new ApiResponse(200, 'Token refreshed successfully', result));
  });

  static logout = asyncHandler(async (req, res) => {
    // In a stateless JWT setup, logout is mainly a client-side action (deleting tokens).
    // Could implement a token blacklist here if needed.
    res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
  });

  static me = asyncHandler(async (req, res) => {
    const user = await AuthService.getProfile(req.user.userId);
    res.status(200).json(new ApiResponse(200, 'User profile fetched successfully', user));
  });
}
