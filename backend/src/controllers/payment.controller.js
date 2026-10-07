import { PaymentService } from '../services/payment.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class PaymentController {
  static processPayment = asyncHandler(async (req, res) => {
    const { bookingId, method, mockSuccess } = req.body;
    const payment = await PaymentService.processPayment(req.user.userId, bookingId, method, mockSuccess);
    res.status(201).json(new ApiResponse(201, 'Payment processed successfully', payment));
  });

  static getPaymentDetails = asyncHandler(async (req, res) => {
    const payment = await PaymentService.getPaymentDetails(req.params.paymentId, req.user.userId, req.user.role);
    res.status(200).json(new ApiResponse(200, 'Payment details fetched successfully', payment));
  });
}
