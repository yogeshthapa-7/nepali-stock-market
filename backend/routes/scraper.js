import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import nepsseScraper from '../scraper/nepseScraper.js';

const router = express.Router();

// Get scraper status (admin only)
router.get('/status', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const status = nepsseScraper.getStatus();
        res.json({
            message: 'Scraper status retrieved',
            status,
        });
    } catch (error) {
        next(error);
    }
});

// Trigger manual scrape (admin only)
router.post('/trigger', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        await nepsseScraper.triggerManualScrape();

        res.json({
            message: 'Manual scrape triggered successfully',
            status: nepsseScraper.getStatus(),
        });
    } catch (error) {
        next(error);
    }
});

// Get market status (public)
router.get('/market-status', async (req, res, next) => {
    try {
        const status = nepsseScraper.getMarketStatus();
        res.json({
            status,
            message: `Market is ${status}`,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
