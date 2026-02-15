import express from 'express';
import MarketData from '../models/MarketData.js';
import Stock from '../models/Stock.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get market data for a specific stock
router.get('/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1D', limit = 100 } = req.query;

    const marketData = await MarketData.find({ symbol: symbol.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

    res.json({
      message: 'Market data retrieved successfully',
      symbol: symbol.toUpperCase(),
      currentPrice: stock?.price || 0,
      data: marketData,
    });
  } catch (error) {
    next(error);
  }
});

// Get market overview
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Get latest market data for all stocks
    const marketData = await MarketData.aggregate([
      {
        $sort: { symbol: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$symbol',
          latestData: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'latestData.timestamp': -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Get current stock info
    const symbols = marketData.map(item => item.latestData.symbol);
    const stocks = await Stock.find({ symbol: { $in: symbols } });

    const result = marketData.map(item => {
      const stock = stocks.find(s => s.symbol === item.latestData.symbol);
      return {
        symbol: item.latestData.symbol,
        name: stock?.name || '',
        company: stock?.company || '',
        currentPrice: stock?.price || item.latestData.close,
        changePercent: stock?.changePercent || 0,
        volume: item.latestData.volume,
        dayHigh: item.latestData.dayHigh,
        dayLow: item.latestData.dayLow,
        yearHigh: item.latestData.yearHigh,
        yearLow: item.latestData.yearLow,
        peRatio: item.latestData.peRatio,
        eps: item.latestData.eps,
        dividendYield: item.latestData.dividendYield,
        timestamp: item.latestData.timestamp,
      };
    });

    res.json({
      message: 'Market overview retrieved successfully',
      data: result,
      count: result.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get historical data for charting
router.get('/:symbol/history', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1D', limit = 100, from, to } = req.query;

    let query = { symbol: symbol.toUpperCase() };
    
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const historicalData = await MarketData.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit));

    res.json({
      message: 'Historical data retrieved successfully',
      symbol: symbol.toUpperCase(),
      timeframe,
      data: historicalData,
      count: historicalData.length,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Create market data (for system updates)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const marketData = new MarketData(req.body);
    await marketData.save();

    res.status(201).json({
      message: 'Market data created successfully',
      marketData,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Update market data
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const marketData = await MarketData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!marketData) {
      return res.status(404).json({ message: 'Market data not found' });
    }

    res.json({
      message: 'Market data updated successfully',
      marketData,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Bulk update market data
router.post('/bulk', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Data must be an array' });
    }

    const results = [];
    const errors = [];

    for (const item of data) {
      try {
        const marketData = new MarketData(item);
        await marketData.save();
        results.push(marketData);
      } catch (error) {
        errors.push({ item, error: error.message });
      }
    }

    res.json({
      message: `Bulk update completed. ${results.length} created, ${errors.length} failed`,
      results,
      errors,
    });
  } catch (error) {
    next(error);
  }
});

export default router;