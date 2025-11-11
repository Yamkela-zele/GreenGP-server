import express from 'express';
import { getAllSMME, getSMMEById, createSMME, updateSMME, deleteSMME } from '../controllers/smmeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All SMME routes require authentication
router.use(authenticateToken);

router.get('/', getAllSMME);
router.get('/:id', getSMMEById);
router.post('/', createSMME);
router.put('/:id', updateSMME);
router.delete('/:id', deleteSMME);

export default router;
