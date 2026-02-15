import express from 'express';
import IPO from '../models/IPO.js';
import Portfolio from '../models/Portfolio.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all IPOs
router.get('/', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
      ];
    }

    const ipos = await IPO.find(query).sort({ openDate: -1 }).populate({
      path: 'applications.userId',
      select: 'name email',
    });

    res.json({
      message: 'IPOs retrieved successfully',
      count: ipos.length,
      ipos,
    });
  } catch (error) {
    next(error);
  }
});

// Get single IPO
router.get('/:symbol', async (req, res, next) => {
  try {
    const ipo = await IPO.findOne({ symbol: req.params.symbol.toUpperCase() }).populate({
      path: 'applications.userId',
      select: 'name email',
    });

    if (!ipo) {
      return res.status(404).json({ message: 'IPO not found' });
    }

    res.json({ ipo });
  } catch (error) {
    next(error);
  }
});

// Create IPO (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const ipo = new IPO(req.body);
    await ipo.save();

    res.status(201).json({
      message: 'IPO created successfully',
      ipo,
    });
  } catch (error) {
    next(error);
  }
});

// Update IPO (admin only)
router.put('/:symbol', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const ipo = await IPO.findOneAndUpdate(
      { symbol: req.params.symbol.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!ipo) {
      return res.status(404).json({ message: 'IPO not found' });
    }

    res.json({
      message: 'IPO updated successfully',
      ipo,
    });
  } catch (error) {
    next(error);
  }
});

// Delete IPO (admin only)
router.delete('/:symbol', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const ipo = await IPO.findOneAndDelete({ symbol: req.params.symbol.toUpperCase() });

    if (!ipo) {
      return res.status(404).json({ message: 'IPO not found' });
    }

    res.json({ message: 'IPO deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Apply for IPO
router.post('/:symbol/apply', verifyToken, async (req, res, next) => {
  try {
    const { sharesApplied } = req.body;

    if (!sharesApplied || sharesApplied <= 0) {
      return res.status(400).json({ message: 'Invalid number of shares' });
    }

    const ipo = await IPO.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!ipo) {
      return res.status(404).json({ message: 'IPO not found' });
    }

    if (ipo.status !== 'open') {
      return res.status(400).json({ message: 'IPO is not open for applications' });
    }

    // Check if user already applied
    const existingApplication = ipo.applications.find(
      app => app.userId.toString() === req.userId
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You already applied for this IPO' });
    }

    // Add application
    ipo.applications.push({
      userId: req.userId,
      sharesApplied,
      status: 'pending',
    });

    ipo.sharesAvailable = Math.max(0, ipo.sharesAvailable - sharesApplied);
    await ipo.save();

    // Update portfolio
    const portfolio = await Portfolio.findOne({ userId: req.userId });
    if (portfolio) {
      portfolio.appliedIPOs.push({
        ipoId: ipo._id,
        sharesApplied,
        applicationDate: new Date(),
        status: 'pending',
      });
      await portfolio.save();
    }

    res.json({
      message: 'Application submitted successfully',
      ipo,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
