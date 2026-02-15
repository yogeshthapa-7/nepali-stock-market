import express from 'express';
import Watchlist from '../models/Watchlist.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user watchlist
router.get('/', verifyToken, async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.userId })
      .populate('stocks.stockId', 'symbol name price change changePercent')
      .populate('ipos.ipoId', 'symbol name status issuePrice');

    if (!watchlist) {
      // Create watchlist if doesn't exist
      watchlist = await Watchlist.create({ userId: req.userId });
    }

    res.json({
      message: 'Watchlist retrieved successfully',
      watchlist,
    });
  } catch (error) {
    next(error);
  }
});

// Add stock to watchlist
router.post('/stocks/add', verifyToken, async (req, res, next) => {
  try {
    const { stockId } = req.body;

    if (!stockId) {
      return res.status(400).json({ message: 'Stock ID is required' });
    }

    let watchlist = await Watchlist.findOne({ userId: req.userId });

    if (!watchlist) {
      watchlist = await Watchlist.create({ userId: req.userId });
    }

    // Check if stock already in watchlist
    const existingStock = watchlist.stocks.find(s => s.stockId.toString() === stockId);
    if (existingStock) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    watchlist.stocks.push({ stockId });
    await watchlist.save();
    await watchlist.populate('stocks.stockId', 'symbol name price');

    res.json({
      message: 'Stock added to watchlist successfully',
      watchlist,
    });
  } catch (error) {
    next(error);
  }
});

// Remove stock from watchlist
router.delete('/stocks/:stockId', verifyToken, async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.userId });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    watchlist.stocks = watchlist.stocks.filter(s => s.stockId.toString() !== req.params.stockId);
    await watchlist.save();

    res.json({
      message: 'Stock removed from watchlist successfully',
      watchlist,
    });
  } catch (error) {
    next(error);
  }
});

// Add IPO to watchlist
router.post('/ipos/add', verifyToken, async (req, res, next) => {
  try {
    const { ipoId } = req.body;

    if (!ipoId) {
      return res.status(400).json({ message: 'IPO ID is required' });
    }

    let watchlist = await Watchlist.findOne({ userId: req.userId });

    if (!watchlist) {
      watchlist = await Watchlist.create({ userId: req.userId });
    }

    // Check if IPO already in watchlist
    const existingIPO = watchlist.ipos.find(i => i.ipoId.toString() === ipoId);
    if (existingIPO) {
      return res.status(400).json({ message: 'IPO already in watchlist' });
    }

    watchlist.ipos.push({ ipoId });
    await watchlist.save();
    await watchlist.populate('ipos.ipoId', 'symbol name status');

    res.json({
      message: 'IPO added to watchlist successfully',
      watchlist,
    });
  } catch (error) {
    next(error);
  }
});

// Remove IPO from watchlist
router.delete('/ipos/:ipoId', verifyToken, async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.userId });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    watchlist.ipos = watchlist.ipos.filter(i => i.ipoId.toString() !== req.params.ipoId);
    await watchlist.save();

    res.json({
      message: 'IPO removed from watchlist successfully',
      watchlist,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
