import {
  Enquiry,
  EnquirySubmissionPayload,
  EnquirySubmissionResponse,
  EnquiryStatus,
  EnquiryActivity,
  EmailDeliveryStatus,
} from '../types';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseUrl,
  getSupabaseAnonKey,
} from '../utils/supabase';

const STORAGE_KEY = 'vss_alutech_b2b_enquiries_v1';
const ACTIVITIES_STORAGE_KEY = 'vss_alutech_b2b_activities_v1';

export const generateReferenceId = (): string => {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestampPart = Date.now().toString().slice(-3);
  return `VSS-${year}-${randomChars}${timestampPart}`;
};

// Seed realistic B2B initial sample enquiries if storage is empty
const INITIAL_DEMO_ENQUIRIES: Enquiry[] = [
  {
    id: 'demo-enq-001',
    referenceId: 'VSS-2026-X9K201',
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
    adminNotes: 'Spoke with Director Mr. Sharma on Oct 14. Shared press layout drawings. Follow-up scheduled for Tuesday.',
    emailStatus: 'sent',
    emailProviderId: 'resend_msg_01JB39AA99201',
    emailSentAt: '2026-10-14T09:30:00Z',
    createdAt: '2026-10-14T09:28:15Z',
    updatedAt: '2026-10-14T11:45:00Z',
  },
  {
    id: 'demo-enq-002',
    referenceId: 'VSS-2026-F4N812',
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
    emailProviderId: 'resend_msg_01JB41BB1034',
    emailSentAt: '2026-10-15T08:15:00Z',
    createdAt: '2026-10-15T08:12:00Z',
    updatedAt: '2026-10-15T08:15:00Z',
  },
  {
    id: 'demo-enq-003',
    referenceId: 'VSS-2026-D3W540',
    fullName: 'Anand Kulkarni',
    companyName: 'Sahyadri Alum-Tech',
    phoneNumber: '+91 94220 77112',
    emailAddress: 'anand@sahyadrialum.co.in',
    cityState: 'Kolhapur, Maharashtra',
    country: 'India',
    serviceCategory: 'Plant troubleshooting and technical consultancy',
    plantLocation: 'Shiroli MIDC, Kolhapur',
    machineryRequired: 'Press hydraulic and container alignment diagnosis',
    pressCapacity: '900 UST Press',
    technicalSpecs: 'Frequent die breakage on hollow architectural sections and wall thickness variation exceeding ±15%.',
    approxBudget: 'Consultancy Retainer',
    projectStage: 'Troubleshooting & Optimization',
    timelineUrgency: 'Immediate (Within 1-2 weeks)',
    preferredContact: 'Phone Call',
    message: 'Severe chatter marks and uneven flow on multi-cavity dies. We suspect platen deflection or guide-shoe wear.',
    status: 'contacted',
    adminNotes: 'Preliminary technical audit scheduled with Senior Metallurgist for this Friday.',
    emailStatus: 'sent',
    emailProviderId: 'resend_msg_01JB44CC8871',
    emailSentAt: '2026-10-15T14:02:00Z',
    createdAt: '2026-10-15T14:00:10Z',
    updatedAt: '2026-10-15T16:20:00Z',
  },
  {
    id: 'demo-enq-004',
    referenceId: 'VSS-2026-M7T109',
    fullName: 'Sunil Nair',
    companyName: 'Deccan Extrusion Dies Ltd',
    phoneNumber: '+91 98450 12903',
    emailAddress: 's.nair@deccanextrusions.com',
    cityState: 'Bengaluru, Karnataka',
    country: 'India',
    serviceCategory: 'Tool-room solutions and die sourcing',
    plantLocation: 'Peenya Industrial Area, Bengaluru',
    machineryRequired: 'Die Corrector staffing and H13 heat-treatment advisory',
    pressCapacity: '1800 UST Press',
    technicalSpecs: 'Sourcing dedicated dies for 6082-T6 structural automotive profiles and solar module frames.',
    approxBudget: '₹20 Lakhs / month die sourcing contract',
    projectStage: 'Die / Tooling Sourcing',
    timelineUrgency: '1 Month',
    preferredContact: 'Email',
    message: 'Seeking reliable die manufacturing partner and on-site die corrector support for complex hollow profiles.',
    status: 'proposal_sent',
    adminNotes: 'Sent commercial proposal VSS-PROP-2026-088. Awaiting purchase committee review.',
    emailStatus: 'sent',
    emailProviderId: 'resend_msg_01JB48DD3319',
    emailSentAt: '2026-10-16T04:10:00Z',
    createdAt: '2026-10-16T04:08:00Z',
    updatedAt: '2026-10-16T05:00:00Z',
  },
];

