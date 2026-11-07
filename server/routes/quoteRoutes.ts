import { Router } from 'express';
import { handleQuoteRequest } from '../controllers/quoteController';
import { quoteUpload } from '../middleware/upload';
import { validateQuoteRequest } from '../middleware/validator';
import { submissionLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/quote-request
// Supports file upload for shared blueprints/CAD files using multer (accepts 'file', 'attachment', 'drawing')
const handleQuoteUpload = (req: any, res: any, next: any) => {
  const uploadHandler = quoteUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'attachment', maxCount: 1 },
    { name: 'drawing', maxCount: 1 },
    { name: 'blueprint', maxCount: 1 },
  ]);

  uploadHandler(req, res, (err: any) => {
    if (err) return next(err);
    if (req.files) {
      req.file =
        req.files['file']?.[0] ||
        req.files['attachment']?.[0] ||
        req.files['drawing']?.[0] ||
        req.files['blueprint']?.[0];
    }
    next();
  });
};

router.post(
  '/',
  submissionLimiter,
  handleQuoteUpload,
  validateQuoteRequest,
  handleQuoteRequest
);

export default router;
