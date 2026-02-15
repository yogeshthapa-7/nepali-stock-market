import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL', 'IPO_APPLICATION', 'IPO_ALLOTMENT', 'DIVIDEND'],
      required: true,
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      default: null,
    },
    ipoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IPO',
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'COMPLETED',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ transactionDate: -1 });

export default mongoose.model('Transaction', transactionSchema);