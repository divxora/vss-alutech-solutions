import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey || serviceKey.includes('your-supabase')) {
    return null;
  }

  try {
    supabaseAdmin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return supabaseAdmin;
  } catch (err) {
    console.warn('[SupabaseSync] Failed to initialize client:', err);
    return null;
  }
}

export interface SubmissionSyncRow {
  tracking_id: string;
  type: 'contact' | 'manpower' | 'quote';
  name: string;
  email: string;
  phone: string;
  company: string | null;
  service_category: string | null;
  plant_location: string | null;
  message: string | null;
  details_json: string | null;
  file_name: string | null;
  file_size: number | null;
  status: string;
  admin_notes: string | null;
  admin_email_sent: number;
  created_at: string;
  updated_at: string;
}

function mapStatusToSupabase(status: string): string {
  if (status === 'pending') return 'new';
  if (status === 'quoted') return 'proposal_sent';
  if (status === 'resolved') return 'won';
  if (['new', 'in_review', 'contacted', 'proposal_sent', 'won', 'lost', 'archived'].includes(status)) {
    return status;
  }
  return 'new';
}

export const supabaseSync = {
  isEnabled(): boolean {
    return Boolean(getSupabaseAdmin());
  },

  async upsertSubmission(record: SubmissionSyncRow): Promise<void> {
    const client = getSupabaseAdmin();
    if (!client) return;

    try {
      let parsedDetails: Record<string, any> = {};
      if (record.details_json) {
        try {
          parsedDetails = JSON.parse(record.details_json);
        } catch {
          parsedDetails = {};
        }
      }

      const payload = {
        reference_id: record.tracking_id,
        name: record.name,
        full_name: record.name,
        email: record.email,
        email_address: record.email,
        phone: record.phone,
        phone_number: record.phone,
        company: record.company || 'Enterprise Client',
        company_name: record.company || 'Enterprise Client',
        service_category: record.service_category || 'Industrial Enquiry',
        city_state: record.plant_location || 'India',
        country: 'India',
        plant_location: record.plant_location || null,
        machinery_required:
          parsedDetails['Machinery / Tooling Scope'] || parsedDetails['Designation / Role'] || null,
        press_capacity:
          parsedDetails['Press / Equipment Capacity'] || parsedDetails['Press Tonnage Capacity'] || null,
        technical_specs: record.details_json || null,
        approx_budget: parsedDetails['Estimated Investment Budget'] || null,
        project_stage: parsedDetails['Project Lifecycle Stage'] || null,
        timeline_urgency:
          parsedDetails['Deployment Urgency'] ||
          parsedDetails['Required Delivery Window'] ||
          parsedDetails['Requirement Urgency'] ||
          null,
        preferred_contact: parsedDetails['Preferred Contact Method'] || 'WhatsApp',
        message: record.message || '-',
        attachment_name: record.file_name || null,
        attachment_size_mb: record.file_size ? (record.file_size / (1024 * 1024)).toFixed(2) : null,
        status: mapStatusToSupabase(record.status),
        admin_notes: record.admin_notes || null,
        email_status: record.admin_email_sent ? 'sent' : 'pending',
        created_at: record.created_at,
        updated_at: record.updated_at,
      };

      const { error } = await client
        .from('enquiries')
        .upsert(payload, { onConflict: 'reference_id' });

      if (error) {
        console.warn('[SupabaseSync] Upsert error:', error.message);
      }
    } catch (err: any) {
      console.warn('[SupabaseSync] Upsert exception:', err?.message || err);
    }
  },

  async updateSubmission(
    trackingId: string,
    fields: { status?: string; adminNotes?: string; adminEmailSent?: boolean }
  ): Promise<void> {
    const client = getSupabaseAdmin();
    if (!client) return;

    try {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (fields.status) {
        updatePayload.status = mapStatusToSupabase(fields.status);
      }
      if (fields.adminNotes !== undefined) {
        updatePayload.admin_notes = fields.adminNotes;
      }
      if (fields.adminEmailSent !== undefined) {
        updatePayload.email_status = fields.adminEmailSent ? 'sent' : 'pending';
      }

      const { error } = await client
        .from('enquiries')
        .update(updatePayload)
        .eq('reference_id', trackingId);

      if (error) {
        console.warn('[SupabaseSync] Update error:', error.message);
      }
    } catch (err: any) {
      console.warn('[SupabaseSync] Update exception:', err?.message || err);
    }
  },

  async deleteByTrackingId(trackingId: string): Promise<void> {
    const client = getSupabaseAdmin();
    if (!client) return;

    try {
      const { error } = await client
        .from('enquiries')
        .delete()
        .eq('reference_id', trackingId);

      if (error) {
        console.warn('[SupabaseSync] Delete error:', error.message);
      }
    } catch (err: any) {
      console.warn('[SupabaseSync] Delete exception:', err?.message || err);
    }
  },

  async clearAll(): Promise<void> {
    const client = getSupabaseAdmin();
    if (!client) return;

    try {
      const { error } = await client
        .from('enquiries')
        .delete()
        .neq('reference_id', '__never_match__');

      if (error) {
        console.warn('[SupabaseSync] Clear-all error:', error.message);
      }
    } catch (err: any) {
      console.warn('[SupabaseSync] Clear-all exception:', err?.message || err);
    }
  },

  async fetchAllFromCloud(): Promise<SubmissionSyncRow[]> {
    const client = getSupabaseAdmin();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !Array.isArray(data)) {
        return [];
      }

      return data.map((row: any) => {
        const refId = String(row.reference_id || '');
        const inferredType: 'contact' | 'manpower' | 'quote' = refId.includes('-MPR-')
          ? 'manpower'
          : refId.includes('-QTE-')
            ? 'quote'
            : 'contact';

        return {
          tracking_id: refId,
          type: inferredType,
          name: String(row.full_name || row.name || ''),
          email: String(row.email_address || row.email || ''),
          phone: String(row.phone_number || row.phone || ''),
          company: row.company_name || row.company || null,
          service_category: row.service_category || null,
          plant_location: row.plant_location || row.city_state || null,
          message: row.message || null,
          details_json: row.technical_specs || null,
          file_name: row.attachment_name || null,
          file_size: null,
          status: row.status || 'new',
          admin_notes: row.admin_notes || null,
          admin_email_sent: row.email_status === 'sent' ? 1 : 0,
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || row.created_at || new Date().toISOString(),
        };
      });
    } catch (err: any) {
      console.warn('[SupabaseSync] Fetch cloud records exception:', err?.message || err);
      return [];
    }
  },
};
