import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionId: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['CARD', 'UPI', 'NET_BANKING', 'WALLET'],
      required: true,
    },
    status: {
      type: String,
      enum: ['INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'INITIATED',
    },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
