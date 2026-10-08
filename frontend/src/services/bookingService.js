import api from './api';

export const bookingService = {
  // POST /bookings body: { showId, seatIds }
  createBooking: (showId, seatIds) => api.post('/bookings', { showId, seatIds }),
  getUserBookings: (params = {}) => api.get('/bookings', { params }),
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),
  cancelBooking: (bookingId) => api.post(`/bookings/${bookingId}/cancel`),
};
