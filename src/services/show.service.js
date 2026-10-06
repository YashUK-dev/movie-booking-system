import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';
import { Seat } from '../models/Seat.js';
import { Movie } from '../models/Movie.js';
import { Screen } from '../models/Screen.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';
import mongoose from 'mongoose';

export class ShowService {
  static async createShow(showData) {
    const { movieId, screenId, startTime, endTime, basePrice } = showData;

    if (new Date(startTime) >= new Date(endTime)) {
      throw new ApiError(400, 'Start time must be before end time', 'INVALID_TIMES');
    }

    const movie = await Movie.findById(movieId);
    if (!movie) throw new ApiError(404, 'Movie not found', 'MOVIE_NOT_FOUND');

    const screen = await Screen.findById(screenId);
    if (!screen) throw new ApiError(404, 'Screen not found', 'SCREEN_NOT_FOUND');

    // Overlap validation
    const overlappingShow = await Show.findOne({
      screenId,
      status: { $ne: 'CANCELLED' },
      $and: [
        { startTime: { $lt: new Date(endTime) } },
        { endTime: { $gt: new Date(startTime) } }
      ]
    });

    if (overlappingShow) {
      throw new ApiError(409, 'Screen already has a show scheduled during the requested time.', 'SHOW_OVERLAP');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const show = await Show.create([showData], { session });

      // Generate ShowSeat inventory
      const seats = await Seat.find({ screenId, isActive: true }).session(session);
      
      const showSeats = seats.map(seat => ({
        showId: show[0]._id,
        seatId: seat._id,
        status: 'AVAILABLE',
        price: basePrice * (seat.priceMultiplier || 1)
      }));

      if (showSeats.length > 0) {
        await ShowSeat.insertMany(showSeats, { session });
      }

      await session.commitTransaction();
      session.endSession();

      return show[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getShows(query, pagination) {
    const filter = {};
    if (query.movieId) filter.movieId = query.movieId;
    if (query.screenId) filter.screenId = query.screenId;
    if (query.status) filter.status = query.status;
    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.startTime = { $gte: startDate, $lt: endDate };
    }

    const total = await Show.countDocuments(filter);
    const shows = await Show.find(filter)
      .populate('movieId', 'title duration posterUrl language')
      .populate('screenId', 'name theatreId')
      .sort({ startTime: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return { shows, total };
  }

  static async getShowDetails(showId) {
    const show = await Show.findById(showId)
      .populate('movieId', 'title description language genres duration posterUrl rating')
      .populate({
        path: 'screenId',
        select: 'name theatreId',
        populate: {
          path: 'theatreId',
          model: 'Theatre',
          select: 'name city address facilities',
        }
      });

    if (!show) {
      throw new ApiError(404, 'Show not found', 'SHOW_NOT_FOUND');
    }

    // Aggregate seat availability summary
    const seatSummary = await ShowSeat.aggregate([
      { $match: { showId: show._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
          locked: { $sum: { $cond: [{ $eq: ['$status', 'LOCKED'] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ['$status', 'BOOKED'] }, 1, 0] } }
        }
      }
    ]);

    const summary = seatSummary.length > 0 ? seatSummary[0] : { total: 0, available: 0, locked: 0, booked: 0 };
    delete summary._id;

    return {
      show: {
        id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        language: show.language,
        format: show.format,
        basePrice: show.basePrice,
        status: show.status,
      },
      movie: show.movieId,
      theatre: show.screenId.theatreId,
      screen: {
        id: show.screenId._id,
        name: show.screenId.name,
      },
      seatSummary: summary
    };
  }

  static async getShowSeats(showId) {
    const showSeats = await ShowSeat.find({ showId })
      .populate('seatId', 'row seatNumber seatType priceMultiplier')
      .sort({ 'seatId.row': 1, 'seatId.seatNumber': 1 });

    // Group logically by row
    const rowsMap = {};

    showSeats.forEach(showSeat => {
      const row = showSeat.seatId.row;
      if (!rowsMap[row]) {
        rowsMap[row] = [];
      }
      rowsMap[row].push({
        seatId: showSeat.seatId._id, // This is the physical seatId
        showSeatId: showSeat._id,
        seatNumber: showSeat.seatId.seatNumber,
        type: showSeat.seatId.seatType,
        price: showSeat.price,
        status: showSeat.status,
      });
    });

    const rows = Object.keys(rowsMap).map(row => ({
      row,
      seats: rowsMap[row].sort((a, b) => a.seatNumber - b.seatNumber)
    })).sort((a, b) => a.row.localeCompare(b.row));

    return { showId, rows };
  }

  static async updateShow(showId, updateData) {
    const show = await Show.findByIdAndUpdate(showId, updateData, { new: true });
    if (!show) {
      throw new ApiError(404, 'Show not found', 'SHOW_NOT_FOUND');
    }
    return show;
  }

  static async lockSeats(showId, seatIds, userId) {
    const lockDuration = config.seatLockDurationMinutes * 60 * 1000;
    const lockedUntil = new Date(Date.now() + lockDuration);

    // Using MongoDB atomic updates to ensure we only lock AVAILABLE seats
    const result = await ShowSeat.updateMany(
      {
        showId,
        seatId: { $in: seatIds },
        status: 'AVAILABLE' // CRITICAL: only lock if available
      },
      {
        $set: {
          status: 'LOCKED',
          lockedBy: userId,
          lockedUntil
        }
      }
    );

    if (result.modifiedCount !== seatIds.length) {
      // If we couldn't lock ALL requested seats, we must rollback the partial locks
      // that we just acquired in this request.
      await ShowSeat.updateMany(
        {
          showId,
          seatId: { $in: seatIds },
          status: 'LOCKED',
          lockedBy: userId,
          lockedUntil
        },
        {
          $set: {
            status: 'AVAILABLE',
            lockedBy: null,
            lockedUntil: null
          }
        }
      );
      
      throw new ApiError(409, 'One or more selected seats are no longer available', 'SEAT_UNAVAILABLE');
    }

    return {
      lockId: userId, // For simplicity in this demo, lock is associated with user ID
      expiresAt: lockedUntil,
      seats: seatIds
    };
  }
}
