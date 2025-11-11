import express from 'express';
import {
  getDashboardStats,
  getPerformanceTrends,
  getLocationAnalytics,
  getSectorAnalytics,
  getImpactMetrics
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

router.get('/dashboard', getDashboardStats);
router.get('/performance', getPerformanceTrends);
router.get('/location', getLocationAnalytics);
router.get('/sector', getSectorAnalytics);
router.get('/impact', getImpactMetrics);

export default router;
