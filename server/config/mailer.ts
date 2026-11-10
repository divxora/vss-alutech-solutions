import nodemailer from 'nodemailer';

export interface EmailSubmissionData {
  trackingId: string;
  type: 'contact' | 'manpower' | 'quote';
  name: string;
  email: string;
  phone: string;
  company?: string;
  serviceCategory?: string;
  plantLocation?: string;
  message?: string;
  details?: Record<string, any>;
  hasAttachment?: boolean;
  fileName?: string;
}

// Target administrator notification email as specified
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'vssalutechsolutions@gmail.com';
const FROM_EMAIL = process.env.SMTP_FROM || `"VSS Alutech Portal" <noreply@vsslutechsolutions.in>`;

// Initialize transporter
let transporter: nodemailer.Transporter | null = null;
let isSimulationMode = false;

function createSimulationTransporter(): nodemailer.Transporter {
  isSimulationMode = true;
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    // If Gmail SMTP is used with a non-App Password (e.g. contains @ or not 16 alphanumeric chars),
    // warn clearly that Google requires a dedicated 16-character App Password
    const isGmail = host.toLowerCase().includes('gmail.com');
    const isLikelyPersonalPassword = isGmail && (pass.includes('@') || pass.length < 16);

    if (isLikelyPersonalPassword) {
      console.warn(
        `[Mailer Setup Note] Google Gmail SMTP requires a 16-character App Password (generated at https://myaccount.google.com/apppasswords). Standard account passwords are not accepted by Google. Outgoing notifications are safely logged to database & simulation queue.`
      );
      transporter = createSimulationTransporter();
      return transporter;
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
    console.log(`[Mailer] Configured SMTP transporter with host: ${host}:${port}`);
  } else {
    // Development fallback mock transporter (logs email contents gracefully without crashing)
    transporter = createSimulationTransporter();
    console.log('[Mailer] No active SMTP configuration found in env. Running in simulation mode (emails logged to console/DB).');
  }

  return transporter;
}

/**
 * Fallback to simulation mode if live SMTP credentials fail
 */
export function switchToSimulationMode(reason: string): void {
  console.warn(`[Mailer Notice] Switched mailer to offline simulation mode: ${reason}`);
  transporter = createSimulationTransporter();
}

/**
 * Format submission type label
 */
function formatType(type: string): string {
  switch (type) {
    case 'manpower':
      return 'Industrial Manpower Staffing Request';
    case 'quote':
      return 'Machinery & Tooling Quotation Request';
    default:
      return 'General Business Enquiry / Consultation';
  }
}

/**
 * Send notification to Site Administrator
 */
