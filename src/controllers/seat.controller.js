import { SeatService } from '../services/seat.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class SeatController {
  static createSeat = asyncHandler(async (req, res) => {
    const seat = await SeatService.createSeat(req.params.screenId, req.body);
    res.status(201).json(new ApiResponse(201, 'Seat created successfully', seat));
  });

  static bulkCreateSeats = asyncHandler(async (req, res) => {
    const seats = await SeatService.bulkCreateSeats(req.params.screenId, req.body.seats);
    res.status(201).json(new ApiResponse(201, 'Seats created successfully', seats));
  });

  static getSeatsByScreen = asyncHandler(async (req, res) => {
    const seats = await SeatService.getSeatsByScreen(req.params.screenId);
    res.status(200).json(new ApiResponse(200, 'Seats fetched successfully', seats));
  });

  static updateSeat = asyncHandler(async (req, res) => {
    const seat = await SeatService.updateSeat(req.params.seatId, req.body);
    res.status(200).json(new ApiResponse(200, 'Seat updated successfully', seat));
  });

  static deleteSeat = asyncHandler(async (req, res) => {
    await SeatService.deleteSeat(req.params.seatId);
    res.status(204).send();
  });
}
