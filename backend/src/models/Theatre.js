import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    facilities: [{
      type: String,
      enum: ['PARKING', 'FOOD', 'WIFI', 'RECLINER', 'DOLBY', 'ACCESSIBILITY'],
    }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
theatreSchema.index({ city: 1 });

export const Theatre = mongoose.model('Theatre', theatreSchema);
