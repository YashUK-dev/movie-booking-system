import { MovieService } from '../services/movie.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, getPaginationResponse } from '../utils/pagination.js';

export class MovieController {
  static createMovie = asyncHandler(async (req, res) => {
    const movie = await MovieService.createMovie(req.body);
    res.status(201).json(new ApiResponse(201, 'Movie created successfully', movie));
  });

  static getMovies = asyncHandler(async (req, res) => {
    const paginationParams = getPagination(req.query);
    const { movies, total } = await MovieService.getMovies(req.query, paginationParams);
    
    res.status(200).json(
      new ApiResponse(
        200, 
        'Movies fetched successfully', 
        movies, 
        getPaginationResponse(paginationParams.page, paginationParams.limit, total)
      )
    );
  });

  static getMovieById = asyncHandler(async (req, res) => {
    const movie = await MovieService.getMovieById(req.params.movieId);
    res.status(200).json(new ApiResponse(200, 'Movie fetched successfully', movie));
  });

  static updateMovie = asyncHandler(async (req, res) => {
    const movie = await MovieService.updateMovie(req.params.movieId, req.body);
    res.status(200).json(new ApiResponse(200, 'Movie updated successfully', movie));
  });

  static deleteMovie = asyncHandler(async (req, res) => {
    await MovieService.deleteMovie(req.params.movieId);
    res.status(204).send();
  });
}
