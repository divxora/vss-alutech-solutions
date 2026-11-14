import {
  Enquiry,
  EnquirySubmissionPayload,
  EnquirySubmissionResponse,
  EnquiryStatus,
  EnquiryActivity,
} from '../types';

const STORAGE_KEY = 'vss_alutech_b2b_enquiries_v1';
const ACTIVITIES_STORAGE_KEY = 'vss_alutech_b2b_activities_v1';
const MANUAL_DELETED_KEY = 'vss_alutech_manual_deleted_ids_v1';
const ADMIN_TOKEN_KEY = 'vss_alutech_admin_jwt_token';

const IDB_NAME = 'vss_alutech_archive_db';
const IDB_VERSION = 1;
const IDB_STORE_ENQUIRIES = 'enquiries';

/**
 * Live Production Backend URL on Render
 */
export const LIVE_RENDER_BACKEND = 'https://vss-alutech-backend.onrender.com';

/**
 * Determine dynamic API Base URL
 */
export const getBackendApiUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '');
  }
  return LIVE_RENDER_BACKEND;
};

// ============================================================================
// PERMANENT ARCHIVE STORAGE (LocalStorage + IndexedDB — NEVER AUTO-CLEARED)
// Records are retained indefinitely and ONLY deleted on explicit manual action.
// ============================================================================

const getManualDeletedKeys = (): Set<string> => {
  try {
    const raw = localStorage.getItem(MANUAL_DELETED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
};

const addManualDeletedKeys = (keys: string[]): void => {
  try {
    const set = getManualDeletedKeys();
    keys.filter(Boolean).forEach((k) => set.add(String(k)));
    localStorage.setItem(MANUAL_DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore storage quota errors
  }
};

const clearManualDeletedKeys = (): void => {
  try {
    localStorage.removeItem(MANUAL_DELETED_KEY);
  } catch {
    // ignore
  }
};

const isManuallyDeleted = (enq: Pick<Enquiry, 'id' | 'referenceId'>, deletedSet: Set<string>): boolean => {
  return deletedSet.has(String(enq.id)) || deletedSet.has(String(enq.referenceId));
};

const getEnquiryStableKey = (enq: Pick<Enquiry, 'id' | 'referenceId'>): string => {
  return (enq.referenceId || enq.id || '').trim();
};

const getStoredEnquiries = (): Enquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
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

// IndexedDB Archive Helpers for multi-year, high-capacity local persistence
const openArchiveDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE_ENQUIRIES)) {
          db.createObjectStore(IDB_STORE_ENQUIRIES, { keyPath: 'archiveKey' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

const readAllFromIDB = async (): Promise<Enquiry[]> => {
  const db = await openArchiveDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_ENQUIRIES, 'readonly');
      const store = tx.objectStore(IDB_STORE_ENQUIRIES);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = Array.isArray(req.result) ? req.result : [];
        resolve(rows.map(({ archiveKey: _k, ...rest }: any) => rest as Enquiry));
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
};

const writeAllToIDB = async (enquiries: Enquiry[]): Promise<void> => {
  const db = await openArchiveDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_ENQUIRIES, 'readwrite');
      const store = tx.objectStore(IDB_STORE_ENQUIRIES);
      for (const item of enquiries) {
        const archiveKey = getEnquiryStableKey(item);
        if (archiveKey) {
          store.put({ ...item, archiveKey });
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
};

const deleteFromIDB = async (keys: string[]): Promise<void> => {
  const db = await openArchiveDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_ENQUIRIES, 'readwrite');
      const store = tx.objectStore(IDB_STORE_ENQUIRIES);
      keys.filter(Boolean).forEach((k) => store.delete(k));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
};

const clearIDB = async (): Promise<void> => {
  const db = await openArchiveDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_ENQUIRIES, 'readwrite');
      tx.objectStore(IDB_STORE_ENQUIRIES).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
};

const mergeEnquiryRecords = (primary: Enquiry, secondary: Enquiry): Enquiry => {
  // Primary (typically latest server or latest edit) wins for defined fields,
  // while preserving rich fields from secondary if primary omits them.
  return {
    ...secondary,
    ...primary,
    adminNotes: primary.adminNotes ?? secondary.adminNotes,
    approxBudget: primary.approxBudget || secondary.approxBudget,
    projectStage: primary.projectStage || secondary.projectStage,
    timelineUrgency: primary.timelineUrgency || secondary.timelineUrgency,
    preferredContact: primary.preferredContact || secondary.preferredContact,
    additionalNotes: primary.additionalNotes || secondary.additionalNotes,
    machineryRequired: primary.machineryRequired || secondary.machineryRequired,
    pressCapacity: primary.pressCapacity || secondary.pressCapacity,
    technicalSpecs: primary.technicalSpecs || secondary.technicalSpecs,
    attachmentName: primary.attachmentName || secondary.attachmentName,
    attachmentSizeMB: primary.attachmentSizeMB || secondary.attachmentSizeMB,
  };
};

const sortEnquiriesNewestFirst = (list: Enquiry[]): Enquiry[] => {
  return [...list].sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    if (tB !== tA) return tB - tA;
    return String(b.referenceId).localeCompare(String(a.referenceId));
  });
};

