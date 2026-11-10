import { Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { userModel } from '../models/userModel';
import { submissionModel } from '../models/submissionModel';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * GET /api/admin/setup-status
 * Checks if the system needs first-time administrator onboarding
 */
export async function handleGetSetupStatus(_req: AuthenticatedRequest, res: Response): Promise<void> {
  const hasAdmins = userModel.hasAdminUsers();
  const count = userModel.getAdminCount();
  console.log(`[AdminController] handleGetSetupStatus hasAdmins=${hasAdmins}, count=${count}`);
  const needsSetup = !hasAdmins;
  res.status(200).json({
    success: true,
    needsSetup,
    message: needsSetup
      ? 'System requires initial administrator setup.'
      : 'Administrator is already configured.',
  });
}

/**
 * POST /api/admin/setup
 * First-time secure administrator onboarding (only allowed when 0 admins exist)
 */
export async function handleSetupAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (userModel.hasAdminUsers()) {
    res.status(403).json({
      success: false,
      error: 'Administrator already configured. First-time setup is permanently closed.',
    });
    return;
  }

  const { email, password, fullName } = req.body;
  if (!email || !password || password.length < 8) {
    res.status(422).json({
      success: false,
      error: 'Please provide a valid email and a strong password (minimum 8 characters).',
    });
    return;
  }

  const admin = userModel.createAdminUser(
    email,
    password,
    fullName || 'Lead Administrator',
    'superadmin'
  );

  const token = userModel.generateToken(admin);

  res.status(201).json({
    success: true,
    message: 'Initial administrator account created successfully. Welcome to VSS Alutech Portal.',
    token,
    user: {
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role,
    },
  });
}

/**
 * POST /api/admin/login
 * Secure admin login endpoint using JWT and bcrypt
 */
export async function handleAdminLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const admin = userModel.findByEmail(email);
  if (!admin) {
    res.status(401).json({
      success: false,
      error: 'Invalid email credentials or administrative account not found.',
    });
    return;
  }

  const isMatch = await userModel.verifyPassword(password, admin.password_hash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      error: 'Invalid password. Please check your credentials.',
    });
    return;
  }

  // Update last login timestamp
  userModel.updateLastLogin(admin.id);

  // Generate signed JWT
  const token = userModel.generateToken(admin);

  res.status(200).json({
    success: true,
    message: 'Authentication successful. Welcome to VSS Alutech Admin Portal.',
    token,
    user: {
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role,
    },
  });
}

/**
 * GET /api/admin/submissions
 * Protected route for authorized admins to view all stored form enquiries, manpower requests, and quote submissions
 */
export async function handleGetSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { type, status, search, page, limit } = req.query;

  const result = submissionModel.findAll({
    type: type ? String(type) : undefined,
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined,
    page: page ? parseInt(String(page), 10) : 1,
    limit: limit ? parseInt(String(limit), 10) : 20,
  });

  const stats = submissionModel.getStats();

  res.status(200).json({
    success: true,
    ...result,
    stats,
  });
}

/**
 * GET /api/admin/submissions/:id
 * Retrieve full details for a single submission
 */
export async function handleGetSubmissionById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid submission ID parameter.' });
    return;
  }

  const item = submissionModel.findById(id);
  if (!item) {
    res.status(404).json({ success: false, error: `Submission #${id} not found.` });
    return;
  }

  res.status(200).json({
    success: true,
    submission: {
      ...item,
      details: item.details_json ? JSON.parse(item.details_json) : null,
    },
  });
}

/**
 * PATCH /api/admin/submissions/:id/status
 * Update status and admin processing notes
 */
export async function handleUpdateSubmissionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  const { status, adminNotes } = req.body;

  const validStatuses = ['pending', 'in_review', 'quoted', 'resolved', 'archived'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
    return;
  }

  const performer = req.user?.email || 'admin';
  const updated = submissionModel.updateStatus(id, status, adminNotes, performer);

  if (!updated) {
    res.status(404).json({ success: false, error: `Submission #${id} not found.` });
    return;
  }

  res.status(200).json({
    success: true,
    message: `Submission status successfully updated to "${status}".`,
    submission: {
      ...updated,
      details: updated.details_json ? JSON.parse(updated.details_json) : null,
    },
  });
}

/**
 * DELETE /api/admin/submissions/:id
 * Protected route to delete or archive processed inquiries
 */
export async function handleDeleteSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid submission ID.' });
    return;
  }

  const performer = req.user?.email || 'admin';
  const deleted = submissionModel.delete(id, performer);

  if (!deleted) {
    res.status(404).json({ success: false, error: `Submission #${id} does not exist.` });
    return;
  }

  // If there was an uploaded file, remove it from disk safely
  if (deleted.file_path && fs.existsSync(deleted.file_path)) {
    try {
      fs.unlinkSync(deleted.file_path);
      console.log(`[Storage] Deleted attached file: ${deleted.file_path}`);
    } catch (e) {
      console.warn(`[Storage] Failed to unlink file ${deleted.file_path}:`, e);
    }
  }

  res.status(200).json({
    success: true,
    message: `Submission #${id} (${deleted.tracking_id}) has been permanently deleted.`,
    deletedId: id,
    trackingId: deleted.tracking_id,
  });
}

/**
 * GET /api/admin/download/:id
 * Secure download for attached CAD/blueprint files
 */
export async function handleDownloadAttachment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  const item = submissionModel.findById(id);

  if (!item || !item.file_path) {
    res.status(404).json({ success: false, error: 'No attachment found for this submission.' });
    return;
  }

  const resolvedPath = path.resolve(item.file_path);
  if (!fs.existsSync(resolvedPath)) {
    res.status(404).json({ success: false, error: 'Attachment file is missing from server storage.' });
    return;
  }

  res.download(resolvedPath, item.file_name || path.basename(resolvedPath));
}

/**
  * DELETE /api/admin/submissions/clear-all
  * Purges all submissions and audit logs (admin only)
  */
export async function handleClearAllSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
  const performer = req.user?.email || 'admin';
  const totalCleared = submissionModel.clearAll(performer);

  res.status(200).json({
    success: true,
    message: `Successfully cleared ${totalCleared} request(s) from the admin portal.`,
    count: totalCleared,
  });
}
