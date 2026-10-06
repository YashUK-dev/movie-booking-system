import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';

export class AdminService {
  static async getDashboardStats() {
    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueData
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'CONFIRMED' }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      Booking.aggregate([
        { $match: { status: 'CONFIRMED' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const upcomingShows = await Show.find({ startTime: { $gt: new Date() } })
      .populate('movieId', 'title')
      .populate({ path: 'screenId', select: 'name', populate: { path: 'theatreId', select: 'name' } })
      .sort({ startTime: 1 })
      .limit(10);

    return {
      totalUsers,
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenue,
      upcomingShows
    };
  }
}
