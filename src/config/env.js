import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpiration: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  seatLockDurationMinutes: parseInt(process.env.SEAT_LOCK_DURATION_MINUTES || '5', 10),
  bookingConvenienceFee: parseFloat(process.env.BOOKING_CONVENIENCE_FEE || '30'),
};
