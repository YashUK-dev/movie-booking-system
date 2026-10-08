import api from './api';

export const movieService = {
  // GET /movies accepts query params: search, genre, language, status, page, limit
  getMovies: (params = {}) => api.get('/movies', { params }),
  getMovieById: (movieId) => api.get(`/movies/${movieId}`),
};
