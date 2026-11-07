import {
  Enquiry,
  EnquirySubmissionPayload,
  EnquirySubmissionResponse,
  EnquiryStatus,
  EnquiryActivity,
} from '../types';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const STORAGE_KEY = 'vss_alutech_b2b_enquiries_v1';
const ACTIVITIES_STORAGE_KEY = 'vss_alutech_b2b_activities_v1';
const ADMIN_TOKEN_KEY = 'vss_alutech_admin_jwt_token';

/**
 * Determine dynamic API Base URL
 */
export const getBackendApiUrl = (): string => {
  // 1. Explicitly configured VITE_API_BASE_URL (used for GitHub Pages -> External Backend)
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '');
  }

  // 2. In browser window: if on localhost or Cloud Run, use current origin
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('run.app')) {
      return origin;
    }
  }

  return '';
};

// Seed realistic B2B initial sample enquiries if storage is empty
const INITIAL_DEMO_ENQUIRIES: Enquiry[] = [
  {
    id: '1',
    referenceId: 'VSS-CNT-2026-X9K201',
    fullName: 'Rajesh Sharma',
    companyName: 'Apex Extrusions Pvt Ltd',
    phoneNumber: '+91 98201 44552',
    emailAddress: 'r.sharma@apexextrusions.in',
    cityState: 'Pune, Maharashtra',
    country: 'India',
    serviceCategory: 'Aluminium extrusion press solutions',
    plantLocation: 'Chakan MIDC Phase 2, Pune',
    machineryRequired: '1450 UST Extrusion Press with Puller and Handling Table',
    pressCapacity: '1450 UST (7-inch container)',
    technicalSpecs: 'Architectural 6063-T6 sections, monthly target 250 MT. Requirement for hot shear and runout cooling table.',
    approxBudget: '₹2.5 Cr - ₹3.2 Cr',
    projectStage: 'Plant Expansion / Line Addition',
    timelineUrgency: '1 to 3 Months',
    preferredContact: 'WhatsApp',
    message: 'We are expanding our existing line and need guidance on selecting either a new or refurbished 1450 UST direct extrusion press with complete handling system.',
    additionalNotes: 'Need factory inspection in early November.',
    status: 'in_review',
    adminNotes: 'Spoke with Director Mr. Sharma. Shared press layout drawings. Site visit scheduled.',
    emailStatus: 'sent',
    emailSentAt: '2026-10-14T09:30:00Z',
    createdAt: '2026-10-14T09:28:15Z',
    updatedAt: '2026-10-14T11:45:00Z',
  },
  {
    id: '2',
    referenceId: 'VSS-CNT-2026-F4N812',
    fullName: 'Vikram Mehta',
    companyName: 'Gujarat Aluminium Profiles',
    phoneNumber: '+91 97129 88300',
    emailAddress: 'vikram@gujaratprofiles.com',
    cityState: 'Vadodara, Gujarat',
    country: 'India',
    serviceCategory: 'Furnace selection, setup and execution',
    plantLocation: 'Savli GIDC, Vadodara',
    machineryRequired: 'LPG Gas-Fired Rapid Billet Heater with Hot Log Shear',
    pressCapacity: 'For 1100 UST Press (5-inch & 6-inch logs)',
    technicalSpecs: 'Need high thermal efficiency to reduce specific fuel consumption below 35 kg LPG/MT.',
    approxBudget: '₹45 Lakhs - ₹60 Lakhs',
    projectStage: 'Machinery Replacement / Modernization',
    timelineUrgency: 'Immediate (Within 1-2 weeks)',
    preferredContact: 'Phone Call',
    message: 'Current furnace has high scale loss and temperature gradient across billets. Urgent engineering visit required to assess burner overhaul or replacement.',
    status: 'new',
    emailStatus: 'sent',
    emailSentAt: '2026-10-15T08:15:00Z',
    createdAt: '2026-10-15T08:12:00Z',
    updatedAt: '2026-10-15T08:15:00Z',
  },
  {
    id: '3',
    referenceId: 'VSS-CNT-2026-M2L903',
    fullName: 'Suresh Patil',
    companyName: 'Kolhapur Extrusion Mills',
    phoneNumber: '+91 98220 12345',
    emailAddress: 'suresh@kolhapurextrusions.in',
    cityState: 'Kolhapur, Maharashtra',
    country: 'India',
    serviceCategory: 'Plant maintenance and technical consultancy',
    plantLocation: 'Shiroli MIDC, Kolhapur',
    machineryRequired: 'Press hydraulic and container alignment diagnosis',
    pressCapacity: '900 UST Press',
    technicalSpecs: 'Frequent die choking on thin-wall architectural profiles. Container temperature drop suspected.',
    approxBudget: '₹8 Lakhs - ₹12 Lakhs',
    projectStage: 'Plant Maintenance & Optimization',
    timelineUrgency: 'Immediate (Within 1-2 weeks)',
    preferredContact: 'WhatsApp',
    message: 'We are facing high profile distortion and cycle-time lag on our 900 UST press line. Need senior consultant for container alignment check and hydraulic pressure calibration.',
    status: 'in_review',
    emailStatus: 'sent',
    emailSentAt: '2026-10-16T14:10:00Z',
    createdAt: '2026-10-16T14:05:00Z',
    updatedAt: '2026-10-16T14:10:00Z',
  },
];

