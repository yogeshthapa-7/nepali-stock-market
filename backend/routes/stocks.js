import express from 'express';
import Stock from '../models/Stock.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all stocks with search and filter
router.get('/', async (req, res, next) => {
  try {
    const { search, symbol, sort } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
      ];
    }

    if (symbol) {
      query.symbol = symbol.toUpperCase();
    }

    let queryBuilder = Stock.find(query);

    if (sort === 'price_asc') {
      queryBuilder = queryBuilder.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      queryBuilder = queryBuilder.sort({ price: -1 });
    } else if (sort === 'change_asc') {
      queryBuilder = queryBuilder.sort({ changePercent: 1 });
    } else if (sort === 'change_desc') {
      queryBuilder = queryBuilder.sort({ changePercent: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ updatedAt: -1 });
    }

    const stocks = await queryBuilder.limit(100);

    res.json({
      message: 'Stocks retrieved successfully',
      count: stocks.length,
      stocks,
    });
  } catch (error) {
    next(error);
  }
});

// Get single stock
router.get('/:symbol', async (req, res, next) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json({ stock });
  } catch (error) {
    next(error);
  }
});

// Create stock (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();

    res.status(201).json({
      message: 'Stock created successfully',
      stock,
    });
  } catch (error) {
    next(error);
  }
});

// Update stock (admin only)
router.put('/:symbol', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const stock = await Stock.findOneAndUpdate(
      { symbol: req.params.symbol.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json({
      message: 'Stock updated successfully',
      stock,
    });
  } catch (error) {
    next(error);
  }
});

// Delete stock (admin only)
router.delete('/:symbol', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const stock = await Stock.findOneAndDelete({ symbol: req.params.symbol.toUpperCase() });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
