import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z0-9]{1,10}$/, 'Invalid stock symbol'],
    },
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    previousClose: {
      type: Number,
      required: true,
      min: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },
    marketCap: {
      type: String,
      default: 'N/A',
    },
    volume: {
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
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
stockSchema.index({ name: 'text', company: 'text' });

export default mongoose.model('Stock', stockSchema);