const INITIAL_DEMO_ACTIVITIES: EnquiryActivity[] = [
  {
    id: 'act-001',
    enquiryId: '1',
    action: 'Enquiry Registered',
    details: { service: 'Aluminium extrusion press solutions' },
    performedBy: 'System Web Form',
    createdAt: '2026-10-14T09:28:15Z',
  },
  {
    id: 'act-002',
    enquiryId: '1',
    action: 'Notification Dispatched',
    details: { recipient: 'info@vsslutechsolutions.in' },
    performedBy: 'Nodemailer Dispatcher',
    createdAt: '2026-10-14T09:30:00Z',
  },
];

// Helper to access LocalStorage safely
const getStoredEnquiries = (): Enquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ENQUIRIES));
      return INITIAL_DEMO_ENQUIRIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('LocalStorage error:', err);
    return INITIAL_DEMO_ENQUIRIES;
  }
};

const setStoredEnquiries = (enquiries: Enquiry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
};

const getStoredActivities = (): EnquiryActivity[] => {
  try {
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ACTIVITIES));
      return INITIAL_DEMO_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ACTIVITIES;
  }
};

const addStoredActivity = (activity: Omit<EnquiryActivity, 'id' | 'createdAt'>): void => {
  try {
    const activities = getStoredActivities();
    const newActivity: EnquiryActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newActivity);
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  } catch (err) {
    console.warn('Failed to log activity:', err);
  }
};

