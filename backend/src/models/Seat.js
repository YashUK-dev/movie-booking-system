import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true, index: true },
    row: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    seatType: {
      type: String,
      enum: ['REGULAR', 'PREMIUM', 'RECLINER'],
      default: 'REGULAR',
    },
    priceMultiplier: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure unique seat per screen
seatSchema.index({ screenId: 1, row: 1, seatNumber: 1 }, { unique: true });

export const Seat = mongoose.model('Seat', seatSchema);
