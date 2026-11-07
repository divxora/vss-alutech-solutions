import { Router } from 'express';
import { handleManpowerRequest } from '../controllers/manpowerController';
import { validateManpowerRequest } from '../middleware/validator';
import { submissionLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/manpower-request
router.post('/', submissionLimiter, validateManpowerRequest, handleManpowerRequest);

export default router;
