import { Screen } from '../models/Screen.js';
import { Theatre } from '../models/Theatre.js';
import { ApiError } from '../utils/ApiError.js';

export class ScreenService {
  static async createScreen(theatreId, screenData) {
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      throw new ApiError(404, 'Theatre not found', 'THEATRE_NOT_FOUND');
    }
    return await Screen.create({ ...screenData, theatreId });
  }

  static async getScreensByTheatre(theatreId) {
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      throw new ApiError(404, 'Theatre not found', 'THEATRE_NOT_FOUND');
    }
    return await Screen.find({ theatreId });
  }

  static async updateScreen(screenId, updateData) {
    const screen = await Screen.findByIdAndUpdate(screenId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!screen) {
      throw new ApiError(404, 'Screen not found', 'SCREEN_NOT_FOUND');
    }
    return screen;
  }

  static async deleteScreen(screenId) {
    const screen = await Screen.findByIdAndDelete(screenId);
    if (!screen) {
      throw new ApiError(404, 'Screen not found', 'SCREEN_NOT_FOUND');
    }
    return screen;
  }
}
