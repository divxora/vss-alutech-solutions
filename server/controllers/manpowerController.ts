import { Request, Response } from 'express';
import { submissionModel } from '../models/submissionModel';
import { sendAdminNotification, sendClientAcknowledgement } from '../config/mailer';

/**
 * POST /api/manpower-request
 * Handles structured industrial manpower staffing requests
 */
export async function handleManpowerRequest(req: Request, res: Response): Promise<void> {
  const {
    name,
    email,
    phone,
    company,
    plantLocation,
    designation,
    workerCount,
    skillLevel,
    shiftDetails,
    requirementUrgency,
    notes,
  } = req.body;

  const countInt = parseInt(workerCount, 10) || 1;

  // Build structured manpower specifications
  const details: Record<string, any> = {
    'Designation / Role': designation,
    'Worker Count Requested': `${countInt} Operator(s) / Personnel`,
    'Skill Level': skillLevel || 'Skilled',
    'Shift Configuration': shiftDetails || 'Single Day Shift',
    'Requirement Urgency': requirementUrgency || 'Standard (1-2 weeks)',
  };

  const formattedMessage = `Manpower Request for ${countInt}x ${designation} (${skillLevel || 'Skilled'}). Shift: ${shiftDetails || 'Standard'}.${notes ? ` Additional Notes: ${notes}` : ''}`;

  // Persist in SQLite
  const submission = submissionModel.create({
    type: 'manpower',
    name,
    email,
    phone,
    company,
    serviceCategory: 'Skilled and Contract Industrial Manpower',
    plantLocation,
    message: formattedMessage,
    details,
  });

  // Dispatch email notifications asynchronously
  const emailPayload = {
    trackingId: submission.tracking_id,
    type: 'manpower' as const,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    company: submission.company || undefined,
    serviceCategory: 'Skilled and Contract Industrial Manpower',
    plantLocation: submission.plant_location || undefined,
    message: formattedMessage,
    details,
  };

  Promise.allSettled([
    sendAdminNotification(emailPayload),
    sendClientAcknowledgement(emailPayload),
  ]).then(([adminRes, clientRes]) => {
    const adminSent = adminRes.status === 'fulfilled' && adminRes.value.success;
    const clientSent = clientRes.status === 'fulfilled' && clientRes.value.success;
    submissionModel.updateEmailStatus(submission.id, adminSent, clientSent);
  });

  res.status(201).json({
    success: true,
    message: 'Your industrial manpower staffing request has been logged. Our deployment coordinator will contact you with pre-vetted profiles.',
    referenceId: submission.tracking_id,
    data: {
      id: submission.id,
      trackingId: submission.tracking_id,
      type: submission.type,
      designation,
      workerCount: countInt,
      skillLevel: skillLevel || 'Skilled',
      shiftDetails: shiftDetails || 'Single Day Shift',
      createdAt: submission.created_at,
    },
  });
}