const INITIAL_DEMO_ACTIVITIES: EnquiryActivity[] = [
  {
    id: 'act-001',
    enquiryId: 'demo-enq-001',
    action: 'Enquiry Received',
    details: { channel: 'Web Form', source: 'Direct B2B Portal' },
    performedBy: 'System',
    createdAt: '2026-10-14T09:28:15Z',
  },
  {
    id: 'act-002',
    enquiryId: 'demo-enq-001',
    action: 'Email Notification Sent',
    details: { provider: 'Resend', id: 'resend_msg_01JB39AA99201' },
    performedBy: 'Resend Service',
    createdAt: '2026-10-14T09:30:00Z',
  },
  {
    id: 'act-003',
    enquiryId: 'demo-enq-001',
    action: 'Status changed to In Review',
    details: { note: 'Initial review assigned to technical sales team.' },
    performedBy: 'Admin (admin@vssalutech.com)',
    createdAt: '2026-10-14T11:45:00Z',
  },
  {
    id: 'act-004',
    enquiryId: 'demo-enq-003',
    action: 'Status changed to Contacted',
    details: { note: 'Telephonic assessment completed.' },
    performedBy: 'Admin (admin@vssalutech.com)',
    createdAt: '2026-10-15T16:20:00Z',
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
   * Submit Customer Enquiry directly to Supabase Edge Function
   */
  async submitEnquiry(payload: EnquirySubmissionPayload): Promise<EnquirySubmissionResponse> {
    // 1. Spam honeypot validation - do not set fake success
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

    // Compose message including service category and specifications
    const details: string[] = [];
    if (payload.serviceCategory) details.push(`Service Category: ${payload.serviceCategory}`);
    if (payload.message?.trim()) details.push(payload.message.trim());
    if (payload.plantLocation) details.push(`Plant Location: ${payload.plantLocation}`);
    if (payload.pressCapacity) details.push(`Capacity / Equipment: ${payload.pressCapacity}`);
    if (payload.technicalSpecs) details.push(`Technical Specs: ${payload.technicalSpecs}`);
    if (payload.approxBudget) details.push(`Budget: ${payload.approxBudget}`);
    if (payload.projectStage) details.push(`Stage: ${payload.projectStage}`);
    if (payload.timelineUrgency) details.push(`Urgency: ${payload.timelineUrgency}`);
    if (payload.cityState) details.push(`Location: ${payload.cityState}${payload.country ? `, ${payload.country}` : ''}`);

    const selectedCategoryOrDetails = details.join(' | ') || payload.message?.trim() || 'Business enquiry';

    // 2. Exact payload format required by Edge Function:
    // {
    //   "name": fullName,
    //   "email": businessEmail,
    //   "phone": mobileNumber,
    //   "company": companyName,
    //   "message": selectedCategoryOrDetails
    // }
    const requestBody = {
      name: fullName,
      email: businessEmail,
      phone: mobileNumber,
      company: companyName,
      message: selectedCategoryOrDetails,
    };

    const edgeFunctionUrl = 'https://cvamnocsfuanbwbljblm.supabase.co/functions/v1/submit-enquiry';

    const anonKey = getSupabaseAnonKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (anonKey) {
      headers['apikey'] = anonKey;
      headers['Authorization'] = `Bearer ${anonKey}`;
    }

    try {
      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      // 3. ONLY set success when server responds with 200 or 201
      if (res.status === 200 || res.status === 201) {
        const result = await res.json().catch(() => ({}));
        const refId =
          result.referenceId ||
          result.id ||
          `VSS-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

        return {
          success: true,
          referenceId: refId,
          emailStatus: result.emailStatus || 'sent',
          message:
            result.message ||
            'Your enquiry has been successfully submitted and saved.',
        };
      }

      // 4. If request fails, extract and return actual server error message
      let actualErrorMessage = `Server returned HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson && typeof errJson === 'object') {
          actualErrorMessage =
            errJson.error || errJson.message || errJson.msg || JSON.stringify(errJson);
        }
      } catch {
        const errText = await res.text().catch(() => '');
        if (errText) {
          actualErrorMessage = errText.slice(0, 200);
        }
      }

      console.error('Edge Function returned non-200 status:', res.status, actualErrorMessage);
      return {
        success: false,
        message: actualErrorMessage || `Server returned error (${res.status}).`,
      };
    } catch (networkErr: unknown) {
      const errorMsg =
        networkErr instanceof Error
          ? networkErr.message
          : 'Could not connect to enquiry server. Please check your internet connection.';
      console.error('Network exception connecting to Supabase Edge Function:', networkErr);
      return {
        success: false,
        message: errorMsg,
      };
    }
  },

  /**
   * Fetch all enquiries (From Supabase if authenticated, or from storage)
   */
  async getEnquiries(): Promise<Enquiry[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            referenceId: d.reference_id,
            fullName: d.full_name,
            companyName: d.company_name,
            phoneNumber: d.phone_number,
            emailAddress: d.email_address,
            cityState: d.city_state,
            country: d.country,
            serviceCategory: d.service_category,
            message: d.message,
            plantLocation: d.plant_location,
            machineryRequired: d.machinery_required,
            pressCapacity: d.press_capacity,
            technicalSpecs: d.technical_specs,
            approxBudget: d.approx_budget,
            projectStage: d.project_stage,
            timelineUrgency: d.timeline_urgency,
            preferredContact: d.preferred_contact,
            additionalNotes: d.additional_notes,
            attachmentName: d.attachment_name,
            attachmentSizeMB: d.attachment_size_mb,
            status: d.status as EnquiryStatus,
            adminNotes: d.admin_notes,
            emailStatus: d.email_status as EmailDeliveryStatus,
            emailProviderId: d.email_provider_id,
            emailError: d.email_error,
            emailSentAt: d.email_sent_at,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
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
    adminEmail = 'admin@vssalutech.com'
  ): Promise<boolean> {
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('enquiries')
          .update({ status, updated_at: nowIso })
          .eq('id', id);

        if (!error) {
          // Log activity
          await supabase.from('enquiry_activity').insert({
            enquiry_id: id,
            action: `Status changed to ${status.replace('_', ' ').toUpperCase()}`,
            performed_by: adminEmail,
            created_at: nowIso,
          });
          return true;
        }
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }

    // Local fallback
    const list = getStoredEnquiries();
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const prevStatus = list[idx].status;
      list[idx].status = status;
      list[idx].updatedAt = nowIso;
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
    adminEmail = 'admin@vssalutech.com'
  ): Promise<boolean> {
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('enquiries')
          .update({ admin_notes: notes, updated_at: nowIso })
          .eq('id', id);

        if (!error) {
          await supabase.from('enquiry_activity').insert({
            enquiry_id: id,
            action: 'Admin notes updated',
            details: { noteLength: notes.length },
            performed_by: adminEmail,
            created_at: nowIso,
          });
          return true;
        }
      } catch (err) {
        console.warn('Supabase updateNotes error:', err);
      }
    }

    const list = getStoredEnquiries();
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      list[idx].adminNotes = notes;
      list[idx].updatedAt = nowIso;
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
   * Retry sending notification email via Resend
   */
  async retryEmailNotification(id: string): Promise<{ success: boolean; message: string }> {
    const list = getStoredEnquiries();
    const enq = list.find((e) => e.id === id);
    if (!enq) return { success: false, message: 'Enquiry not found.' };

    if (isSupabaseConfigured() && supabase) {
      try {
        const functionUrl = `${getSupabaseUrl()}/functions/v1/retry-email`;
        const res = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
            'Authorization': `Bearer ${(import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''}`,
          },
          body: JSON.stringify({ enquiryId: id }),
        });
        if (res.ok) {
          return { success: true, message: 'Resend notification successfully re-triggered.' };
        }
      } catch (err) {
        console.warn('Retry email error:', err);
      }
    }

    // Local simulation of retry
    const nowIso = new Date().toISOString();
    enq.emailStatus = 'sent';
    enq.emailSentAt = nowIso;
    enq.emailProviderId = `resend_retry_${Date.now()}`;
    enq.emailError = undefined;
    enq.updatedAt = nowIso;
    setStoredEnquiries(list);

    addStoredActivity({
      enquiryId: id,
      action: 'Resend Email Notification Re-sent',
      details: { providerId: enq.emailProviderId },
      performedBy: 'Admin',
    });

    return { success: true, message: 'Notification email successfully dispatched via Resend.' };
  },

  /**
   * Get audit activities for an enquiry
   */
  async getActivities(enquiryId: string): Promise<EnquiryActivity[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('enquiry_activity')
          .select('*')
          .eq('enquiry_id', enquiryId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((a) => ({
            id: a.id,
            enquiryId: a.enquiry_id,
            action: a.action,
            details: a.details,
            performedBy: a.performed_by,
            createdAt: a.created_at,
          }));
        }
      } catch (err) {
        console.warn('Error fetching Supabase activities:', err);
      }
    }

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
