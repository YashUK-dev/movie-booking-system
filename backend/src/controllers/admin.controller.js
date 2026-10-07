import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AdminController {
  static getDashboard = asyncHandler(async (req, res) => {
    const stats = await AdminService.getDashboardStats();
    res.status(200).json(new ApiResponse(200, 'Dashboard stats fetched successfully', stats));
  });
}