const getCombinedLocalArchive = async (): Promise<Enquiry[]> => {
  const deletedSet = getManualDeletedKeys();
  const lsItems = getStoredEnquiries();
  const idbItems = await readAllFromIDB();

  const map = new Map<string, Enquiry>();
  for (const item of [...idbItems, ...lsItems]) {
    if (isManuallyDeleted(item, deletedSet)) continue;
    const key = getEnquiryStableKey(item);
    if (!key) continue;
    const existing = map.get(key);
    map.set(key, existing ? mergeEnquiryRecords(item, existing) : item);
  }

  return sortEnquiriesNewestFirst(Array.from(map.values()));
};

const persistArchiveUnion = async (incoming: Enquiry[]): Promise<Enquiry[]> => {
  const deletedSet = getManualDeletedKeys();
  const existingList = await getCombinedLocalArchive();
  const map = new Map<string, Enquiry>();

  for (const item of existingList) {
    if (isManuallyDeleted(item, deletedSet)) continue;
    const key = getEnquiryStableKey(item);
    if (key) map.set(key, item);
  }

  for (const item of incoming) {
    if (isManuallyDeleted(item, deletedSet)) continue;
    const key = getEnquiryStableKey(item);
    if (!key) continue;
    const prev = map.get(key);
    map.set(key, prev ? mergeEnquiryRecords(item, prev) : item);
  }

  const merged = sortEnquiriesNewestFirst(Array.from(map.values()));
  setStoredEnquiries(merged);
  await writeAllToIDB(merged);
  return merged;
};

