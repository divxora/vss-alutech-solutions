import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';

export interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'superadmin' | 'viewer';
  created_at: string;
  last_login: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'vss_alutech_enterprise_jwt_secret_2026_secured!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const userModel = {
  /**
   * Check if any administrator accounts exist
   */
  hasAdminUsers(): boolean {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM admin_users');
    const result = stmt.get() as { count: number };
    return Boolean(result && Number(result.count) > 0);
  },

  /**
   * Get total count of administrator accounts
   */
  getAdminCount(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM admin_users');
    const result = stmt.get() as { count: number };
    return result ? Number(result.count) : 0;
  },

  /**
   * Create an administrator account
   */
  createAdminUser(email: string, password: string, fullName: string, role: 'admin' | 'superadmin' | 'viewer' = 'superadmin'): AdminUser {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO admin_users (email, password_hash, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insertStmt.run(email.trim().toLowerCase(), hash, fullName.trim(), role, now);
    return this.findById(Number(result.lastInsertRowid))!;
  },

  /**
   * Seed initial administrator if table is empty and env credentials provided
   */
  seedDefaultAdmin(): void {
    if (!this.hasAdminUsers()) {
      const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'vssalutechsolutions@gmail.com';
      const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD;
      if (defaultPass) {
        this.createAdminUser(defaultEmail, defaultPass, 'VSS Plant Administrator', 'superadmin');
        console.log(`[Admin] Admin account seeded from environment variables: ${defaultEmail}`);
      } else {
        console.log('[Admin] No administrator accounts configured. First-time setup portal available at /api/admin/setup.');
      }
    }
  },

  /**
   * Find admin user by email
   */
  findByEmail(email: string): AdminUser | null {
    const stmt = db.prepare('SELECT * FROM admin_users WHERE email = ?');
    const row = stmt.get(email.trim().toLowerCase());
    return (row as unknown as AdminUser) || null;
  },

  /**
   * Find admin user by ID
   */
  findById(id: number): AdminUser | null {
    const stmt = db.prepare('SELECT id, email, full_name, role, created_at, last_login FROM admin_users WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as AdminUser) || null;
  },

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  },

  /**
   * Record login timestamp
   */
  updateLastLogin(id: number): void {
    const stmt = db.prepare('UPDATE admin_users SET last_login = ? WHERE id = ?');
    stmt.run(new Date().toISOString(), id);
  },

  /**
   * Generate JWT token for admin session
   */
  generateToken(user: { id: number; email: string; role: string; full_name: string }): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );
  },

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  },
};
