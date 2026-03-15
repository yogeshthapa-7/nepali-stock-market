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

// Update IPO application status (admin only)
router.put('/:symbol/applications/:userId/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { status, sharesAllotted } = req.body;

    // Validate status
    const validStatuses = ['pending', 'verified', 'allotted', 'not_allotted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ipo = await IPO.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!ipo) {
      return res.status(404).json({ message: 'IPO not found' });
    }

    // Find the application
    const application = ipo.applications.find(
      app => app.userId.toString() === req.params.userId
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update application status
    application.status = status;

    if (status === 'allotted') {
      application.sharesAllotted = sharesAllotted || application.sharesApplied;
    } else if (status === 'not_allotted') {
      // Return shares to available pool
      ipo.sharesAvailable = ipo.sharesAvailable + application.sharesApplied;
      application.sharesAllotted = 0;
    }

    await ipo.save();

    // Also update in user's portfolio
    let portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) {
      portfolio = new Portfolio({ userId: req.params.userId });
      console.log(`[SYNC] Created new portfolio for user ${req.params.userId}`);
    }

    const ipoIdStr = ipo._id.toString();

    // 1. Update status in appliedIPOs
    const appliedIndex = portfolio.appliedIPOs.findIndex(
      app => app.ipoId && app.ipoId.toString() === ipoIdStr
    );
    
    if (appliedIndex !== -1) {
      portfolio.appliedIPOs[appliedIndex].status = status;
      if (status === 'allotted') {
        portfolio.appliedIPOs[appliedIndex].sharesAllotted = sharesAllotted || portfolio.appliedIPOs[appliedIndex].sharesApplied;
      }
      console.log(`[SYNC] Updated appliedIPOs for user ${req.params.userId}, status: ${status}`);
    } else {
      portfolio.appliedIPOs.push({
        ipoId: ipo._id,
        sharesApplied: application.sharesApplied,
        applicationDate: application.applicationDate,
        status: status,
        sharesAllotted: status === 'allotted' ? (sharesAllotted || application.sharesApplied) : 0
      });
      console.log(`[SYNC] Added to appliedIPOs for user ${req.params.userId}, status: ${status}`);
    }

    // 2. Manage allottedIPOs array
    if (status === 'allotted') {
      const existingAllottedIndex = portfolio.allottedIPOs.findIndex(
        a => a.ipoId && a.ipoId.toString() === ipoIdStr
      );
      if (existingAllottedIndex === -1) {
        portfolio.allottedIPOs.push({
          ipoId: ipo._id,
          sharesAllotted: sharesAllotted || application.sharesApplied,
          allotmentDate: new Date(),
          costPrice: ipo.issuePrice
        });
        console.log(`[SYNC] Pushed to allottedIPOs for user ${req.params.userId}`);
      } else {
        portfolio.allottedIPOs[existingAllottedIndex].sharesAllotted = sharesAllotted || application.sharesApplied;
        console.log(`[SYNC] Updated allottedIPOs for user ${req.params.userId}`);
      }
      portfolio.notAllottedIPOs = portfolio.notAllottedIPOs.filter(
        n => n.ipoId && n.ipoId.toString() !== ipoIdStr
      );
    } 
    
    // 3. Manage notAllottedIPOs array
    else if (status === 'not_allotted') {
      const existingNotAllottedIndex = portfolio.notAllottedIPOs.findIndex(
        n => n.ipoId && n.ipoId.toString() === ipoIdStr
      );
      if (existingNotAllottedIndex === -1) {
        portfolio.notAllottedIPOs.push({
          ipoId: ipo._id,
          sharesApplied: application.sharesApplied,
          applicationDate: application.applicationDate
        });
        console.log(`[SYNC] Pushed to notAllottedIPOs for user ${req.params.userId}`);
      }
      portfolio.allottedIPOs = portfolio.allottedIPOs.filter(
        a => a.ipoId && a.ipoId.toString() !== ipoIdStr
      );
    }
    
    // 4. Cleanup if back to pending/verified
    else {
      portfolio.allottedIPOs = portfolio.allottedIPOs.filter(
        a => a.ipoId && a.ipoId.toString() !== ipoIdStr
      );
      portfolio.notAllottedIPOs = portfolio.notAllottedIPOs.filter(
        n => n.ipoId && n.ipoId.toString() !== ipoIdStr
      );
      console.log(`[SYNC] Cleaned up allotted/notAllotted arrays for user ${req.params.userId}`);
    }

    await portfolio.save();

    res.json({
      message: 'Application status updated successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
});

// Bulk update IPO application statuses (admin only)
router.put('/:symbol/applications/bulk-status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { applicationIds, status, sharesAllotted } = req.body;

    // Validate status
    const validStatuses = ['pending', 'verified', 'allotted', 'not_allotted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!applicationIds || !Array.isArray(applicationIds)) {
      return res.status(400).json({ message: 'Application IDs array required' });
    }

    const ipo = await IPO.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!ipo) {
      return res.status(404).json({ message: 'IPO not found' });
    }

    const updatedApplications = [];
    let totalSharesToReturn = 0;

    for (const userId of applicationIds) {
      const application = ipo.applications.find(
        app => app.userId.toString() === userId
      );

      if (application) {
        application.status = status;

        if (status === 'allotted') {
          application.sharesAllotted = sharesAllotted || application.sharesApplied;
        } else if (status === 'not_allotted') {
          totalSharesToReturn += application.sharesApplied;
          application.sharesAllotted = 0;
        }

        updatedApplications.push(application);

        // Sync to Portfolio
        let portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
          portfolio = new Portfolio({ userId });
          console.log(`Created new portfolio for user ${userId} during bulk IPO update`);
        }

        const ipoIdStr = ipo._id.toString();

        const appliedIndex = portfolio.appliedIPOs.findIndex(
          app => app.ipoId && app.ipoId.toString() === ipoIdStr
        );
        
        if (appliedIndex !== -1) {
          portfolio.appliedIPOs[appliedIndex].status = status;
          if (status === 'allotted') {
            portfolio.appliedIPOs[appliedIndex].sharesAllotted = sharesAllotted || portfolio.appliedIPOs[appliedIndex].sharesApplied;
          }
        } else {
          portfolio.appliedIPOs.push({
            ipoId: ipo._id,
            sharesApplied: application.sharesApplied,
            applicationDate: application.applicationDate,
            status: status,
            sharesAllotted: status === 'allotted' ? (sharesAllotted || application.sharesApplied) : 0
          });
        }

        if (status === 'allotted') {
          const existingAllottedIndex = portfolio.allottedIPOs.findIndex(
            a => a.ipoId && a.ipoId.toString() === ipoIdStr
          );
          if (existingAllottedIndex === -1) {
            portfolio.allottedIPOs.push({
              ipoId: ipo._id,
              sharesAllotted: sharesAllotted || application.sharesApplied,
              allotmentDate: new Date(),
              costPrice: ipo.issuePrice
            });
            console.log(`[BULK-SYNC] Pushed to allottedIPOs for user ${userId}`);
          } else {
            portfolio.allottedIPOs[existingAllottedIndex].sharesAllotted = sharesAllotted || application.sharesApplied;
          }
          portfolio.notAllottedIPOs = portfolio.notAllottedIPOs.filter(
            n => n.ipoId && n.ipoId.toString() !== ipoIdStr
          );
        } else if (status === 'not_allotted') {
          const existingNotAllottedIndex = portfolio.notAllottedIPOs.findIndex(
            n => n.ipoId && n.ipoId.toString() === ipoIdStr
          );
          if (existingNotAllottedIndex === -1) {
            portfolio.notAllottedIPOs.push({
              ipoId: ipo._id,
              sharesApplied: application.sharesApplied,
              applicationDate: application.applicationDate
            });
          }
          portfolio.allottedIPOs = portfolio.allottedIPOs.filter(
            a => a.ipoId && a.ipoId.toString() !== ipoIdStr
          );
        } else {
          portfolio.allottedIPOs = portfolio.allottedIPOs.filter(
            a => a.ipoId && a.ipoId.toString() !== ipoIdStr
          );
          portfolio.notAllottedIPOs = portfolio.notAllottedIPOs.filter(
            n => n.ipoId && n.ipoId.toString() !== ipoIdStr
          );
        }
        await portfolio.save();
      }
    }

    // Return shares to pool if marking as not_allotted
    if (status === 'not_allotted') {
      ipo.sharesAvailable = ipo.sharesAvailable + totalSharesToReturn;
    }

    await ipo.save();

    res.json({
      message: `Updated ${updatedApplications.length} applications to ${status}`,
      count: updatedApplications.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