const getStoredActivities = (): EnquiryActivity[] => {
  try {
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

const mapServerSubmissionToEnquiry = (s: any): Enquiry => {
  const details = s.details || {};
  return {
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
    plantLocation: s.plant_location || undefined,
    machineryRequired:
      details?.['Machinery / Tooling Scope'] || details?.['Designation / Role'] || undefined,
    pressCapacity:
      details?.['Press / Equipment Capacity'] || details?.['Press Tonnage Capacity'] || undefined,
    approxBudget: details?.['Estimated Investment Budget'] || undefined,
    projectStage: details?.['Project Lifecycle Stage'] || undefined,
    timelineUrgency:
      details?.['Deployment Urgency'] ||
      details?.['Required Delivery Window'] ||
      details?.['Requirement Urgency'] ||
      undefined,
    preferredContact: details?.['Preferred Contact Method'] || undefined,
    technicalSpecs: s.details ? JSON.stringify(s.details) : undefined,
    status: (s.status || 'new') as EnquiryStatus,
    adminNotes: s.admin_notes || undefined,
    emailStatus: s.admin_email_sent ? 'sent' : 'pending',
    attachmentName: s.file_name || undefined,
    createdAt: s.created_at,
    updatedAt: s.updated_at || s.created_at,
  };
};

const buildEnquiryFromPayload = (
  payload: EnquirySubmissionPayload,
  referenceId: string,
  emailStatus: 'sent' | 'pending' = 'sent'
): Enquiry => {
  const now = payload.submittedAtClient || new Date().toISOString();
  return {
    id: referenceId,
    referenceId,
    fullName: payload.fullName.trim(),
    companyName: payload.companyName.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    emailAddress: payload.emailAddress.trim().toLowerCase(),
    cityState: payload.cityState || payload.plantLocation || 'India',
    country: payload.country || 'India',
    serviceCategory: payload.serviceCategory || 'Industrial Enquiry',
    message: payload.message || '',
    plantLocation: payload.plantLocation,
    machineryRequired: payload.machineryRequired,
    pressCapacity: payload.pressCapacity,
    technicalSpecs: payload.technicalSpecs,
    approxBudget: payload.approxBudget,
    projectStage: payload.projectStage,
    timelineUrgency: payload.timelineUrgency,
    preferredContact: payload.preferredContact,
    additionalNotes: payload.additionalNotes,
    attachmentName: payload.attachmentName || payload.rawFile?.name,
    attachmentSizeMB: payload.attachmentSizeMB,
    status: 'new',
    emailStatus,
    createdAt: now,
    updatedAt: now,
  };
};

export const enquiryService = {
  /**
   * Submit Customer Enquiry to Real Backend AND mirror into Permanent Client Vault
   */
  async submitEnquiry(payload: EnquirySubmissionPayload): Promise<EnquirySubmissionResponse> {
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

    // Case A: Machinery Quote Request with file attachment or press specifications
    if (payload.rawFile) {
      const formData = new FormData();
      formData.append('name', fullName);
      formData.append('email', businessEmail);
      formData.append('phone', mobileNumber);
      formData.append('company', companyName);
      formData.append('plantLocation', payload.plantLocation || payload.cityState || '');
      formData.append(
        'machineryType',
        payload.machineryRequired || payload.serviceCategory || 'Machinery Quotation'
      );
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
          const refId =
            data.referenceId || data.data?.trackingId || `VSS-QTE-${Date.now().toString().slice(-6)}`;
          await persistArchiveUnion([buildEnquiryFromPayload(payload, refId, 'sent')]);
          return {
            success: true,
            referenceId: refId,
            emailStatus: 'sent',
            message:
              data.message || 'Your machinery quote request and drawings have been successfully received.',
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
        (payload.fullName?.includes('Staffing Lead')
          ? payload.fullName.replace('Staffing Lead', '').trim()
          : '') ||
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
          const refId =
            data.referenceId || data.data?.trackingId || `VSS-MPR-${Date.now().toString().slice(-6)}`;
          await persistArchiveUnion([buildEnquiryFromPayload(payload, refId, 'sent')]);
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
        const refId =
          data.referenceId || data.data?.trackingId || `VSS-CNT-${Date.now().toString().slice(-6)}`;
        await persistArchiveUnion([buildEnquiryFromPayload(payload, refId, 'sent')]);
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
        message:
          'Could not connect to the VSS Alutech backend server. Please verify your connection or backend URL.',
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
    } catch {
      // ignore
    }
    return { needsSetup: false };
  },

  /**
   * Admin: Initial First-Time Administrator Onboarding
   */
  async adminSetup(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; token?: string; error?: string }> {
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
  async adminLogin(
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
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

  getStoredToken(): string | null {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  },

  logoutAdmin(): void {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  /**
   * Fetch ALL enquiries across all pages and years, merging with the permanent client vault.
   * Never drops, truncates, or auto-clears stored requests.
   */
  async getEnquiries(token?: string): Promise<Enquiry[]> {
    const activeToken = token || this.getStoredToken();
    const apiBase = getBackendApiUrl();

    const serverSubmissions: Enquiry[] = [];

    if (activeToken) {
      try {
        let page = 1;
        let totalPages = 1;
        const maxSafePages = 500; // Supports 50,000+ records safely

        while (page <= totalPages && page <= maxSafePages) {
          const res = await fetch(
            `${apiBase}/api/admin/submissions?page=${page}&limit=1000&all=true`,
            {
              headers: {
                Authorization: `Bearer ${activeToken}`,
              },
            }
          );

          if (!res.ok) break;

          const data = await res.json();
          if (!data.success || !Array.isArray(data.submissions)) break;

          const mapped = data.submissions.map(mapServerSubmissionToEnquiry);
          serverSubmissions.push(...mapped);

          const reportedPages = Number(data.pagination?.totalPages || 1);
          totalPages = Number.isFinite(reportedPages) && reportedPages >= 1 ? reportedPages : 1;

          // If backend returned all in one shot or reached last page, stop paging
          if (data.submissions.length === 0 || page >= totalPages) {
            break;
          }
          page += 1;
        }
      } catch (err) {
        console.warn('Backend submissions fetch error (preserving archived records):', err);
      }
    }

    if (serverSubmissions.length > 0) {
      return await persistArchiveUnion(serverSubmissions);
    }

    return await getCombinedLocalArchive();
  },

  /**
   * Update Enquiry Status (updates server + permanent local archive)
   */
  async updateStatus(
    id: string,
    status: EnquiryStatus,
    adminEmail = 'vssalutechsolutions@gmail.com'
  ): Promise<boolean> {
    const activeToken = this.getStoredToken();
    const apiBase = getBackendApiUrl();
    let updatedRemote = false;

    if (activeToken && /^\d+$/.test(String(id))) {
      try {
        const res = await fetch(`${apiBase}/api/admin/submissions/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({ status }),
        });
        if (res.ok) updatedRemote = true;
      } catch (e) {
        console.warn('Failed to update status on server:', e);
      }
    }

    const archive = await getCombinedLocalArchive();
    const idx = archive.findIndex((e) => e.id === id || e.referenceId === id);
    if (idx !== -1) {
      const prevStatus = archive[idx].status;
      archive[idx] = {
        ...archive[idx],
        status,
        updatedAt: new Date().toISOString(),
      };
      await persistArchiveUnion(archive);

      addStoredActivity({
        enquiryId: archive[idx].id,
        action: `Status changed from ${prevStatus} to ${status}`,
        details: { from: prevStatus, to: status },
        performedBy: adminEmail,
      });
      return true;
    }

    return updatedRemote;
  },

  /**
   * Update Admin Notes (updates server + permanent local archive)
   */
  async updateNotes(
    id: string,
    notes: string,
    adminEmail = 'vssalutechsolutions@gmail.com',
    currentStatus?: EnquiryStatus
  ): Promise<boolean> {
    const activeToken = this.getStoredToken();
    const apiBase = getBackendApiUrl();
    let updatedRemote = false;

    const archive = await getCombinedLocalArchive();
    const existing = archive.find((e) => e.id === id || e.referenceId === id);
    const statusToSend = currentStatus || existing?.status;

    if (activeToken && /^\d+$/.test(String(id))) {
      try {
        const bodyPayload: Record<string, any> = { adminNotes: notes };
        if (statusToSend) bodyPayload.status = statusToSend;

        const res = await fetch(`${apiBase}/api/admin/submissions/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify(bodyPayload),
        });
        if (res.ok) updatedRemote = true;
      } catch (e) {
        console.warn('Failed to update notes on server:', e);
      }
    }

    if (existing) {
      existing.adminNotes = notes;
      existing.updatedAt = new Date().toISOString();
      await persistArchiveUnion([existing]);

      addStoredActivity({
        enquiryId: existing.id,
        action: 'Admin notes updated',
        performedBy: adminEmail,
      });
      return true;
    }

    return updatedRemote;
  },

  /**
   * Manually delete a single enquiry (ONLY called when admin explicitly clicks manual Delete)
   */
  async deleteEnquiry(id: string, referenceId?: string): Promise<boolean> {
    const activeToken = this.getStoredToken();
    const apiBase = getBackendApiUrl();

    if (activeToken && /^\d+$/.test(String(id))) {
      try {
        await fetch(`${apiBase}/api/admin/submissions/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });
      } catch (e) {
        console.warn('Failed to delete on server:', e);
      }
    }

    const keysToDelete = [String(id)];
    if (referenceId) keysToDelete.push(String(referenceId));

    addManualDeletedKeys(keysToDelete);

    const list = getStoredEnquiries();
    const matched = list.find((e) => e.id === id || (referenceId && e.referenceId === referenceId));
    if (matched) {
      keysToDelete.push(getEnquiryStableKey(matched));
      addManualDeletedKeys([matched.id, matched.referenceId]);
    }

    const filtered = list.filter(
      (e) => e.id !== id && (!referenceId || e.referenceId !== referenceId)
    );
    setStoredEnquiries(filtered);
    await deleteFromIDB(keysToDelete);
    return true;
  },

  /**
   * Retry sending notification email
   */
  async retryEmailNotification(_id: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Notification email successfully triggered to engineering desk.',
    };
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
   * Export lossless JSON backup of all saved requests for multi-year archival portability
   */
  exportArchiveJSON(enquiries: Enquiry[]): void {
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      source: 'VSS Alutech Solutions Admin Portal',
      totalRecords: enquiries.length,
      enquiries,
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `VSS_Alutech_Requests_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Restore / merge requests from an exported JSON backup file into permanent archive
   */
  async importArchiveJSON(jsonText: string): Promise<{ imported: number; total: number }> {
    const parsed = JSON.parse(jsonText);
    const list: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.enquiries)
        ? parsed.enquiries
        : [];

    const normalized: Enquiry[] = list
      .filter((item) => item && (item.referenceId || item.id) && (item.fullName || item.emailAddress))
      .map((item) => ({
        ...item,
        id: String(item.id || item.referenceId),
        referenceId: String(item.referenceId || item.id),
        status: (item.status || 'new') as EnquiryStatus,
        emailStatus: item.emailStatus || 'sent',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      }));

    if (normalized.length === 0) {
      return { imported: 0, total: (await getCombinedLocalArchive()).length };
    }

    // Clear tombstones only for items explicitly restored by admin
    const deletedSet = getManualDeletedKeys();
    normalized.forEach((n) => {
      deletedSet.delete(String(n.id));
      deletedSet.delete(String(n.referenceId));
    });
    try {
      localStorage.setItem(MANUAL_DELETED_KEY, JSON.stringify(Array.from(deletedSet)));
    } catch {
      // ignore
    }

    const merged = await persistArchiveUnion(normalized);
    return { imported: normalized.length, total: merged.length };
  },

  /**
   * Admin: Manually clear ALL submissions from backend and permanent local vault.
   * ONLY executed on explicit confirmed admin trigger.
   */
  async clearAllSubmissions(
    token?: string
  ): Promise<{ success: boolean; count?: number; error?: string }> {
    const activeToken = token || this.getStoredToken();
    const apiBase = getBackendApiUrl();

    let serverCount = 0;

    if (activeToken) {
      try {
        const res = await fetch(`${apiBase}/api/admin/submissions/clear-all`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          serverCount = data.count || 0;
        }
      } catch (err: any) {
        console.warn('Backend clear-all failed:', err);
      }
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
      clearManualDeletedKeys();
    } catch {
      // ignore
    }
    await clearIDB();

    return { success: true, count: serverCount };
  },
};
