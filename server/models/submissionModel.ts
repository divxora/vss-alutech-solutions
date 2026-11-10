import { db } from '../config/db';

export interface SubmissionRecord {
  id: number;
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
  file_path: string | null;
  file_size: number | null;
  status: 'pending' | 'in_review' | 'quoted' | 'resolved' | 'archived';
  admin_notes: string | null;
  admin_email_sent: number;
  client_email_sent: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubmissionInput {
  type: 'contact' | 'manpower' | 'quote';
  name: string;
  email: string;
  phone: string;
  company?: string;
  serviceCategory?: string;
  plantLocation?: string;
  message?: string;
  details?: Record<string, any>;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
}

/**
 * Generate unique, enterprise tracking reference ID:
 * Format: VSS-[TYPE]-YEAR-[RANDOM 6 CHARS]
 */
export function generateTrackingId(type: 'contact' | 'manpower' | 'quote'): string {
  const prefixMap: Record<string, string> = {
    contact: 'CNT',
    manpower: 'MPR',
    quote: 'QTE',
  };
  const typeCode = prefixMap[type] || 'GEN';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VSS-${typeCode}-${year}-${random}`;
}

export const submissionModel = {
  /**
   * Create a new submission record
   */
  create(input: CreateSubmissionInput): SubmissionRecord {
    const trackingId = generateTrackingId(input.type);
    const now = new Date().toISOString();
    const detailsJson = input.details ? JSON.stringify(input.details) : null;

    const insertStmt = db.prepare(`
      INSERT INTO submissions (
        tracking_id, type, name, email, phone, company,
        service_category, plant_location, message, details_json,
        file_name, file_path, file_size, status,
        admin_email_sent, client_email_sent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0, ?, ?)
    `);

    const result = insertStmt.run(
      trackingId,
      input.type,
      input.name.trim(),
      input.email.trim().toLowerCase(),
      input.phone.trim(),
      input.company?.trim() || null,
      input.serviceCategory?.trim() || null,
      input.plantLocation?.trim() || null,
      input.message?.trim() || null,
      detailsJson,
      input.fileName || null,
      input.filePath || null,
      input.fileSize || null,
      now,
      now
    );

    const selectStmt = db.prepare('SELECT * FROM submissions WHERE id = ?');
    const created = selectStmt.get(result.lastInsertRowid) as unknown as SubmissionRecord;

    // Log audit activity
    try {
      const logStmt = db.prepare(`
        INSERT INTO audit_logs (submission_id, action, details, performed_by, created_at)
        VALUES (?, 'CREATED', ?, ?, ?)
      `);
      logStmt.run(created.id, `New ${input.type} submission created via API`, input.email, now);
    } catch (e) {
      // Ignore non-fatal log errors
    }

    return created;
  },

  /**
   * Update email dispatch status for tracking
   */
  updateEmailStatus(id: number, adminSent: boolean, clientSent: boolean): void {
    const stmt = db.prepare(`
      UPDATE submissions
      SET admin_email_sent = ?, client_email_sent = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(adminSent ? 1 : 0, clientSent ? 1 : 0, new Date().toISOString(), id);
  },

  /**
   * Find by ID
   */
  findById(id: number): SubmissionRecord | null {
    const stmt = db.prepare('SELECT * FROM submissions WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as SubmissionRecord) || null;
  },

  /**
   * Find by Tracking ID
   */
  findByTrackingId(trackingId: string): SubmissionRecord | null {
    const stmt = db.prepare('SELECT * FROM submissions WHERE tracking_id = ?');
    const row = stmt.get(trackingId.trim().toUpperCase());
    return (row as unknown as SubmissionRecord) || null;
  },

  /**
   * Get all submissions with filtering, search & pagination
   */
  findAll(options: {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (options.type && options.type !== 'all') {
      whereClauses.push('type = ?');
      params.push(options.type);
    }

    if (options.status && options.status !== 'all') {
      whereClauses.push('status = ?');
      params.push(options.status);
    }

    if (options.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      whereClauses.push('(tracking_id LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR message LIKE ?)');
      params.push(term, term, term, term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total matching records
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM submissions ${whereSql}`);
    const countRow = countStmt.get(...params) as { total: number };
    const total = countRow ? countRow.total : 0;

    // Paginated records
    const listStmt = db.prepare(`
      SELECT * FROM submissions
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `);
    const records = listStmt.all(...params, limit, offset) as unknown as SubmissionRecord[];

    // Parse details_json for each row
    const enriched = records.map((r) => ({
      ...r,
      details: r.details_json ? JSON.parse(r.details_json) : null,
    }));

    return {
      submissions: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Update status and admin notes
   */
  updateStatus(
    id: number,
    status: 'pending' | 'in_review' | 'quoted' | 'resolved' | 'archived',
    adminNotes?: string,
    performedBy = 'admin'
  ): SubmissionRecord | null {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE submissions
      SET status = ?, admin_notes = COALESCE(?, admin_notes), updated_at = ?
      WHERE id = ?
    `);
    stmt.run(status, adminNotes || null, now, id);

    // Add audit log
    try {
      const logStmt = db.prepare(`
        INSERT INTO audit_logs (submission_id, action, details, performed_by, created_at)
        VALUES (?, 'STATUS_UPDATE', ?, ?, ?)
      `);
      logStmt.run(id, `Status updated to ${status}${adminNotes ? `: "${adminNotes}"` : ''}`, performedBy, now);
    } catch (e) {
      // ignore
    }

    return this.findById(id);
  },

  /**
   * Delete or archive a submission
   */
  delete(id: number, performedBy = 'admin'): SubmissionRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = db.prepare('DELETE FROM submissions WHERE id = ?');
    stmt.run(id);

    try {
      const logStmt = db.prepare(`
        INSERT INTO audit_logs (submission_id, action, details, performed_by, created_at)
        VALUES (NULL, 'DELETED', ?, ?, ?)
      `);
      logStmt.run(`Deleted submission #${id} (${existing.tracking_id})`, performedBy, new Date().toISOString());
    } catch (e) {
      // ignore
    }

    return existing;
  },

  /**
   * Clear all submissions (used by administrator to purge test/dummy data)
   */
  clearAll(performedBy = 'admin'): number {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM submissions');
    const total = (totalStmt.get() as { count: number })?.count || 0;
    try {
      db.exec('DELETE FROM audit_logs;');
      db.exec('DELETE FROM submissions;');
      console.log(`[SubmissionModel] Cleared all ${total} submissions by ${performedBy}`);
    } catch (e: any) {
      console.warn('[SubmissionModel] Error clearing submissions:', e.message);
    }
    return total;
  },

  /**
   * Summary counts for dashboard metrics
   */
  getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM submissions');
    const total = (totalStmt.get() as { count: number }).count;

    const typeStmt = db.prepare('SELECT type, COUNT(*) as count FROM submissions GROUP BY type');
    const byType = (typeStmt.all() as { type: string; count: number }[]).reduce(
      (acc, curr) => ({ ...acc, [curr.type]: curr.count }),
      { contact: 0, manpower: 0, quote: 0 }
    );

    const statusStmt = db.prepare('SELECT status, COUNT(*) as count FROM submissions GROUP BY status');
    const byStatus = (statusStmt.all() as { status: string; count: number }[]).reduce(
      (acc, curr) => ({ ...acc, [curr.status]: curr.count }),
      { pending: 0, in_review: 0, quoted: 0, resolved: 0, archived: 0 }
    );

    return { total, byType, byStatus };
  },
};
