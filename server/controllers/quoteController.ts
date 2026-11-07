import { Request, Response } from 'express';
import { submissionModel } from '../models/submissionModel';
import { sendAdminNotification, sendClientAcknowledgement } from '../config/mailer';

/**
 * POST /api/quote-request
 * Handles detailed machinery, press sizing, and tooling quotes with file upload support
 */
export async function handleQuoteRequest(req: Request, res: Response): Promise<void> {
  const {
    name,
    email,
    phone,
    company,
    plantLocation,
    machineryType,
    pressTonnage,
    alloyGrades,
    estimatedBilletSize,
    deliveryTimeline,
    technicalSpecs,
  } = req.body;

  // File upload metadata if attached via Multer
  const file = req.file;

  // Build structured quote specifications
  const details: Record<string, any> = {
    'Machinery / Tooling Scope': machineryType,
  };
  if (pressTonnage) details['Press Tonnage Capacity'] = pressTonnage;
  if (alloyGrades) details['Target Aluminium Alloys'] = alloyGrades;
  if (estimatedBilletSize) details['Billet Diameter & Length'] = estimatedBilletSize;
  if (deliveryTimeline) details['Required Delivery Window'] = deliveryTimeline;
  if (file) {
    details['Uploaded Engineering Attachment'] = `${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const formattedMessage = `Quote Request for ${machineryType}${pressTonnage ? ` (${pressTonnage})` : ''}.${technicalSpecs ? ` Technical Specs: ${technicalSpecs}` : ''}`;

  // Persist in SQLite
  const submission = submissionModel.create({
    type: 'quote',
    name,
    email,
    phone,
    company,
    serviceCategory: machineryType || 'Machinery & Tooling Quotation',
    plantLocation,
    message: formattedMessage,
    details,
    fileName: file ? file.originalname : undefined,
    filePath: file ? file.path : undefined,
    fileSize: file ? file.size : undefined,
  });

  // Dispatch email notifications
  const emailPayload = {
    trackingId: submission.tracking_id,
    type: 'quote' as const,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    company: submission.company || undefined,
    serviceCategory: machineryType || 'Machinery & Tooling Quotation',
    plantLocation: submission.plant_location || undefined,
    message: formattedMessage,
    details,
    hasAttachment: Boolean(file),
    fileName: file ? file.originalname : undefined,
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
    message: 'Your machinery quotation request and engineering specifications have been successfully received.',
    referenceId: submission.tracking_id,
    data: {
      id: submission.id,
      trackingId: submission.tracking_id,
      type: submission.type,
      machineryType,
      pressTonnage: pressTonnage || null,
      attachment: file
        ? {
            originalName: file.originalname,
            sizeBytes: file.size,
          }
        : null,
      createdAt: submission.created_at,
    },
  });
}
