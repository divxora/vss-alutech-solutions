import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Resolve persistent data directory (prefer /app/data persistent disk mount when available)
const PERSISTENT_MOUNT_DIR = '/app/data';
const hasPersistentMount = (() => {
  try {
    return fs.existsSync(PERSISTENT_MOUNT_DIR) && fs.statSync(PERSISTENT_MOUNT_DIR).isDirectory();
  } catch {
    return false;
  }
})();

const DEFAULT_DATA_DIR = hasPersistentMount
  ? PERSISTENT_MOUNT_DIR
  : path.resolve(process.cwd(), 'data');

const DB_PATH = (() => {
  const configured = process.env.SQLITE_DB_PATH?.trim();
  if (configured) {
    if (path.isAbsolute(configured)) return configured;
    if (hasPersistentMount) return path.join(PERSISTENT_MOUNT_DIR, path.basename(configured));
    return path.resolve(process.cwd(), configured);
  }
  return path.join(DEFAULT_DATA_DIR, 'vss_alutech.sqlite');
})();

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database instance
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode, lock wait timeout & foreign keys for high durability and integrity
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = FULL;');
  db.exec('PRAGMA busy_timeout = 10000;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  // Pragma may be unsupported in some environments
}

const VALID_STATUS_CHECK =
  "('new', 'pending', 'in_review', 'contacted', 'proposal_sent', 'quoted', 'resolved', 'won', 'lost', 'archived')";

/**
 * Initialize all database tables without ever dropping or clearing existing records
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
      status TEXT DEFAULT 'new' CHECK(status IN ${VALID_STATUS_CHECK}),
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

  // Safe non-destructive migration if an older SQLite file has the legacy 5-status CHECK constraint
  try {
    const schemaRow = db
      .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'submissions'")
      .get() as { sql?: string } | undefined;

    if (schemaRow?.sql && !schemaRow.sql.includes("'won'")) {
      console.log('[DB] Upgrading submissions status constraint non-destructively...');
      db.exec('PRAGMA foreign_keys = OFF;');
      db.exec('BEGIN TRANSACTION;');
      db.exec(`
        CREATE TABLE submissions_upgraded (
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
          status TEXT DEFAULT 'new' CHECK(status IN ${VALID_STATUS_CHECK}),
          admin_notes TEXT,
          admin_email_sent INTEGER DEFAULT 0,
          client_email_sent INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        INSERT INTO submissions_upgraded SELECT * FROM submissions;
        DROP TABLE submissions;
        ALTER TABLE submissions_upgraded RENAME TO submissions;
        CREATE INDEX IF NOT EXISTS idx_submissions_tracking_id ON submissions(tracking_id);
        CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
        CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
        CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
      `);
      db.exec('COMMIT;');
      db.exec('PRAGMA foreign_keys = ON;');
      console.log('[DB] Submissions status constraint upgraded with all rows preserved.');
    }
  } catch (migrationErr: any) {
    try {
      db.exec('ROLLBACK;');
      db.exec('PRAGMA foreign_keys = ON;');
    } catch {
      // ignore rollback errors
    }
    console.warn('[DB] Non-fatal status migration notice:', migrationErr?.message || migrationErr);
  }

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
