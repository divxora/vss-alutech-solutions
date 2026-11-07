import { Router } from 'express';
import { handleContactSubmission } from '../controllers/contactController';
import { validateContactSubmission } from '../middleware/validator';
import { submissionLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/contact
router.post('/', submissionLimiter, validateContactSubmission, handleContactSubmission);

export default router;
