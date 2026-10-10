import api from './api';

export const theatreService = {
  createTheatre: (theatre) => api.post('/theatres', theatre),
  getTheatres: (params = {}) => api.get('/theatres', { params }),
  getTheatreById: (theatreId) => api.get(`/theatres/${theatreId}`),
  updateTheatre: (theatreId, theatre) => api.patch(`/theatres/${theatreId}`, theatre),
  getScreensByTheatre: (theatreId) => api.get(`/theatres/${theatreId}/screens`),
  createScreen: (theatreId, screen) => api.post(`/theatres/${theatreId}/screens`, screen),
  updateScreen: (screenId, screen) => api.patch(`/screens/${screenId}`, screen),
};
