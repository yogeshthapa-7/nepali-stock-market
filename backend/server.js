import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import stockRoutes from './routes/stocks.js';
import ipoRoutes from './routes/ipos.js';
import newsRoutes from './routes/news.js';
import portfolioRoutes from './routes/portfolio.js';
import watchlistRoutes from './routes/watchlist.js';
import transactionRoutes from './routes/transactions.js';
import marketDataRoutes from './routes/market-data.js';
import indicesRoutes from './routes/indices.js';
import scraperRoutes from './routes/scraper.js';
import alertsRoutes from './routes/alerts.js';
import cron from 'node-cron';
import nepsseScraper from './scraper/nepseScraper.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB().catch((error) => {
    console.warn('[v0] Failed to connect to MongoDB:', error.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/ipos', ipoRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/indices', indicesRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/alerts', alertsRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Nepali Stock Market API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            stocks: '/api/stocks',
            ipos: '/api/ipos',
            news: '/api/news',
            portfolio: '/api/portfolio',
            watchlist: '/api/watchlist',
            health: '/api/health'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO events
io.on('connection', (socket) => {
    console.log(`[v0] User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`[v0] User disconnected: ${socket.id}`);
    });
});

// Export io for scraper
export { io };

// Schedule NEPSE scraper - run every 30 seconds during market hours
// Cron format: second minute hour day month dayOfWeek
// Run every 30 seconds: */30 * * * * *
cron.schedule('*/30 * * * * *', async () => {
    console.log('[Cron] Running NEPSE scraper...');
    try {
        await nepsseScraper.scrape();
    } catch (error) {
        console.error('[Cron] Scraper error:', error);
    }
});

// Also run initial scrape on startup
setTimeout(() => {
    nepsseScraper.scrape().catch(console.error);
}, 5000); // Wait 5 seconds after server starts

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`[v0] Backend server running on port ${PORT}`);
});
