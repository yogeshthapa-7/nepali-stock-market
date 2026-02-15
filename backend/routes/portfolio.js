import express from 'express';
import Portfolio from '../models/Portfolio.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user portfolio
router.get('/', verifyToken, async (req, res, next) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.userId })
      .populate('appliedIPOs.ipoId', 'symbol name issuePrice')
      .populate('allottedIPOs.ipoId', 'symbol name issuePrice')
      .populate('notAllottedIPOs.ipoId', 'symbol name issuePrice')
      .populate('ownedStocks.stockId', 'symbol name price');

    if (!portfolio) {
      // Create portfolio if doesn't exist
      portfolio = await Portfolio.create({ userId: req.userId });
    }

    res.json({
      message: 'Portfolio retrieved successfully',
      portfolio,
    });
  } catch (error) {
    next(error);
  }
});

// Get applied IPOs
router.get('/ipos/applied', verifyToken, async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId }).populate(
      'appliedIPOs.ipoId',
      'symbol name status issuePrice'
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({
      message: 'Applied IPOs retrieved successfully',
      appliedIPOs: portfolio.appliedIPOs,
    });
  } catch (error) {
    next(error);
  }
});

// Get allotted IPOs
router.get('/ipos/allotted', verifyToken, async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId }).populate(
      'allottedIPOs.ipoId',
      'symbol name issuePrice'
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({
      message: 'Allotted IPOs retrieved successfully',
      allottedIPOs: portfolio.allottedIPOs,
    });
  } catch (error) {
    next(error);
  }
});

// Get not allotted IPOs
router.get('/ipos/not-allotted', verifyToken, async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId }).populate(
      'notAllottedIPOs.ipoId',
      'symbol name issuePrice'
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({
      message: 'Not allotted IPOs retrieved successfully',
      notAllottedIPOs: portfolio.notAllottedIPOs,
    });
  } catch (error) {
    next(error);
  }
});

// Add stock to portfolio
router.post('/stocks/add', verifyToken, async (req, res, next) => {
  try {
    const { stockId, quantity, averagePrice } = req.body;

    const portfolio = await Portfolio.findOne({ userId: req.userId });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const existingStock = portfolio.ownedStocks.find(
      s => s.stockId.toString() === stockId
    );

    if (existingStock) {
      existingStock.quantity += quantity;
    } else {
      portfolio.ownedStocks.push({
        stockId,
        quantity,
        averagePrice,
        boughtDate: new Date(),
      });
    }

    await portfolio.save();

    res.json({
      message: 'Stock added to portfolio successfully',
      portfolio,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
