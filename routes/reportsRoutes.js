import express from 'express';
import {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  generateReport
} from '../controllers/reportsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All reports routes require authentication
router.use(authenticateToken);

router.get('/', getAllReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);
router.post('/generate', generateReport);

export default router;
