import express from 'express';
import MarketIndex from '../models/MarketIndex.js';
import Stock from '../models/Stock.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all market indices
router.get('/', async (req, res, next) => {
    try {
        const indices = await MarketIndex.find({ isActive: true })
            .sort({ name: 1 });

        res.json({
            message: 'Market indices retrieved successfully',
            indices,
            count: indices.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get single index by name
router.get('/:name', async (req, res, next) => {
    try {
        const { name } = req.params;
        const index = await MarketIndex.findOne({
            name: name.toUpperCase(),
            isActive: true
        });

        if (!index) {
            return res.status(404).json({ message: 'Index not found' });
        }

        res.json({ index });
    } catch (error) {
        next(error);
    }
});

// Calculate and return top gainers (stocks with highest positive change)
router.get('/stocks/gainers', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const gainers = await Stock.find({ isActive: true, changePercent: { $gt: 0 } })
            .sort({ changePercent: -1 })
            .limit(parseInt(limit))
            .select('symbol name price change changePercent volume');

        res.json({
            message: 'Top gainers retrieved successfully',
            stocks: gainers,
            count: gainers.length,
        });
    } catch (error) {
        next(error);
    }
});

// Calculate and return top losers (stocks with highest negative change)
router.get('/stocks/losers', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const losers = await Stock.find({ isActive: true, changePercent: { $lt: 0 } })
            .sort({ changePercent: 1 })
            .limit(parseInt(limit))
            .select('symbol name price change changePercent volume');

        res.json({
            message: 'Top losers retrieved successfully',
            stocks: losers,
            count: losers.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get top gainers and losers combined
router.get('/stocks/top-movers', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const numLimit = parseInt(limit);

        const gainers = await Stock.find({ isActive: true, changePercent: { $gt: 0 } })
            .sort({ changePercent: -1 })
            .limit(numLimit)
            .select('symbol name price change changePercent volume');

        const losers = await Stock.find({ isActive: true, changePercent: { $lt: 0 } })
            .sort({ changePercent: 1 })
            .limit(numLimit)
            .select('symbol name price change changePercent volume');

        // Get top by volume
        const topVolume = await Stock.find({ isActive: true })
            .sort({ volume: -1 })
            .limit(numLimit)
            .select('symbol name price change changePercent volume');

        // Get top by turnover
        const topTurnover = await Stock.find({ isActive: true })
            .sort({ price: -1 })
            .limit(numLimit)
            .select('symbol name price change changePercent volume');

        res.json({
            message: 'Top movers retrieved successfully',
            gainers,
            losers,
            topVolume,
            topTurnover,
        });
    } catch (error) {
        next(error);
    }
});

// Get market summary (indices + overview)
router.get('/summary', async (req, res, next) => {
    try {
        const indices = await MarketIndex.find({ isActive: true });

        // Calculate market stats from stocks
        const stockStats = await Stock.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalStocks: { $sum: 1 },
                    totalVolume: { $sum: '$volume' },
                    avgChange: { $avg: '$changePercent' },
                    advancing: { $sum: { $cond: [{ $gt: ['$changePercent', 0] }, 1, 0] } },
                    declining: { $sum: { $cond: [{ $lt: ['$changePercent', 0] }, 1, 0] } },
                    unchanged: { $sum: { $cond: [{ $eq: ['$changePercent', 0] }, 1, 0] } },
                }
            }
        ]);

        res.json({
            message: 'Market summary retrieved successfully',
            indices,
            marketStats: stockStats[0] || {
                totalStocks: 0,
                totalVolume: 0,
                avgChange: 0,
                advancing: 0,
                declining: 0,
                unchanged: 0,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Create market index
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const index = new MarketIndex(req.body);
        await index.save();

        res.status(201).json({
            message: 'Market index created successfully',
            index,
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Update market index
router.put('/:name', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { name } = req.params;
        const index = await MarketIndex.findOneAndUpdate(
            { name: name.toUpperCase() },
            req.body,
            { new: true, runValidators: true }
        );

        if (!index) {
            return res.status(404).json({ message: 'Index not found' });
        }

        res.json({
            message: 'Market index updated successfully',
            index,
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Bulk update indices (for simulating market data)
router.post('/bulk-update', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { indices } = req.body;

        if (!Array.isArray(indices)) {
            return res.status(400).json({ message: 'Indices must be an array' });
        }

        const results = [];
        for (const idx of indices) {
            const updated = await MarketIndex.findOneAndUpdate(
                { name: idx.name },
                idx,
                { new: true, upsert: true, runValidators: true }
            );
            results.push(updated);
        }

        res.json({
            message: 'Indices bulk updated successfully',
            indices: results,
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Delete market index
router.delete('/:name', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { name } = req.params;
        const index = await MarketIndex.findOneAndDelete({ name: name.toUpperCase() });

        if (!index) {
            return res.status(404).json({ message: 'Index not found' });
        }

        res.json({ message: 'Market index deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
