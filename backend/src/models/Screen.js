import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    name: { type: String, required: true, trim: true },
    screenNumber: { type: Number, required: true },
    totalSeats: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Screen = mongoose.model('Screen', screenSchema);
