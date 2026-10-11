import api from './api';

export const movieService = {
  // GET /movies accepts query params: search, genre, language, status, page, limit
  getMovies: (params = {}) => api.get('/movies', { params }),
  getMovieById: (movieId) => api.get(`/movies/${movieId}`),
  updateMovie: (movieId, movie) => api.patch(`/movies/${movieId}`, movie),
  deleteMovie: (movieId) => api.delete(`/movies/${movieId}`),
};
