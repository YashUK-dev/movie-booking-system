import { Seat } from '../models/Seat.js';
import { Screen } from '../models/Screen.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

export class SeatService {
  static async createSeat(screenId, seatData) {
    const screen = await Screen.findById(screenId);
    if (!screen) {
      throw new ApiError(404, 'Screen not found', 'SCREEN_NOT_FOUND');
    }
    
    try {
      const seat = await Seat.create({ ...seatData, screenId });
      
      // Update screen total seats
      await Screen.findByIdAndUpdate(screenId, { $inc: { totalSeats: 1 } });
      
      return seat;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, 'Seat already exists for this screen', 'SEAT_EXISTS');
      }
      throw error;
    }
  }

  static async bulkCreateSeats(screenId, seatsData) {
    const screen = await Screen.findById(screenId);
    if (!screen) {
      throw new ApiError(404, 'Screen not found', 'SCREEN_NOT_FOUND');
    }

    const seatsToInsert = seatsData.map(seat => ({ ...seat, screenId }));
    
    try {
      const insertedSeats = await Seat.insertMany(seatsToInsert, { ordered: false });
      
      // Update screen total seats
      await Screen.findByIdAndUpdate(screenId, { $inc: { totalSeats: insertedSeats.length } });
      
      return insertedSeats;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, 'One or more seats already exist', 'SEAT_EXISTS');
      }
      throw error;
    }
  }

  static async getSeatsByScreen(screenId) {
    return await Seat.find({ screenId }).sort({ row: 1, seatNumber: 1 });
  }

  static async updateSeat(seatId, updateData) {
    try {
      const seat = await Seat.findByIdAndUpdate(seatId, updateData, {
        new: true,
        runValidators: true,
      });
      if (!seat) {
        throw new ApiError(404, 'Seat not found', 'SEAT_NOT_FOUND');
      }
      return seat;
    } catch (error) {
       if (error.code === 11000) {
        throw new ApiError(409, 'Seat row and number already exists for this screen', 'SEAT_EXISTS');
      }
      throw error;
    }
  }

  static async deleteSeat(seatId) {
    const seat = await Seat.findByIdAndDelete(seatId);
    if (!seat) {
      throw new ApiError(404, 'Seat not found', 'SEAT_NOT_FOUND');
    }
    // Update screen total seats
    await Screen.findByIdAndUpdate(seat.screenId, { $inc: { totalSeats: -1 } });
    return seat;
  }
}
