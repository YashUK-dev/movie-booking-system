import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    language: { type: String, required: true },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D',
    },
    basePrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

// Index for overlap checks and querying
showSchema.index({ screenId: 1, startTime: 1 });
showSchema.index({ movieId: 1, startTime: 1 });

export const Show = mongoose.model('Show', showSchema);
