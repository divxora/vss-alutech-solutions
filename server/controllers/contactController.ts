import { Request, Response } from 'express';
import { submissionModel } from '../models/submissionModel';
import { sendAdminNotification, sendClientAcknowledgement } from '../config/mailer';

/**
 * POST /api/contact
 * Handles general business enquiries, contact messages, and consultation requests
 */
export async function handleContactSubmission(req: Request, res: Response): Promise<void> {
  const {
    name,
    email,
    phone,
    company,
    serviceCategory,
    plantLocation,
    message,
    pressCapacity,
    approxBudget,
    projectStage,
    timelineUrgency,
    preferredContact,
  } = req.body;

  // Build structured details payload
  const details: Record<string, any> = {};
  if (pressCapacity) details['Press / Equipment Capacity'] = pressCapacity;
  if (approxBudget) details['Estimated Investment Budget'] = approxBudget;
  if (projectStage) details['Project Lifecycle Stage'] = projectStage;
  if (timelineUrgency) details['Deployment Urgency'] = timelineUrgency;
  if (preferredContact) details['Preferred Contact Method'] = preferredContact;

  // Persist in SQLite
  const submission = submissionModel.create({
    type: 'contact',
    name,
    email,
    phone,
    company,
    serviceCategory: serviceCategory || 'Aluminium Extrusion Plant Consultation',
    plantLocation,
    message,
    details: Object.keys(details).length > 0 ? details : undefined,
  });

  // Dispatch emails asynchronously
  const emailPayload = {
    trackingId: submission.tracking_id,
    type: 'contact' as const,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    company: submission.company || undefined,
    serviceCategory: submission.service_category || undefined,
    plantLocation: submission.plant_location || undefined,
    message: submission.message || undefined,
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
    message: 'Your business enquiry has been successfully logged. Our engineering desk will follow up shortly.',
    referenceId: submission.tracking_id,
    data: {
      id: submission.id,
      trackingId: submission.tracking_id,
      type: submission.type,
      name: submission.name,
      company: submission.company,
      createdAt: submission.created_at,
    },
  });
}
