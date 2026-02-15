import mongoose from 'mongoose';

const ipoSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    issuePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shares: {
      type: Number,
      required: true,
      min: 0,
    },
    sharesAvailable: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'closed', 'allotted'],
      default: 'upcoming',
    },
    openDate: {
      type: Date,
      required: true,
    },
    closeDate: {
      type: Date,
      required: true,
    },
    allotmentDate: {
      type: Date,
      default: null,
    },
    listingDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    company_info: {
      sector: String,
      chairman: String,
      registrar: String,
    },
    image: {
      type: String,
      default: null,
    },
    applications: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        sharesApplied: Number,
        applicationDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'allotted', 'not_allotted'],
          default: 'pending',
        },
        sharesAllotted: {
          type: Number,
          default: 0,
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

// Create indexes
ipoSchema.index({ status: 1 });
ipoSchema.index({ 'applications.userId': 1 });

export default mongoose.model('IPO', ipoSchema);
