import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.SQLITE_DB_PATH
  ? path.resolve(process.cwd(), process.env.SQLITE_DB_PATH)
  : path.join(DATA_DIR, 'vss_alutech.sqlite');

// Initialize SQLite database instance
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys for high performance and integrity
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  // Pragma may be unsupported in some environments
}

/**
 * Initialize all database tables and seed required initial data
 */
export function initDatabase(): void {
  // 1. Submissions Table (Covers general contact, manpower requests, and machinery quote requests)
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_id TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('contact', 'manpower', 'quote')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT,
      service_category TEXT,
      plant_location TEXT,
      message TEXT,
      details_json TEXT,
      file_name TEXT,
      file_path TEXT,
      file_size INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_review', 'quoted', 'resolved', 'archived')),
      admin_notes TEXT,
      admin_email_sent INTEGER DEFAULT 0,
      client_email_sent INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_tracking_id ON submissions(tracking_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
  `);

  // 2. Admin Users Table (For protected admin dashboard portal)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'superadmin', 'viewer')),
      created_at TEXT NOT NULL,
      last_login TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
  `);

  // 3. System Activity Log Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      performed_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
    );
  `);

  console.log(`[DB] SQLite database initialized successfully at: ${DB_PATH}`);
}
