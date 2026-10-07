import { BookingService } from '../services/booking.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, getPaginationResponse } from '../utils/pagination.js';

export class BookingController {
  static createBooking = asyncHandler(async (req, res) => {
    const { showId, seatIds } = req.body;
    const booking = await BookingService.createBooking(req.user.userId, showId, seatIds);
    res.status(201).json(new ApiResponse(201, 'Booking created successfully', booking));
  });

  static getBookings = asyncHandler(async (req, res) => {
    const paginationParams = getPagination(req.query);
    const { bookings, total } = await BookingService.getBookings(req.user.userId, req.user.role, req.query, paginationParams);
    
    res.status(200).json(
      new ApiResponse(
        200, 
        'Bookings fetched successfully', 
        bookings, 
        getPaginationResponse(paginationParams.page, paginationParams.limit, total)
      )
    );
  });

  static getBookingById = asyncHandler(async (req, res) => {
    const booking = await BookingService.getBookingById(req.params.bookingId, req.user.userId, req.user.role);
    res.status(200).json(new ApiResponse(200, 'Booking details fetched successfully', booking));
  });

  static cancelBooking = asyncHandler(async (req, res) => {
    const booking = await BookingService.cancelBooking(req.params.bookingId, req.user.userId, req.user.role);
    res.status(200).json(new ApiResponse(200, 'Booking cancelled successfully', booking));
  });
}
