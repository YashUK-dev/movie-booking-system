import mongoose from 'mongoose';
import { ShowService } from '../../src/services/show.service.js';
import { BookingService } from '../../src/services/booking.service.js';
import { Show } from '../../src/models/Show.js';
import { ShowSeat } from '../../src/models/ShowSeat.js';
import { Seat } from '../../src/models/Seat.js';
import { Movie } from '../../src/models/Movie.js';
import { Theatre } from '../../src/models/Theatre.js';
import { Screen } from '../../src/models/Screen.js';
import { User } from '../../src/models/User.js';

describe('Concurrency Safety - Seat Booking', () => {
  let showId;
  let seatIds = [];
  let user1Id = new mongoose.Types.ObjectId();
  let user2Id = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    // We will use mongoose without actually connecting to the real DB 
    // unless this is an integration test suite. 
    // For a real scenario, this would connect to a test database.
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-booking-test');

    // Setup basic entities
    const movie = await Movie.create({ title: 'Test Movie', description: 'Desc', language: 'En', genres: ['ACTION'], duration: 120, releaseDate: new Date(), certificate: 'U/A' });
    const theatre = await Theatre.create({ name: 'Test Theatre', address: 'Addr', city: 'City', state: 'State', pincode: '123' });
    const screen = await Screen.create({ theatreId: theatre._id, name: 'Screen 1', screenNumber: 1 });
    
    const seat1 = await Seat.create({ screenId: screen._id, row: 'A', seatNumber: 1 });
    seatIds.push(seat1._id);

    const show = await ShowService.createShow({
      movieId: movie._id,
      screenId: screen._id,
      startTime: new Date(Date.now() + 86400000), // tomorrow
      endTime: new Date(Date.now() + 86400000 + 7200000), // + 2 hours
      language: 'English',
      basePrice: 100
    });
    showId = show._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should prevent double locking of the same seat by two concurrent users', async () => {
    // Both users try to lock the exact same seat at the exact same time
    const p1 = ShowService.lockSeats(showId, seatIds, user1Id);
    const p2 = ShowService.lockSeats(showId, seatIds, user2Id);

    const results = await Promise.allSettled([p1, p2]);

    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');

    // Only one should succeed
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);

    expect(failures[0].reason.errorCode).toBe('SEAT_UNAVAILABLE');
    expect(failures[0].reason.statusCode).toBe(409);

    // Verify the seat is locked in the database
    const showSeat = await ShowSeat.findOne({ showId, seatId: seatIds[0] });
    expect(showSeat.status).toBe('LOCKED');
    expect(showSeat.lockedBy.toString()).toBe(successes[0].value.lockId.toString());
  });
});
