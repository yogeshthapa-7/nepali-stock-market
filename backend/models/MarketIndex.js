import mongoose from 'mongoose';

const marketIndexSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['NEPSE', 'Sensitive', 'Float', 'Turnover', 'NEPSE-50', 'Banking', 'Hot', 'Insurance', 'Microfinance', 'Mutual Fund', 'Trading'],
    },
    displayName: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    previousValue: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },
    high: {
      type: Number,
      default: 0,
    },
    low: {
      type: Number,
      default: 0,
    },
    volume: {
      type: Number,
      default: 0,
    },
    marketCap: {
      type: String,
      default: 'N/A',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Calculate change and changePercent before saving
marketIndexSchema.pre('save', function(next) {
  this.change = this.value - this.previousValue;
  this.changePercent = this.previousValue > 0 
    ? ((this.change / this.previousValue) * 100).toFixed(2) 
    : 0;
  next();
});

// Index for faster queries
marketIndexSchema.index({ name: 1 });

export default mongoose.model('MarketIndex', marketIndexSchema);
