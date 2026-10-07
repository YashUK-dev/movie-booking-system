import { Movie } from '../models/Movie.js';
import { ApiError } from '../utils/ApiError.js';

export class MovieService {
  static async createMovie(movieData) {
    return await Movie.create(movieData);
  }

  static async getMovies(query, pagination) {
    const filter = {};
    
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.genre) {
      filter.genres = query.genre;
    }
    if (query.language) {
      filter.language = query.language;
    }
    if (query.status) {
      filter.status = query.status;
    }

    const total = await Movie.countDocuments(filter);
    const movies = await Movie.find(filter)
      .sort(query.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return { movies, total };
  }

  static async getMovieById(movieId) {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found', 'MOVIE_NOT_FOUND');
    }
    return movie;
  }

  static async updateMovie(movieId, updateData) {
    const movie = await Movie.findByIdAndUpdate(movieId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      throw new ApiError(404, 'Movie not found', 'MOVIE_NOT_FOUND');
    }
    return movie;
  }

  static async deleteMovie(movieId) {
    const movie = await Movie.findByIdAndDelete(movieId);
    if (!movie) {
      throw new ApiError(404, 'Movie not found', 'MOVIE_NOT_FOUND');
    }
    return movie;
  }
}
