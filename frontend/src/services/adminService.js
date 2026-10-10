import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  createMovie: (movie) => api.post('/movies', movie),
};