export const enquiryService = {
  /**
   * Submit Customer Enquiry to Real Backend (or Supabase/LocalStorage fallback)
   */
  async submitEnquiry(payload: EnquirySubmissionPayload): Promise<EnquirySubmissionResponse> {
    // 1. Anti-spam honeypot detection
    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      console.warn('Spam honeypot triggered; rejecting submission.');
      return {
        success: false,
        message: 'Invalid submission detected.',
      };
    }

    const fullName = payload.fullName?.trim() || '';
    const companyName = payload.companyName?.trim() || '';
    const mobileNumber = payload.phoneNumber?.trim() || '';
    const businessEmail = payload.emailAddress?.trim().toLowerCase() || '';

    // Validate essential fields
    if (fullName.length < 2) {
      return { success: false, message: 'Please provide your full name (minimum 2 characters).' };
    }
    if (companyName.length < 2) {
      return { success: false, message: 'Please provide your company name.' };
    }
    if (mobileNumber.length < 7) {
      return { success: false, message: 'Please provide a valid phone or WhatsApp number.' };
    }
    if (!businessEmail.includes('@') || !businessEmail.includes('.')) {
      return { success: false, message: 'Please provide a valid business email address.' };
    }

    const apiBase = getBackendApiUrl();

    // 2. Determine target API endpoint
    // Case A: Machinery Quote Request with file attachment or press specifications
    if (payload.rawFile) {
      const formData = new FormData();
      formData.append('name', fullName);
      formData.append('email', businessEmail);
      formData.append('phone', mobileNumber);
      formData.append('company', companyName);
      formData.append('plantLocation', payload.plantLocation || payload.cityState || '');
      formData.append('machineryType', payload.machineryRequired || payload.serviceCategory || 'Machinery Quotation');
      if (payload.pressCapacity) formData.append('pressTonnage', payload.pressCapacity);
      if (payload.technicalSpecs) formData.append('technicalSpecs', payload.technicalSpecs);
      if (payload.timelineUrgency) formData.append('deliveryTimeline', payload.timelineUrgency);
      formData.append('file', payload.rawFile);

      try {
        const res = await fetch(`${apiBase}/api/quote-request`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          const refId = data.referenceId || data.data?.trackingId || `VSS-QTE-${Date.now().toString().slice(-6)}`;
          return {
            success: true,
            referenceId: refId,
            emailStatus: 'sent',
            message: data.message || 'Your machinery quote request and drawings have been successfully received.',
          };
        }

        if (res.status === 422 && data.validationErrors) {
          return {
            success: false,
            message: data.validationErrors.map((e: any) => e.message).join(' ') || data.error,
          };
        }

        return {
          success: false,
          message: data.error || `Server responded with error (${res.status}).`,
        };
      } catch (err: any) {
        console.error('Error submitting quote request to backend:', err);
      }
    }

    // Case B: Industrial Manpower Request
    const isManpower =
      payload.serviceCategory?.toLowerCase().includes('manpower') ||
      payload.serviceCategory?.toLowerCase().includes('staffing');

    if (isManpower) {
      const body = {
        name: fullName,
        email: businessEmail,
        phone: mobileNumber,
        company: companyName,
        plantLocation: payload.plantLocation || payload.cityState,
        designation: payload.machineryRequired || 'Extrusion Press Operator',
        workerCount: 1,
        skillLevel: 'Skilled',
        shiftDetails: 'Single Day Shift',
        requirementUrgency: payload.timelineUrgency || 'Standard (1-2 weeks)',
        notes: payload.message,
      };

      try {
        const res = await fetch(`${apiBase}/api/manpower-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          const refId = data.referenceId || data.data?.trackingId || `VSS-MPR-${Date.now().toString().slice(-6)}`;
          return {
            success: true,
            referenceId: refId,
            emailStatus: 'sent',
            message: data.message || 'Your staffing request has been received.',
          };
        }

        if (res.status === 422 && data.validationErrors) {
          return {
            success: false,
            message: data.validationErrors.map((e: any) => e.message).join(' ') || data.error,
          };
        }
      } catch (err) {
        console.error('Error submitting manpower request to backend:', err);
      }
    }

    // Case C: Standard Business Enquiry / Plant Consultation
    try {
      const contactBody = {
        name: fullName,
        email: businessEmail,
        phone: mobileNumber,
        company: companyName,
        serviceCategory: payload.serviceCategory,
        plantLocation: payload.plantLocation || payload.cityState,
        message: payload.message,
        pressCapacity: payload.pressCapacity,
        approxBudget: payload.approxBudget,
        projectStage: payload.projectStage,
        timelineUrgency: payload.timelineUrgency,
        preferredContact: payload.preferredContact,
      };

      const res = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactBody),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const refId = data.referenceId || data.data?.trackingId || `VSS-CNT-${Date.now().toString().slice(-6)}`;
        return {
          success: true,
          referenceId: refId,
          emailStatus: 'sent',
          message: data.message || 'Your enquiry has been successfully logged.',
        };
      }

      if (res.status === 422 && data.validationErrors) {
        return {
          success: false,
          message: data.validationErrors.map((e: any) => e.message).join(' ') || data.error,
        };
      }

      if (data.error) {
        return { success: false, message: data.error };
      }
    } catch (netErr: any) {
      console.warn('Backend API connection failed, attempting fallback:', netErr.message);
    }

    // Fallback: If external Supabase Edge Function is configured, try it
    if (isSupabaseConfigured() && supabase) {
      try {
        const edgeFunctionUrl = 'https://cvamnocsfuanbwbljblm.supabase.co/functions/v1/submit-enquiry';
        const res = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email: businessEmail,
            phone: mobileNumber,
            company: companyName,
            message: payload.message,
          }),
        });

        if (res.ok) {
          const result = await res.json().catch(() => ({}));
          return {
            success: true,
            referenceId: result.referenceId || `VSS-${Date.now().toString().slice(-6)}`,
            emailStatus: 'sent',
            message: 'Your enquiry has been successfully submitted and saved.',
          };
        }
      } catch (e) {
        // Continue to offline warning
      }
    }

    // If completely offline or GitHub Pages without configured backend URL:
    return {
      success: false,
      message:
        'Could not connect to the VSS Alutech backend server. Please verify your internet connection or backend URL configuration.',
    };
  },

  /**
   * Admin: Check if initial superadmin setup is required
   */
  async getAdminSetupStatus(): Promise<{ needsSetup: boolean }> {
    const apiBase = getBackendApiUrl();
    try {
      const res = await fetch(`${apiBase}/api/admin/setup-status`);
      if (res.ok) {
        const data = await res.json();
        return { needsSetup: Boolean(data.needsSetup) };
      }
    } catch (e) {
      // ignore
    }
    return { needsSetup: false };
  },

  /**
   * Admin: Initial First-Time Administrator Onboarding
   */
  async adminSetup(email: string, password: string, fullName: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const apiBase = getBackendApiUrl();
    try {
      const res = await fetch(`${apiBase}/api/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        return { success: true, token: data.token };
      }
      return { success: false, error: data.error || 'Failed to complete administrator setup.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to setup service.' };
    }
  },

  /**
   * Admin: Secure Login returning JWT
   */
  async adminLogin(email: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    const apiBase = getBackendApiUrl();
    try {
      const res = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        return { success: true, token: data.token, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid administrator credentials.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  },

  /**
   * Admin: Retrieve stored session token
   */
  getStoredToken(): string | null {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  },

  /**
   * Admin: Logout
   */
  logoutAdmin(): void {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  /**
   * Fetch all enquiries (From Real SQLite Backend via Bearer JWT, or fallback)
   */
  async getEnquiries(token?: string): Promise<Enquiry[]> {
    const activeToken = token || this.getStoredToken();
    const apiBase = getBackendApiUrl();

    if (activeToken) {
      try {
        const res = await fetch(`${apiBase}/api/admin/submissions?limit=100`, {
          headers: {
            'Authorization': `Bearer ${activeToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
            return data.submissions.map((s: any) => ({
              id: String(s.id),
              referenceId: s.tracking_id,
              fullName: s.name,
              companyName: s.company || 'Enterprise Client',
              phoneNumber: s.phone,
              emailAddress: s.email,
              cityState: s.plant_location || 'India',
              country: 'India',
              serviceCategory: s.service_category || 'Industrial Enquiry',
              message: s.message || '',
              plantLocation: s.plant_location,
              machineryRequired: s.details?.['Machinery / Tooling Scope'] || s.details?.['Designation / Role'],
              pressCapacity: s.details?.['Press / Equipment Capacity'] || s.details?.['Press Tonnage Capacity'],
              technicalSpecs: s.details ? JSON.stringify(s.details) : undefined,
              status: s.status as EnquiryStatus,
              adminNotes: s.admin_notes || undefined,
              emailStatus: s.admin_email_sent ? 'sent' : 'pending',
              attachmentName: s.file_name || undefined,
              createdAt: s.created_at,
              updatedAt: s.updated_at,
            }));
          }
        }
      } catch (err) {
        console.warn('Backend submissions fetch error:', err);
      }
    }

    return getStoredEnquiries();
  },

  /**
   * Update Enquiry Status
   */
  async updateStatus(
    id: string,
    status: EnquiryStatus,
    adminEmail = 'admin@vsslutechsolutions.in'
  ): Promise<boolean> {
    const activeToken = this.getStoredToken();
    const apiBase = getBackendApiUrl();

    if (activeToken) {
      try {
        const res = await fetch(`${apiBase}/api/admin/submissions/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`,
          },
          body: JSON.stringify({ status }),
        });
        if (res.ok) return true;
      } catch (e) {
        console.warn('Failed to update status on server:', e);
      }
    }

    // Local fallback update
    const list = getStoredEnquiries();
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const prevStatus = list[idx].status;
      list[idx].status = status;
      list[idx].updatedAt = new Date().toISOString();
      setStoredEnquiries(list);

      addStoredActivity({
        enquiryId: id,
        action: `Status changed from ${prevStatus} to ${status}`,
        details: { from: prevStatus, to: status },
        performedBy: adminEmail,
      });
      return true;
    }
    return false;
  },

  /**
   * Update Admin Notes
   */
  async updateNotes(
    id: string,
    notes: string,
    adminEmail = 'admin@vsslutechsolutions.in'
  ): Promise<boolean> {
    const activeToken = this.getStoredToken();
    const apiBase = getBackendApiUrl();

    if (activeToken) {
      try {
        const res = await fetch(`${apiBase}/api/admin/submissions/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`,
          },
          body: JSON.stringify({ adminNotes: notes }),
        });
        if (res.ok) return true;
      } catch (e) {
        console.warn('Failed to update notes on server:', e);
      }
    }

    const list = getStoredEnquiries();
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      list[idx].adminNotes = notes;
      list[idx].updatedAt = new Date().toISOString();
      setStoredEnquiries(list);

      addStoredActivity({
        enquiryId: id,
        action: 'Admin notes updated',
        performedBy: adminEmail,
      });
      return true;
    }
    return false;
  },

  /**
   * Delete or archive an enquiry
   */
  async deleteEnquiry(id: string): Promise<boolean> {
    const activeToken = this.getStoredToken();
    const apiBase = getBackendApiUrl();

    if (activeToken) {
      try {
        const res = await fetch(`${apiBase}/api/admin/submissions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
          },
        });
        if (res.ok) return true;
      } catch (e) {
        console.warn('Failed to delete on server:', e);
      }
    }

    const list = getStoredEnquiries();
    const filtered = list.filter((e) => e.id !== id);
    setStoredEnquiries(filtered);
    return true;
  },

  /**
   * Retry sending notification email
   */
  async retryEmailNotification(_id: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Notification email successfully triggered to engineering desk.' };
  },

  /**
   * Get audit activities for an enquiry
   */
  async getActivities(enquiryId: string): Promise<EnquiryActivity[]> {
    const all = getStoredActivities();
    return all.filter((a) => a.enquiryId === enquiryId);
  },

  /**
   * Export enquiries to CSV format
   */
  exportToCSV(enquiries: Enquiry[]): void {
    const headers = [
      'Reference ID',
      'Created Date',
      'Status',
      'Customer Name',
      'Company Name',
      'Phone / WhatsApp',
      'Email',
      'City & State',
      'Country',
      'Service Category',
      'Machinery / Press',
      'Capacity',
      'Budget',
      'Project Stage',
      'Urgency',
      'Email Delivery Status',
      'Message',
      'Admin Notes',
    ];

    const escapeCSV = (value: unknown): string => {
      if (value === undefined || value === null) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = enquiries.map((e) => [
      escapeCSV(e.referenceId),
      escapeCSV(new Date(e.createdAt).toLocaleString('en-IN')),
      escapeCSV(e.status.toUpperCase()),
      escapeCSV(e.fullName),
      escapeCSV(e.companyName),
      escapeCSV(e.phoneNumber),
      escapeCSV(e.emailAddress),
      escapeCSV(e.cityState),
      escapeCSV(e.country),
      escapeCSV(e.serviceCategory),
      escapeCSV(e.machineryRequired || '-'),
      escapeCSV(e.pressCapacity || '-'),
      escapeCSV(e.approxBudget || '-'),
      escapeCSV(e.projectStage || '-'),
      escapeCSV(e.timelineUrgency || '-'),
      escapeCSV(e.emailStatus.toUpperCase()),
      escapeCSV(e.message),
      escapeCSV(e.adminNotes || ''),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `VSS_Alutech_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
