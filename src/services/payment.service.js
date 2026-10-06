import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

export class PaymentService {
  static async processPayment(userId, bookingId, method, mockSuccess = true) {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
    }

    if (booking.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized', 'UNAUTHORIZED');
    }

    if (booking.status !== 'PENDING') {
      throw new ApiError(400, 'Booking is not in a valid state for payment', 'INVALID_BOOKING_STATE');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create mock transaction ID
      const transactionId = `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Simulate payment gateway call
      const paymentStatus = mockSuccess ? 'SUCCESS' : 'FAILED';
      
      const payment = await Payment.create([{
        bookingId,
        userId,
        transactionId,
        amount: booking.totalAmount,
        method,
        status: paymentStatus,
        gatewayResponse: { success: mockSuccess, ref: transactionId }
      }], { session });

      if (mockSuccess) {
        // Update Booking Status
        booking.status = 'CONFIRMED';
        booking.paymentStatus = 'SUCCESS';
        booking.bookedAt = new Date();
        await booking.save({ session });

        // Update Seats Status to BOOKED
        await ShowSeat.updateMany(
          { bookingId: booking._id },
          {
            $set: {
              status: 'BOOKED',
              lockedBy: null, // Clear locks
              lockedUntil: null
            }
          },
          { session }
        );
      } else {
        // Update Booking Status to FAILED
        booking.status = 'FAILED';
        booking.paymentStatus = 'FAILED';
        await booking.save({ session });

        // Release Seats back to AVAILABLE
        await ShowSeat.updateMany(
          { bookingId: booking._id },
          {
            $set: {
              status: 'AVAILABLE',
              lockedBy: null,
              lockedUntil: null,
              bookingId: null
            }
          },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return payment[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getPaymentDetails(paymentId, userId, role) {
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }

    if (role !== 'ADMIN' && payment.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized', 'UNAUTHORIZED');
    }

    return payment;
  }
}
