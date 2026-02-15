import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('[v0] Using existing MongoDB connection');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nepali-stock-market';

        await mongoose.connect(mongoUri);

        isConnected = true;
        console.log('[v0] MongoDB connected successfully');
    } catch (error) {
        console.error('[v0] MongoDB connection error:', error.message);
        console.warn('[v0] Continuing without database. Some features may be limited.');
        // Don't exit, allow server to continue - useful for development
    }
};

export { isConnected };
export default connectDB;
