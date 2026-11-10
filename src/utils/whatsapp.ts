/**
 * VSS Alutech Solutions — Direct WhatsApp Integration Helper
 * Allows clients to submit complete enquiries directly to WhatsApp & Admin Portal
 */

export const VSS_PRIMARY_WHATSAPP = '919517098011';
export const VSS_SECONDARY_WHATSAPP = '919517098011';
export const VSS_DISPLAY_PHONE_1 = '+91 9517098011';
export const VSS_DISPLAY_PHONE_2 = '+91 9517098011';
export const VSS_BUSINESS_EMAIL = 'vssalutechsolutions@gmail.com';

export interface WhatsAppEnquiryData {
  referenceId: string;
  type?: 'contact' | 'manpower' | 'quote' | 'maintenance' | string;
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  location?: string;
  serviceCategory?: string;
  pressCapacity?: string;
  technicalSpecs?: string;
  approxBudget?: string;
  timelineUrgency?: string;
  message?: string;
  details?: Record<string, any>;
  hasAttachment?: boolean;
  fileName?: string;
}

/**
 * Format complete, structured WhatsApp text for commercial/technical inquiries
 */
export function formatWhatsAppEnquiryMessage(data: WhatsAppEnquiryData): string {
  const parts: string[] = [];

  parts.push('🏭 *VSS ALUTECH SOLUTIONS — NEW ENQUIRY*');
  parts.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  parts.push(`📋 *Reference ID:* ${data.referenceId || 'PENDING'}`);

  if (data.serviceCategory) {
    parts.push(`⚙️ *Service:* ${data.serviceCategory}`);
  }

  parts.push('');
  parts.push('👤 *CUSTOMER DETAILS:*');
  parts.push(`• *Name:* ${data.fullName}`);
  if (data.companyName) parts.push(`• *Company:* ${data.companyName}`);
  parts.push(`• *Phone:* ${data.phone}`);
  parts.push(`• *Email:* ${data.email}`);
  if (data.location) parts.push(`• *Location:* ${data.location}`);

  // Technical details
  const hasTechDetails = data.pressCapacity || data.technicalSpecs || data.timelineUrgency || data.approxBudget || data.details;
  if (hasTechDetails) {
    parts.push('');
    parts.push('📐 *TECHNICAL SPECIFICATIONS:*');
    if (data.technicalSpecs) parts.push(`• *Requirement / Specs:* ${data.technicalSpecs}`);
    if (data.pressCapacity) parts.push(`• *Capacity / Tonnage:* ${data.pressCapacity}`);
    if (data.timelineUrgency) parts.push(`• *Urgency / Timeline:* ${data.timelineUrgency}`);
    if (data.approxBudget) parts.push(`• *Budget Indication:* ${data.approxBudget}`);

    if (data.details) {
      for (const [key, val] of Object.entries(data.details)) {
        if (val) parts.push(`• *${key}:* ${val}`);
      }
    }
  }

  if (data.hasAttachment) {
    parts.push(`📎 *CAD / Drawing File:* ${data.fileName || 'Attached in Portal'}`);
  }

  if (data.message) {
    parts.push('');
    parts.push('📝 *PROJECT SCOPE / MESSAGE:*');
    parts.push(data.message.trim());
  }

  parts.push('');
  parts.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  parts.push('✅ _Registered in VSS Alutech Portal. Please review & confirm callback._');

  return parts.join('\n');
}

/**
 * Build direct WhatsApp Web / App link with encoded complete text
 */
export function buildWhatsAppUrl(message: string, phoneNumber = VSS_PRIMARY_WHATSAPP): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Directly launch WhatsApp in a new tab or app with the complete message
 */
export function openWhatsAppDirectly(message: string, phoneNumber = VSS_PRIMARY_WHATSAPP): Window | null {
  const url = buildWhatsAppUrl(message, phoneNumber);
  if (typeof window !== 'undefined') {
    return window.open(url, '_blank', 'noopener,noreferrer');
  }
  return null;
}
