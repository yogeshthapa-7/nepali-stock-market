import express from 'express';
import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get user transactions
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;
    let query = { userId: req.userId };

    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('stockId', 'name symbol')
      .populate('ipoId', 'name symbol')
      .sort({ transactionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      message: 'Transactions retrieved successfully',
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction by ID
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('stockId', 'name symbol').populate('ipoId', 'name symbol');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

// Create transaction (for admin or system)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { userId, type, stockId, ipoId, quantity, price, totalAmount, status, description } = req.body;

    const transaction = new Transaction({
      userId,
      type,
      stockId,
      ipoId,
      quantity,
      price,
      totalAmount,
      status: status || 'COMPLETED',
      description,
    });

    await transaction.save();

    // Update portfolio if needed
    if (type === 'BUY' || type === 'SELL') {
      const portfolio = await Portfolio.findOne({ userId });
      if (portfolio) {
        // Update portfolio logic would go here
      }
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Update transaction (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Delete transaction (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user portfolio summary
router.get('/portfolio/summary', verifyToken, async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId })
      .populate('ownedStocks.stockId', 'name symbol price changePercent')
      .populate('appliedIPOs.ipoId', 'name symbol issuePrice status');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Calculate current portfolio value
    let currentValue = portfolio.totalInvestment;

    // Update with current stock prices (simplified logic)
    portfolio.ownedStocks.forEach(stock => {
      if (stock.stockId) {
        currentValue += (stock.currentPrice - stock.averagePrice) * stock.quantity;
      }
    });

    res.json({
      portfolio: {
        ...portfolio.toJSON(),
        currentValue,
        profitLoss: currentValue - portfolio.totalInvestment,
        profitLossPercent: portfolio.totalInvestment > 0 
          ? ((currentValue - portfolio.totalInvestment) / portfolio.totalInvestment * 100).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;