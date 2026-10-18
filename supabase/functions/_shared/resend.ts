// ============================================================================
// Email Template Generator for Resend Transactional Notifications
// Brand: VSS Alutech Solutions (Deep Navy #0A192F & Industrial Orange #FF6B00)
// ============================================================================

export interface EmailData {
  referenceId: string;
  submissionDate: string;
  fullName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  cityState: string;
  country: string;
  serviceCategory: string;
  plantLocation?: string;
  machineryRequired?: string;
  pressCapacity?: string;
  technicalSpecs?: string;
  approxBudget?: string;
  projectStage?: string;
  timelineUrgency?: string;
  preferredContact?: string;
  message: string;
  currentStatus: string;
}

export function generateEmailSubject(companyName: string, serviceCategory: string): string {
  return `New Business Enquiry — ${companyName} — ${serviceCategory}`;
}

export function generateEmailHtml(data: EmailData): string {
  const cleanPhone = data.phoneNumber.replace(/[^\d+]/g, '');
  const waPhone = cleanPhone.replace(/^\+/, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Business Enquiry - VSS Alutech Solutions</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
    .wrapper { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background-color: #0A192F; padding: 24px 30px; text-align: left; border-bottom: 4px solid #FF6B00; }
    .logo-text { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin: 0; }
    .logo-accent { color: #FF6B00; }
    .header-sub { font-size: 13px; color: #94A3B8; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 30px; }
    .ref-badge { display: inline-block; background-color: #FFF0E5; color: #CC5000; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #FFD0B3; }
    .section-title { font-size: 15px; font-weight: 700; color: #0A192F; border-bottom: 2px solid #F1F5F9; padding-bottom: 6px; margin: 24px 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .data-table td { padding: 8px 12px; font-size: 14px; vertical-align: top; border-bottom: 1px solid #F1F5F9; }
    .data-table td.label { width: 35%; color: #64748B; font-weight: 600; background-color: #FAFCFE; }
    .data-table td.value { width: 65%; color: #0F172A; }
    .message-box { background-color: #F8FAFC; border-left: 4px solid #0A192F; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
    .action-row { margin-top: 25px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; }
    .btn { display: inline-block; padding: 10px 20px; margin: 0 6px 10px 6px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; }
    .btn-call { background-color: #0A192F; color: #ffffff !important; }
    .btn-wa { background-color: #25D366; color: #ffffff !important; }
    .btn-email { background-color: #FF6B00; color: #ffffff !important; }
    .footer { background-color: #F8FAFC; padding: 18px 30px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="logo-text">VSS ALUTECH <span class="logo-accent">SOLUTIONS</span></h1>
      <div class="header-sub">Industrial Aluminium Extrusion Plant Services</div>
    </div>
    <div class="content">
      <div class="ref-badge">ENQUIRY REF: ${data.referenceId}</div>
      <p style="margin: 0 0 15px 0; font-size: 15px; font-weight: 600; color: #0A192F;">
        A new customer enquiry has been captured via the VSS Alutech Solutions web portal.
      </p>

      <div class="section-title">Customer Contact Details</div>
      <table class="data-table">
        <tr>
          <td class="label">Customer Full Name</td>
          <td class="value"><strong>${data.fullName}</strong></td>
        </tr>
        <tr>
          <td class="label">Company Name</td>
          <td class="value"><strong>${data.companyName}</strong></td>
        </tr>
        <tr>
          <td class="label">Phone / WhatsApp</td>
          <td class="value"><a href="tel:${cleanPhone}" style="color: #0A192F; text-decoration: underline;">${data.phoneNumber}</a></td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value"><a href="mailto:${data.emailAddress}" style="color: #FF6B00; text-decoration: underline;">${data.emailAddress}</a></td>
        </tr>
        <tr>
          <td class="label">City & State</td>
          <td class="value">${data.cityState}</td>
        </tr>
        <tr>
          <td class="label">Country</td>
          <td class="value">${data.country}</td>
        </tr>
        ${data.preferredContact ? `
        <tr>
          <td class="label">Preferred Contact Mode</td>
          <td class="value"><strong>${data.preferredContact}</strong></td>
        </tr>` : ''}
      </table>

      <div class="section-title">Technical Project Requirements</div>
      <table class="data-table">
        <tr>
          <td class="label">Required Service</td>
          <td class="value" style="color: #FF6B00; font-weight: 700;">${data.serviceCategory}</td>
        </tr>
        ${data.plantLocation ? `
        <tr>
          <td class="label">Plant / Site Location</td>
          <td class="value">${data.plantLocation}</td>
        </tr>` : ''}
        ${data.machineryRequired ? `
        <tr>
          <td class="label">Machinery / Equipment</td>
          <td class="value">${data.machineryRequired}</td>
        </tr>` : ''}
        ${data.pressCapacity ? `
        <tr>
          <td class="label">Press Capacity / Tonnage</td>
          <td class="value">${data.pressCapacity}</td>
        </tr>` : ''}
        ${data.technicalSpecs ? `
        <tr>
          <td class="label">Technical Specifications</td>
          <td class="value">${data.technicalSpecs}</td>
        </tr>` : ''}
        ${data.approxBudget ? `
        <tr>
          <td class="label">Approximate Budget</td>
          <td class="value">${data.approxBudget}</td>
        </tr>` : ''}
        ${data.projectStage ? `
        <tr>
          <td class="label">Project Stage</td>
          <td class="value">${data.projectStage}</td>
        </tr>` : ''}
        ${data.timelineUrgency ? `
        <tr>
          <td class="label">Timeline / Urgency</td>
          <td class="value"><span style="color: #D97706; font-weight: 600;">${data.timelineUrgency}</span></td>
        </tr>` : ''}
        <tr>
          <td class="label">Submission Timestamp</td>
          <td class="value">${data.submissionDate}</td>
        </tr>
        <tr>
          <td class="label">Initial Status</td>
          <td class="value"><strong style="color: #2563EB;">${data.currentStatus.toUpperCase()}</strong></td>
        </tr>
      </table>

      <div class="section-title">Complete Customer Message</div>
      <div class="message-box">${data.message}</div>

      <div class="action-row">
        <a href="tel:${cleanPhone}" class="btn btn-call">📞 Call Customer</a>
        <a href="https://wa.me/${waPhone}" class="btn btn-wa" target="_blank">💬 WhatsApp Chat</a>
        <a href="mailto:${data.emailAddress}?subject=Re:%20${encodeURIComponent(data.referenceId)}%20-%20VSS%20Alutech%20Solutions" class="btn btn-email">✉️ Reply Email</a>
      </div>
    </div>
    <div class="footer">
      VSS Alutech Solutions &bull; Industrial Aluminium Extrusion Plant Advisory &bull; Reference ${data.referenceId}
    </div>
  </div>
</body>
</html>`;
}

export function generateEmailText(data: EmailData): string {
  return `NEW CUSTOMER ENQUIRY - VSS ALUTECH SOLUTIONS
--------------------------------------------------
Enquiry Reference ID : ${data.referenceId}
Submission Date/Time : ${data.submissionDate}
Current Status       : ${data.currentStatus.toUpperCase()}

CUSTOMER CONTACT DETAILS:
- Customer Name      : ${data.fullName}
- Company Name       : ${data.companyName}
- Phone/WhatsApp     : ${data.phoneNumber}
- Email Address      : ${data.emailAddress}
- Location           : ${data.cityState}, ${data.country}
${data.plantLocation ? `- Plant Site         : ${data.plantLocation}\n` : ''}${data.preferredContact ? `- Preferred Contact  : ${data.preferredContact}\n` : ''}
SERVICE & TECHNICAL DETAILS:
- Requested Service  : ${data.serviceCategory}
${data.machineryRequired ? `- Machinery Required : ${data.machineryRequired}\n` : ''}${data.pressCapacity ? `- Press Tonnage/Size : ${data.pressCapacity}\n` : ''}${data.technicalSpecs ? `- Specifications     : ${data.technicalSpecs}\n` : ''}${data.approxBudget ? `- Estimated Budget   : ${data.approxBudget}\n` : ''}${data.projectStage ? `- Project Stage      : ${data.projectStage}\n` : ''}${data.timelineUrgency ? `- Timeline / Urgency : ${data.timelineUrgency}\n` : ''}
CUSTOMER MESSAGE:
${data.message}

--------------------------------------------------
Quick Links:
Call: tel:${data.phoneNumber}
WhatsApp: https://wa.me/${data.phoneNumber.replace(/[^\d]/g, '')}
Email: mailto:${data.emailAddress}
`;
}