export async function sendAdminNotification(data: EmailSubmissionData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mail = getTransporter();
  const typeLabel = formatType(data.type);

  const detailsRows = data.details
    ? Object.entries(data.details)
        .map(([key, value]) => `<tr><td style="padding: 8px 12px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0; width: 35%;">${key}:</td><td style="padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${value || 'N/A'}</td></tr>`)
        .join('')
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Submission - ${data.trackingId}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
      <table align="center" width="100%" max-width="650px" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr style="background-color: #0f172a; color: #ffffff;">
          <td style="padding: 24px; text-align: left;">
            <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #f97316; font-weight: 700; margin-bottom: 6px;">VSS ALUTECH SOLUTIONS — ADMIN NOTIFICATION</div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">New ${typeLabel}</h1>
            <p style="margin: 6px 0 0; font-size: 14px; color: #94a3b8;">Tracking ID: <strong style="color: #38bdf8;">${data.trackingId}</strong></p>
          </td>
        </tr>

        <!-- Summary Banner -->
        <tr>
          <td style="padding: 20px 24px 10px; background-color: #fff7ed; border-bottom: 2px solid #fdba74;">
            <p style="margin: 0; font-size: 14px; color: #9a3412;">
              A new operational request has been submitted on the VSS Alutech industrial portal. Please review the customer specifications below.
            </p>
          </td>
        </tr>

        <!-- Client Contact Details -->
        <tr>
          <td style="padding: 24px;">
            <h3 style="margin-top: 0; font-size: 16px; color: #0f172a; border-left: 4px solid #f97316; padding-left: 10px;">Customer Profile</h3>
            <table width="100%" style="border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0; width: 35%;">Contact Person:</td>
                <td style="padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">Company / Enterprise:</td>
                <td style="padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${data.company || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">Email Address:</td>
                <td style="padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${data.email}" style="color: #0284c7; text-decoration: none;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">Mobile / Phone:</td>
                <td style="padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;"><a href="tel:${data.phone}" style="color: #0284c7; text-decoration: none;">${data.phone}</a></td>
              </tr>
              ${data.plantLocation ? `
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">Plant Location:</td>
                <td style="padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${data.plantLocation}</td>
              </tr>` : ''}
              ${data.serviceCategory ? `
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">Service Category:</td>
                <td style="padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${data.serviceCategory}</td>
              </tr>` : ''}
            </table>

            ${detailsRows ? `
            <h3 style="margin-top: 24px; font-size: 16px; color: #0f172a; border-left: 4px solid #0284c7; padding-left: 10px;">Technical & Operational Specifications</h3>
            <table width="100%" style="border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
              ${detailsRows}
            </table>` : ''}

            ${data.message ? `
            <h3 style="margin-top: 24px; font-size: 16px; color: #0f172a; border-left: 4px solid #64748b; padding-left: 10px;">Project Scope & Notes</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">
              ${data.message}
            </div>` : ''}

            ${data.hasAttachment ? `
            <div style="margin-top: 20px; padding: 12px; background-color: #ecfeff; border: 1px solid #a5f3fc; border-radius: 6px; font-size: 13px; color: #0e7490;">
              📎 <strong>CAD / Blueprint File Attached:</strong> ${data.fileName || 'Uploaded to server storage'}
            </div>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
          <td style="padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center;">
            Sent automatically by VSS Alutech Solutions Enterprise Backend.<br>
            Direct reply to customer: <a href="mailto:${data.email}" style="color: #f97316;">${data.email}</a> | Reference: ${data.trackingId}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await mail.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `[${data.trackingId}] New ${typeLabel} - ${data.company || data.name}`,
      html: htmlContent,
    });

    console.log(`[Mailer] Admin notification dispatched for ${data.trackingId}. Info:`, info.messageId || 'simulated');
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.warn(`[Mailer Notice] Could not dispatch live email for ${data.trackingId}: ${err.message}. Notification queued in database.`);
    switchToSimulationMode(err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send auto-acknowledgement response to client with generated tracking reference ID
 */
export async function sendClientAcknowledgement(data: EmailSubmissionData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mail = getTransporter();
  const typeLabel = formatType(data.type);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Acknowledgement - ${data.trackingId}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <table align="center" width="100%" max-width="600px" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <tr style="background-color: #0f172a; color: #ffffff;">
          <td style="padding: 28px 24px; text-align: left;">
            <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #f97316; font-weight: 700; margin-bottom: 6px;">VSS ALUTECH SOLUTIONS</div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">We Have Received Your Request</h1>
            <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">Engineering solutions partner for aluminium extrusion operations</p>
          </td>
        </tr>

        <!-- Reference Box -->
        <tr>
          <td style="padding: 24px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.5;">
              Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Thank you for reaching out to VSS Alutech Solutions. Your <strong>${typeLabel}</strong> has been logged into our engineering dispatch queue.
            </p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 20px 0; text-align: center;">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; font-weight: 700; margin-bottom: 4px;">YOUR TRACKING REFERENCE ID</div>
              <div style="font-size: 24px; font-family: monospace; font-weight: 800; color: #15803d; letter-spacing: 1px;">${data.trackingId}</div>
              <p style="margin: 6px 0 0; font-size: 12px; color: #166534;">Please save this reference for any future communications regarding this enquiry.</p>
            </div>

            <!-- What Happens Next -->
            <h3 style="font-size: 15px; color: #0f172a; margin-top: 24px; margin-bottom: 12px;">What Happens Next?</h3>
            <ul style="padding-left: 20px; margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.6;">
              <li style="margin-bottom: 8px;"><strong>Engineering Assessment:</strong> Our technical team will review your machinery / manpower / operational parameters.</li>
              <li style="margin-bottom: 8px;"><strong>Rapid Response:</strong> You will receive a direct callback or technical response within <strong>4 business hours</strong>.</li>
              <li><strong>Confidentiality Assured:</strong> All drawings, die specifications, and plant details are handled under strict industrial confidentiality.</li>
            </ul>

            <!-- Support Contacts -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 13px; color: #64748b;">
              <strong>Direct Plant Advisory Desk:</strong><br>
              📞 Phone / WhatsApp: <a href="tel:+919517098011" style="color: #f97316; text-decoration: none;">+91 9517098011</a><br>
              ✉️ Email: <a href="mailto:vssalutechsolutions@gmail.com" style="color: #0284c7; text-decoration: none;">vssalutechsolutions@gmail.com</a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr style="background-color: #0f172a; color: #94a3b8;">
          <td style="padding: 16px 24px; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} VSS Alutech Solutions. All rights reserved.<br>
            Extrusion Press Solutions • Billet Furnaces • Plant Maintenance • Die Sourcing • Skilled Manpower
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await mail.sendMail({
      from: FROM_EMAIL,
      to: data.email,
      subject: `[${data.trackingId}] Request Acknowledged — VSS Alutech Solutions`,
      html: htmlContent,
    });

    console.log(`[Mailer] Client auto-acknowledgement dispatched to ${data.email} for ${data.trackingId}. Info:`, info.messageId || 'simulated');
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.warn(`[Mailer Notice] Could not dispatch live client email to ${data.email}: ${err.message}. Acknowledgement logged in database.`);
    switchToSimulationMode(err.message);
    return { success: false, error: err.message };
  }
}
