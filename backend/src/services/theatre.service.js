import { Theatre } from '../models/Theatre.js';
import { ApiError } from '../utils/ApiError.js';

export class TheatreService {
  static async createTheatre(theatreData) {
    return await Theatre.create(theatreData);
  }

  static async getTheatres(query, pagination) {
    const filter = {};
    
    if (query.city) {
      // Case-insensitive exact or regex match
      filter.city = new RegExp(`^${query.city}$`, 'i');
    }

    const total = await Theatre.countDocuments(filter);
    const theatres = await Theatre.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return { theatres, total };
  }

  static async getTheatreById(theatreId) {
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      throw new ApiError(404, 'Theatre not found', 'THEATRE_NOT_FOUND');
    }
    return theatre;
  }

  static async updateTheatre(theatreId, updateData) {
    const theatre = await Theatre.findByIdAndUpdate(theatreId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!theatre) {
      throw new ApiError(404, 'Theatre not found', 'THEATRE_NOT_FOUND');
    }
    return theatre;
  }

  static async deleteTheatre(theatreId) {
    const theatre = await Theatre.findByIdAndDelete(theatreId);
    if (!theatre) {
      throw new ApiError(404, 'Theatre not found', 'THEATRE_NOT_FOUND');
    }
    return theatre;
  }
}
