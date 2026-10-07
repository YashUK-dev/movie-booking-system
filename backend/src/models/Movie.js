import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    genres: [{ type: String, required: true }],
    duration: { type: Number, required: true }, // in minutes
    releaseDate: { type: Date, required: true },
    certificate: { type: String, required: true },
    posterUrl: { type: String },
    trailerUrl: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    status: {
      type: String,
      enum: ['UPCOMING', 'NOW_SHOWING', 'ENDED', 'INACTIVE'],
      default: 'UPCOMING',
    },
  },
  { timestamps: true }
);

// Indexes for search and filtering
movieSchema.index({ title: 'text' });
movieSchema.index({ status: 1 });
movieSchema.index({ language: 1 });
movieSchema.index({ genres: 1 });

export const Movie = mongoose.model('Movie', movieSchema);
