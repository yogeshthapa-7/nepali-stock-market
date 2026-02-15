import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stocks: [
      {
        stockId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Stock',
        },
        addedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ipos: [
      {
        ipoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'IPO',
        },
        addedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


export default mongoose.model('Watchlist', watchlistSchema);
