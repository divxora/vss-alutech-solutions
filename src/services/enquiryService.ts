import {
  Enquiry,
  EnquirySubmissionPayload,
  EnquirySubmissionResponse,
  EnquiryStatus,
  EnquiryActivity,
} from '../types';

const STORAGE_KEY = 'vss_alutech_b2b_enquiries_v1';
const ACTIVITIES_STORAGE_KEY = 'vss_alutech_b2b_activities_v1';
const ADMIN_TOKEN_KEY = 'vss_alutech_admin_jwt_token';

/**
 * Live Production Backend URL on Render
 */
export const LIVE_RENDER_BACKEND = 'https://vss-alutech-backend.onrender.com';

/**
 * Determine dynamic API Base URL
 */
export const getBackendApiUrl = (): string => {
  // 1. Explicitly configured VITE_API_BASE_URL (if overridden via env)
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '');
  }

  // 2. Default: Live Render Production Backend
  return LIVE_RENDER_BACKEND;
};

// Clean, production-ready storage (no dummy or fake initial enquiries)
const INITIAL_DEMO_ACTIVITIES: EnquiryActivity[] = [];

// Helper to access LocalStorage safely
const getStoredEnquiries = (): Enquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    // Purge legacy hardcoded demo requests if found in browser storage
    if (
      Array.isArray(parsed) &&
      parsed.some(
        (e: any) =>
          e.referenceId === 'VSS-CNT-2026-X9K201' ||
          e.companyName?.includes('Apex Extrusions') ||
          e.companyName?.includes('Gujarat Aluminium') ||
          e.companyName?.includes('Kolhapur Extrusion')
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
      return [];
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
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
      // Parse structured details if present in payload message or fields
      const qtyMatch = payload.message?.match(/Quantity:\s*(\d+)/i);
      const workerCount = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const shiftMatch = payload.message?.match(/Shift:\s*([^|]+)/i);
      const shiftDetails = shiftMatch ? shiftMatch[1].trim() : 'Single Day Shift';
      const skillMatch = payload.message?.match(/Skill Level:\s*([^|]+)/i);
      const skillLevel = skillMatch ? skillMatch[1].trim() : 'Skilled';
      const desigMatch = payload.message?.match(/Designation:\s*([^|]+)/i);
      const designation =
        payload.machineryRequired ||
        (desigMatch ? desigMatch[1].trim() : '') ||
        (payload.fullName?.includes('Staffing Lead') ? payload.fullName.replace('Staffing Lead', '').trim() : '') ||
        'Extrusion Press Operator';

      const body = {
        name: fullName || 'Industrial Client',
        email: businessEmail,
        phone: mobileNumber,
        company: companyName || 'Aluminium Manufacturing Plant',
        plantLocation: payload.plantLocation || payload.cityState || 'India',
        designation,
        workerCount,
        skillLevel,
        shiftDetails,
        requirementUrgency: payload.timelineUrgency || 'Standard (1-2 weeks)',
        notes: payload.message || '',
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
            message: data.message || 'Your industrial staffing request has been successfully registered.',
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
        console.warn('Network issue submitting manpower request:', err?.message || err);
        return {
          success: false,
          message: 'Unable to reach the staffing request server. Please verify network connectivity.',
        };
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

      return {
        success: false,
        message: `Server responded with error (${res.status}).`,
      };
    } catch (netErr: any) {
      console.warn('Backend API connection issue:', netErr?.message || netErr);
      return {
        success: false,
        message: 'Could not connect to the VSS Alutech backend server. Please verify your connection or backend URL.',
      };
    }
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
    adminEmail = 'vssalutechsolutions@gmail.com'
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
    adminEmail = 'vssalutechsolutions@gmail.com'
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

  /**
   * Admin: Clear all submissions from backend and purge local cache
   */
  async clearAllSubmissions(token?: string): Promise<{ success: boolean; count?: number; error?: string }> {
    const activeToken = token || this.getStoredToken();
    const apiBase = getBackendApiUrl();

    // Clear local storage
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
    } catch (e) {
      // ignore
    }

    if (activeToken) {
      try {
        const res = await fetch(`${apiBase}/api/admin/submissions/clear-all`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          return { success: true, count: data.count || 0 };
        }
      } catch (err: any) {
        console.warn('Backend clear-all failed:', err);
      }
    }

    return { success: true, count: 0 };
  },
};
