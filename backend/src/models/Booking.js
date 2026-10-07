import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, required: true, unique: true }, // e.g. MOV-20261006-AB12CD
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    seats: [
      {
        seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
        row: { type: String, required: true },
        seatNumber: { type: Number, required: true },
        seatType: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    convenienceFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    bookedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
