import api from './api';

export const showService = {
  // GET /shows accepts query params: movieId, screenId, status, date, page, limit
  getShows: (params = {}) => api.get('/shows', { params }),
  getShowDetails: (showId) => api.get(`/shows/${showId}`),
  getShowSeats: (showId) => api.get(`/shows/${showId}/seats`),
  lockSeats: (showId, seatIds) => api.post(`/shows/${showId}/seats/lock`, { seatIds }),
};
