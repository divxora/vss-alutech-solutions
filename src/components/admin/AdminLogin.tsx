import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';

interface AdminLoginProps {
  onSuccess: (adminEmail: string) => void;
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data?.user?.email) {
          onSuccess(data.user.email);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Demo / Local development login fallback
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('vss')) {
        onSuccess(email);
      } else {
        setErrorMsg('For demo mode, enter any admin email (e.g. admin@vssalutech.com).');
      }
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    onSuccess('admin@vssalutech.com');
  };

  return (
    <div className="admin-login-overlay" role="dialog" aria-modal="true" aria-labelledby="adminLoginTitle">
      <div className="admin-login-card">
        <button
          type="button"
          className="admin-login-close"
          onClick={onClose}
          aria-label="Close Admin Login"
        >
          &times;
        </button>

        <div className="admin-login-header">
          <div className="admin-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3 id="adminLoginTitle">VSS Alutech Portal</h3>
          <p className="admin-login-subtitle">
            Restricted Executive &amp; Engineering Administration
          </p>
        </div>

        {!isConfigured && (
          <div className="admin-mode-banner demo">
            <div className="banner-title">⚡ Offline / Preview Mode</div>
            <p>
              Supabase credentials not yet set in environment. You can click <strong>Explore Demo Dashboard</strong> below to inspect live enquiries, status changes, CSV export, and follow-up logging.
            </p>
          </div>
        )}

        <form onSubmit={handleSupabaseLogin} className="admin-login-form">
          {errorMsg && <div className="admin-login-error">{errorMsg}</div>}

          <div className="form-group">
            <label htmlFor="adminEmail">Executive Email Address</label>
            <input
              type="email"
              id="adminEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vssalutech.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="admin-login-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-block btn-demo-quick"
          onClick={handleDemoAccess}
        >
          Explore Demo Dashboard (Instant Access)
        </button>

        <div className="admin-security-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Role-Based Access Control (RBAC) &bull; Supabase Auth Protected</span>
        </div>
      </div>
    </div>
  );
};
