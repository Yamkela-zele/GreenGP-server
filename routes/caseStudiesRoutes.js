import express from 'express';
import {
  getAllCaseStudies,
  getCaseStudyById,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  publishCaseStudy,
  getMyCaseStudies
} from '../controllers/caseStudiesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllCaseStudies);
router.get('/:id', getCaseStudyById);

// Protected routes (authentication required)
router.use(authenticateToken);
router.get('/my', getMyCaseStudies);
router.post('/', createCaseStudy);
router.put('/:id', updateCaseStudy);
router.delete('/:id', deleteCaseStudy);
router.put('/:id/publish', publishCaseStudy);

export default router;
