import { Booking } from '../models/Booking.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { Show } from '../models/Show.js';
import { ApiError } from '../utils/ApiError.js';
import { generateBookingId } from '../utils/generateBookingId.js';
import { config } from '../config/env.js';
import mongoose from 'mongoose';

export class BookingService {
  static async createBooking(userId, showId, seatIds) {
    const show = await Show.findById(showId);
    if (!show) {
      throw new ApiError(404, 'Show not found', 'SHOW_NOT_FOUND');
    }

    if (show.status !== 'SCHEDULED' && show.status !== 'ONGOING') {
       throw new ApiError(400, 'Cannot book seats for this show', 'INVALID_SHOW_STATUS');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Ensure seats belong to current user's lock
      const lockedSeats = await ShowSeat.find({
        showId,
        seatId: { $in: seatIds },
        lockedBy: userId,
        status: 'LOCKED',
        lockedUntil: { $gt: new Date() }
      }).populate('seatId').session(session);

      if (lockedSeats.length !== seatIds.length) {
        throw new ApiError(400, 'One or more seats are not locked by you or the lock has expired', 'SEAT_LOCK_EXPIRED');
      }

      // 2. Calculate prices
      let subtotal = 0;
      const seatSnapshots = lockedSeats.map(ls => {
        subtotal += ls.price;
        return {
          seatId: ls.seatId._id,
          row: ls.seatId.row,
          seatNumber: ls.seatId.seatNumber,
          seatType: ls.seatId.seatType,
          price: ls.price,
        };
      });

      const convenienceFee = config.bookingConvenienceFee * seatIds.length;
      const totalAmount = subtotal + convenienceFee;

      // 3. Create Pending Booking
      const booking = await Booking.create([{
        bookingNumber: generateBookingId(),
        userId,
        showId,
        seats: seatSnapshots,
        subtotal,
        convenienceFee,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      }], { session });

      // 4. Link Booking ID to ShowSeats
      await ShowSeat.updateMany(
        { _id: { $in: lockedSeats.map(ls => ls._id) } },
        { $set: { bookingId: booking[0]._id } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return booking[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getBookings(userId, role, query, pagination) {
    const filter = {};
    
    // Users can only see their own, Admins can see all
    if (role !== 'ADMIN') {
      filter.userId = userId;
    } else if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl language format' },
          { path: 'screenId', select: 'name', populate: { path: 'theatreId', select: 'name city' } }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return { bookings, total };
  }

  static async getBookingById(bookingId, userId, role) {
    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl language format' },
          { path: 'screenId', select: 'name', populate: { path: 'theatreId', select: 'name city address facilities' } }
        ]
      });

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
    }

    if (role !== 'ADMIN' && booking.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to view this booking', 'UNAUTHORIZED');
    }

    return booking;
  }

  static async cancelBooking(bookingId, userId, role) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).populate('showId').session(session);
      
      if (!booking) {
        throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
      }

      if (role !== 'ADMIN' && booking.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'Not authorized to cancel this booking', 'UNAUTHORIZED');
      }

      if (booking.status === 'CANCELLED') {
        throw new ApiError(400, 'Booking is already cancelled', 'ALREADY_CANCELLED');
      }

      // Check cancellation rules (e.g. 2 hours before show)
      const showStartTime = new Date(booking.showId.startTime);
      const now = new Date();
      const hoursDifference = (showStartTime - now) / (1000 * 60 * 60);

      if (hoursDifference < 2) {
        throw new ApiError(400, 'Cancellation not allowed within 2 hours of show time', 'CANCELLATION_NOT_ALLOWED');
      }

      // Update Booking
      booking.status = 'CANCELLED';
      if (booking.paymentStatus === 'SUCCESS') {
        booking.paymentStatus = 'REFUNDED';
      }
      booking.cancelledAt = new Date();
      await booking.save({ session });

      // Release Seats
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

      await session.commitTransaction();
      session.endSession();

      return booking;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
