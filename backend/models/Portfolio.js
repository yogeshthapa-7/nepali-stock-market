import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appliedIPOs: [
      {
        ipoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'IPO',
        },
        sharesApplied: Number,
        applicationDate: Date,
        status: {
          type: String,
          enum: ['pending', 'allotted', 'not_allotted'],
          default: 'pending',
        },
      },
    ],
    allottedIPOs: [
      {
        ipoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'IPO',
        },
        sharesAllotted: Number,
        allotmentDate: Date,
        costPrice: Number,
      },
    ],
    notAllottedIPOs: [
      {
        ipoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'IPO',
        },
        sharesApplied: Number,
        applicationDate: Date,
      },
    ],
    ownedStocks: [
      {
        stockId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Stock',
        },
        quantity: Number,
        averagePrice: Number,
        boughtDate: Date,
      },
    ],
    totalInvestment: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


export default mongoose.model('Portfolio', portfolioSchema);
