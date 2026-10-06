import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Show } from '../models/Show.js';
import { ShowSeat } from '../models/ShowSeat.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-booking');
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Screen.deleteMany({}),
      Seat.deleteMany({}),
      Show.deleteMany({}),
      ShowSeat.deleteMany({})
    ]);

    console.log('Creating Admin User...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Admin User',
      email: 'admin@bookmyshow.com',
      phone: '9999999999',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    });

    console.log('Creating Regular User...');
    const userPasswordHash = await bcrypt.hash('user123', salt);
    await User.create({
      name: 'Test User',
      email: 'user@bookmyshow.com',
      phone: '8888888888',
      passwordHash: userPasswordHash,
      role: 'USER'
    });

    console.log('Creating Movies...');
    const movies = await Movie.create([
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        language: 'English',
        genres: ['SCI_FI', 'DRAMA'],
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        certificate: 'U/A',
        status: 'NOW_SHOWING',
        basePrice: 200,
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        language: 'English',
        genres: ['ACTION', 'SCI_FI', 'THRILLER'],
        duration: 148,
        releaseDate: new Date('2010-07-16'),
        certificate: 'U/A',
        status: 'NOW_SHOWING',
        basePrice: 150,
      }
    ]);

    console.log('Creating Theatres...');
    const theatre = await Theatre.create({
      name: 'PVR Orion Mall',
      address: 'Dr Rajkumar Rd, Rajajinagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560055',
      facilities: ['PARKING', 'FOOD', 'WIFI', 'DOLBY']
    });

    console.log('Creating Screens...');
    const screen = await Screen.create({
      theatreId: theatre._id,
      name: 'Screen 1 (IMAX)',
      screenNumber: 1
    });

    console.log('Creating Seats...');
    const seatsToInsert = [];
    ['A', 'B', 'C'].forEach((row, rowIndex) => {
      for (let i = 1; i <= 10; i++) {
        let type = 'REGULAR';
        let priceMultiplier = 1;

        if (row === 'C') {
          type = 'PREMIUM';
          priceMultiplier = 1.5;
        }

        seatsToInsert.push({
          screenId: screen._id,
          row,
          seatNumber: i,
          seatType: type,
          priceMultiplier
        });
      }
    });
    
    const seats = await Seat.insertMany(seatsToInsert);
    await Screen.findByIdAndUpdate(screen._id, { totalSeats: seats.length });

    console.log('Creating Shows...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // 6:00 PM
    
    const endTime = new Date(tomorrow);
    endTime.setHours(21, 0, 0, 0); // 9:00 PM

    const show = await Show.create({
      movieId: movies[0]._id,
      screenId: screen._id,
      startTime: tomorrow,
      endTime: endTime,
      language: 'English',
      format: 'IMAX',
      basePrice: 250,
      status: 'SCHEDULED'
    });

    console.log('Generating ShowSeat inventory...');
    const showSeats = seats.map(seat => ({
      showId: show._id,
      seatId: seat._id,
      status: 'AVAILABLE',
      price: 250 * (seat.priceMultiplier || 1)
    }));

    await ShowSeat.insertMany(showSeats);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
