import React, { useState, useEffect } from 'react';
import { enquiryService } from '../../services/enquiryService';

interface AdminLoginProps {
  onSuccess: (adminEmail: string) => void;
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onClose }) => {
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // First-time setup form state
  const [setupFullName, setSetupFullName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { needsSetup } = await enquiryService.getAdminSetupStatus();
        setIsSetupMode(needsSetup);
      } catch (e) {
        console.warn('Could not check setup status:', e);
      } finally {
        setCheckingSetup(false);
      }
    };
    checkStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await enquiryService.adminLogin(email.trim(), password);
      if (res.success && res.token) {
        onSuccess(email.trim());
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!setupFullName.trim()) {
      setErrorMsg('Please provide your full administrative name.');
      return;
    }
    if (!setupEmail.trim() || !setupEmail.includes('@')) {
      setErrorMsg('Please enter a valid administrative email.');
      return;
    }
    if (setupPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long for security.');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await enquiryService.adminSetup(
        setupEmail.trim(),
        setupPassword,
        setupFullName.trim()
      );
      if (res.success && res.token) {
        onSuccess(setupEmail.trim());
      } else {
        setErrorMsg(res.error || 'Setup could not be completed.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Setup failed due to network error.');
    } finally {
      setIsLoading(false);
    }
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
          <h3 id="adminLoginTitle">
            {isSetupMode ? 'Initial Admin Setup' : 'VSS Alutech Portal'}
          </h3>
          <p className="admin-login-subtitle">
            {isSetupMode
              ? 'Configure your initial administrator account'
              : 'Restricted Executive & Engineering Administration'}
          </p>
        </div>

        {checkingSetup ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            Verifying security environment...
          </div>
        ) : isSetupMode ? (
          /* First-time setup form (no hardcoded password required) */
          <form onSubmit={handleSetup} className="admin-login-form">
            <div className="admin-mode-banner" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
              <div className="banner-title">🔒 First-Time Security Onboarding</div>
              <p>
                No administrator exists yet. Create your secure master administrative credentials below.
              </p>
            </div>

            {errorMsg && <div className="admin-login-error">{errorMsg}</div>}

            <div className="form-group">
              <label htmlFor="setupFullName">Administrator Full Name *</label>
              <input
                type="text"
                id="setupFullName"
                value={setupFullName}
                onChange={(e) => setSetupFullName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="setupEmail">Executive Email Address *</label>
              <input
                type="email"
                id="setupEmail"
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
                placeholder="e.g. vssalutechsolutions@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="setupPassword">Master Password (min 8 characters) *</label>
              <input
                type="password"
                id="setupPassword"
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="setupConfirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="setupConfirmPassword"
                value={setupConfirmPassword}
                onChange={(e) => setSetupConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block admin-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Complete Master Admin Setup &rarr;'}
            </button>
          </form>
        ) : (
          /* Standard Login form */
          <form onSubmit={handleLogin} className="admin-login-form">
            {errorMsg && <div className="admin-login-error">{errorMsg}</div>}

            <div className="form-group">
              <label htmlFor="adminEmail">Executive Email Address</label>
              <input
                type="email"
                id="adminEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vssalutechsolutions@gmail.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">Security Password</label>
              <input
                type="password"
                id="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block admin-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Portal &rarr;'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
