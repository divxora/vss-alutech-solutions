import { Router } from 'express';
import {
  handleGetSetupStatus,
  handleSetupAdmin,
  handleAdminLogin,
  handleGetSubmissions,
  handleGetSubmissionById,
  handleUpdateSubmissionStatus,
  handleDeleteSubmission,
  handleClearAllSubmissions,
  handleDownloadAttachment,
} from '../controllers/adminController';
import { validateAdminLogin } from '../middleware/validator';
import { loginLimiter } from '../middleware/rateLimiter';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// GET /api/admin/setup-status - Check if system needs initial setup
router.get('/setup-status', handleGetSetupStatus);

// POST /api/admin/setup - Initial setup (only allowed when 0 admins exist)
router.post('/setup', loginLimiter, handleSetupAdmin);

// POST /api/admin/login - Secure login returning JWT
router.post('/login', loginLimiter, validateAdminLogin, handleAdminLogin);

// DELETE /api/admin/submissions/clear-all - Purge all submissions from portal
router.delete('/submissions/clear-all', authenticateAdmin, handleClearAllSubmissions);
router.post('/submissions/clear-all', authenticateAdmin, handleClearAllSubmissions);

// GET /api/admin/submissions - Protected route to view all submissions
router.get('/submissions', authenticateAdmin, handleGetSubmissions);

// GET /api/admin/submissions/:id - Protected route for single submission
router.get('/submissions/:id', authenticateAdmin, handleGetSubmissionById);

// PATCH /api/admin/submissions/:id/status - Update status / notes
router.patch('/submissions/:id/status', authenticateAdmin, handleUpdateSubmissionStatus);

// DELETE /api/admin/submissions/:id - Protected route to delete or archive inquiries
router.delete('/submissions/:id', authenticateAdmin, handleDeleteSubmission);

// GET /api/admin/download/:id - Protected route to download CAD/blueprint file
router.get('/download/:id', authenticateAdmin, handleDownloadAttachment);

export default router;
