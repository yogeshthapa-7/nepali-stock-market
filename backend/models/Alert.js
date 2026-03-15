import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        stockSymbol: {
            type: String,
            required: true,
            uppercase: true,
        },
        targetPrice: {
            type: Number,
            required: true,
        },
        condition: {
            type: String,
            enum: ['above', 'below', 'equals'],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isTriggered: {
            type: Boolean,
            default: false,
        },
        triggeredAt: {
            type: Date,
            default: null,
        },
        notificationSent: {
            type: Boolean,
            default: false,
        },
        note: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Index for efficient queries
alertSchema.index({ userId: 1, stockSymbol: 1, isActive: 1 });

export default mongoose.model('Alert', alertSchema);
