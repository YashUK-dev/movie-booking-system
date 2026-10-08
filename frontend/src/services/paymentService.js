import api from './api';

export const paymentService = {
  // POST /payments body: { bookingId, method, mockSuccess }
  // method: 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET'
  processPayment: (bookingId, method, mockSuccess = true) =>
    api.post('/payments', { bookingId, method, mockSuccess }),
  getPaymentDetails: (paymentId) => api.get(`/payments/${paymentId}`),
};
