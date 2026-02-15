import express from 'express';
import News from '../models/News.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all news
router.get('/', async (req, res, next) => {
  try {
    const { category, featured, limit = 10, offset = 0 } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.featured = featured === 'true';
    }

    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('relatedStocks', 'symbol name price')
      .populate('relatedIPOs', 'symbol name status');

    const total = await News.countDocuments(query);

    res.json({
      message: 'News retrieved successfully',
      count: news.length,
      total,
      news,
    });
  } catch (error) {
    next(error);
  }
});

// Get single news
router.get('/:id', async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('relatedStocks', 'symbol name price')
      .populate('relatedIPOs', 'symbol name status');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ news });
  } catch (error) {
    next(error);
  }
});

// Create news (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const news = new News(req.body);
    await news.save();
    await news.populate('relatedStocks', 'symbol name price');
    await news.populate('relatedIPOs', 'symbol name status');

    res.status(201).json({
      message: 'News created successfully',
      news,
    });
  } catch (error) {
    next(error);
  }
});

// Update news (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('relatedStocks', 'symbol name price')
      .populate('relatedIPOs', 'symbol name status');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({
      message: 'News updated successfully',
      news,
    });
  } catch (error) {
    next(error);
  }
});

// Delete news (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
