import api from './api';

export const showService = {
  // GET /shows accepts query params: movieId, screenId, status, date, page, limit
  getShows: (params = {}) => api.get('/shows', { params }),
  getShowDetails: (showId) => api.get(`/shows/${showId}`),
  getShowSeats: (showId) => api.get(`/shows/${showId}/seats`),
  createShow: (show) => api.post('/shows', show),
  lockSeats: (showId, seatIds) => api.post(`/shows/${showId}/seats/lock`, { seatIds }),
  updateShowStatus: (showId, status) => api.patch(`/shows/${showId}`, { status }),
};
