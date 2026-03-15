import express from 'express';
import Alert from '../models/Alert.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all alerts for current user
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const alerts = await Alert.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json({
            message: 'Alerts retrieved successfully',
            alerts,
        });
    } catch (error) {
        next(error);
    }
});

// Create a new price alert
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { stockSymbol, targetPrice, condition, note } = req.body;

        if (!stockSymbol || !targetPrice || !condition) {
            return res.status(400).json({
                message: 'Please provide stockSymbol, targetPrice, and condition'
            });
        }

        const alert = new Alert({
            userId: req.userId,
            stockSymbol,
            targetPrice,
            condition,
            note,
        });

        await alert.save();

        res.status(201).json({
            message: 'Alert created successfully',
            alert,
        });
    } catch (error) {
        next(error);
    }
});

// Update alert (activate/deactivate)
router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const alert = await Alert.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        const { isActive, note } = req.body;
        if (isActive !== undefined) alert.isActive = isActive;
        if (note !== undefined) alert.note = note;

        await alert.save();

        res.json({
            message: 'Alert updated successfully',
            alert,
        });
    } catch (error) {
        next(error);
    }
});

// Delete alert
router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const alert = await Alert.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Get active alerts (for Socket.IO notification checking)
router.get('/active/by-symbol/:symbol', async (req, res, next) => {
    try {
        const { symbol } = req.params;
        const alerts = await Alert.find({
            stockSymbol: symbol.toUpperCase(),
            isActive: true,
            isTriggered: false,
        }).populate('userId', 'name email');

        res.json({
            message: 'Active alerts retrieved',
            alerts,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
