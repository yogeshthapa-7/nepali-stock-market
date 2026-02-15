import mongoose from 'mongoose';

const marketDataSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    dayHigh: {
      type: Number,
      default: 0,
    },
    dayLow: {
      type: Number,
      default: 0,
    },
    yearHigh: {
      type: Number,
      default: 0,
    },
    yearLow: {
      type: Number,
      default: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
    },
    peRatio: {
      type: Number,
      default: 0,
    },
    eps: {
      type: Number,
      default: 0,
    },
    dividendYield: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
marketDataSchema.index({ symbol: 1, timestamp: -1 });
marketDataSchema.index({ timestamp: -1 });

export default mongoose.model('MarketData', marketDataSchema);