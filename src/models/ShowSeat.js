import mongoose from 'mongoose';

const showSeatSchema = new mongoose.Schema(
  {
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOCKED', 'BOOKED'],
      default: 'AVAILABLE',
    },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lockedUntil: { type: Date, default: null },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    price: { type: Number, required: true }, // dynamically calculated at show creation (basePrice * seat.priceMultiplier)
  },
  { timestamps: true }
);

// Critical compound index for unique seats per show
showSeatSchema.index({ showId: 1, seatId: 1 }, { unique: true });

// TTL Index for automatically unlocking seats (Optional but useful fallback)
// The index expires the document if lockedUntil is in the past. But wait, we just want to reset status, not delete.
// So we will use a cron job instead.

export const ShowSeat = mongoose.model('ShowSeat', showSeatSchema);
