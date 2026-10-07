import { ScreenService } from '../services/screen.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ScreenController {
  static createScreen = asyncHandler(async (req, res) => {
    const screen = await ScreenService.createScreen(req.params.theatreId, req.body);
    res.status(201).json(new ApiResponse(201, 'Screen created successfully', screen));
  });

  static getScreensByTheatre = asyncHandler(async (req, res) => {
    const screens = await ScreenService.getScreensByTheatre(req.params.theatreId);
    res.status(200).json(new ApiResponse(200, 'Screens fetched successfully', screens));
  });

  static updateScreen = asyncHandler(async (req, res) => {
    const screen = await ScreenService.updateScreen(req.params.screenId, req.body);
    res.status(200).json(new ApiResponse(200, 'Screen updated successfully', screen));
  });

  static deleteScreen = asyncHandler(async (req, res) => {
    await ScreenService.deleteScreen(req.params.screenId);
    res.status(204).send();
  });
}
