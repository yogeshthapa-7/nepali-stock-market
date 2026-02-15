import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['market', 'company', 'ipo', 'general'],
      default: 'general',
    },
    relatedStocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
      },
    ],
    relatedIPOs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IPO',
      },
    ],
    author: {
      type: String,
      default: 'Admin',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create indexes
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ featured: 1 });

export default mongoose.model('News', newsSchema);
