import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Enquiry, EnquiryStatus } from '../../types';
import { enquiryService } from '../../services/enquiryService';
import { EnquiryDetailModal } from './EnquiryDetailModal';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
  onClose: () => void;
  onNotify: (title: string, message: string, isSuccess?: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  onLogout,
  onClose,
  onNotify,
}) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Manual-only Clear All Confirmation Modal State (never uses window.confirm)
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearingAll, setIsClearingAll] = useState(false);

  const restoreInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await enquiryService.getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      onNotify('Data Fetch Error', 'Unable to load enquiries.', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesRef = enq.referenceId.toLowerCase().includes(q);
        const matchesCompany = enq.companyName.toLowerCase().includes(q);
        const matchesName = enq.fullName.toLowerCase().includes(q);
        const matchesEmail = enq.emailAddress.toLowerCase().includes(q);
        const matchesPhone = enq.phoneNumber.toLowerCase().includes(q);
        const matchesCity = enq.cityState.toLowerCase().includes(q);
        if (
          !matchesRef &&
          !matchesCompany &&
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesCity
        ) {
          return false;
        }
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'new') {
          if (enq.status !== 'new' && enq.status !== 'pending') return false;
        } else if (enq.status !== statusFilter) {
          return false;
        }
      }

      if (serviceFilter !== 'all') {
        const cat = enq.serviceCategory.toLowerCase();
        if (serviceFilter === 'maintenance') {
          if (!cat.includes('maintenance') && !cat.includes('trouble')) {
            return false;
          }
        } else if (!cat.includes(serviceFilter.toLowerCase())) {
          return false;
        }
      }

      if (urgencyFilter !== 'all') {
        if (
          !enq.timelineUrgency ||
          !enq.timelineUrgency.toLowerCase().includes(urgencyFilter.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [enquiries, searchQuery, statusFilter, serviceFilter, urgencyFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter((e) => e.status === 'new' || e.status === 'pending').length;
    const active = enquiries.filter((e) =>
      ['in_review', 'contacted', 'proposal_sent', 'quoted'].includes(e.status)
    ).length;
    const wonCount = enquiries.filter((e) => e.status === 'won' || e.status === 'resolved').length;
    const emailSentCount = enquiries.filter((e) => e.emailStatus === 'sent').length;
    const emailRate = total > 0 ? Math.round((emailSentCount / total) * 100) : 100;

    return { total, newCount, active, wonCount, emailRate };
  }, [enquiries]);

  const handleExportCSV = () => {
    enquiryService.exportToCSV(filteredEnquiries);
    onNotify('Export Successful', `Exported ${filteredEnquiries.length} enquiries to CSV.`, true);
  };

  const handleBackupJSON = () => {
    enquiryService.exportArchiveJSON(enquiries);
    onNotify(
      'Backup Downloaded',
      `Full archive backup (${enquiries.length} request${enquiries.length === 1 ? '' : 's'}) saved as JSON.`,
      true
    );
  };

  const handleRestoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = await enquiryService.importArchiveJSON(text);
      await loadData();
      onNotify(
        'Backup Restored',
        `Merged ${result.imported} record(s). Total saved requests: ${result.total}.`,
        true
      );
    } catch {
      onNotify('Restore Failed', 'Selected file is not a valid VSS Alutech JSON backup.', false);
    } finally {
      e.target.value = '';
    }
  };

  const openClearAllModal = () => {
    setClearConfirmText('');
    setClearModalOpen(true);
  };

  const executeManualClearAll = async () => {
    if (clearConfirmText.trim().toUpperCase() !== 'CLEAR ALL') return;
    setIsClearingAll(true);
    try {
      const res = await enquiryService.clearAllSubmissions();
      if (res.success) {
        setEnquiries([]);
        setSelectedEnquiry(null);
        setClearModalOpen(false);
        setClearConfirmText('');
        onNotify(
          'Portal Manually Cleared',
          'All stored requests have been manually cleared by administrator action.',
          true
        );
      } else {
        onNotify('Clear Failed', res.error || 'Could not clear requests.', false);
      }
    } catch (err: unknown) {
      onNotify('Error', err instanceof Error ? err.message : 'Error clearing requests.', false);
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleEnquiryUpdated = (updated: Enquiry) => {
    setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEnquiry(updated);
  };

  const handleEnquiryDeleted = (deletedId: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== deletedId));
    setSelectedEnquiry(null);
  };

  const getStatusBadgeClass = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'badge-status-new';
      case 'in_review':
        return 'badge-status-review';
      case 'contacted':
        return 'badge-status-contacted';
      case 'proposal_sent':
      case 'quoted':
        return 'badge-status-proposal';
      case 'won':
      case 'resolved':
        return 'badge-status-won';
      case 'lost':
        return 'badge-status-lost';
      case 'archived':
        return 'badge-status-archived';
      default:
        return 'badge-status-default';
    }
  };

  return (
    <div className="admin-dashboard-root">
      {/* Top Admin Navbar */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand">
            <div className="admin-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <h2 className="admin-title">VSS ALUTECH SOLUTIONS</h2>
              <span className="admin-sub">
                Permanent B2B Request Archive &bull; Retained Until Manual Clear
              </span>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="connection-badge live">
              <span className="pulse-dot"></span>
              Long-Term Vault Active
            </div>

            <div className="admin-user-info">
              <span className="user-email">{adminEmail}</span>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={handleBackupJSON}
              title="Download full lossless JSON backup of all saved requests"
            >
              💾 Backup JSON
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => restoreInputRef.current?.click()}
              title="Restore or merge requests from a saved JSON backup"
            >
              📂 Restore Backup
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleRestoreFileChange}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={handleExportCSV}
              title="Download filtered records as CSV"
            >
              📥 Export CSV
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={openClearAllModal}
              title="Manually clear all requests (requires explicit confirmation)"
              style={{
                borderColor: '#ef4444',
                color: '#f87171',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🗑 Clear All Requests
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={onLogout}
              title="Sign out of Admin Session"
            >
              Sign Out
            </button>

            <button
              type="button"
              className="btn btn-sm btn-close-admin"
              onClick={onClose}
              title="Return to Public Website"
            >
              Back to Website ✕
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main container">
        {/* Metric Cards Row */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon total-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.total}</div>
              <div className="metric-label">Total Saved Requests</div>
            </div>
          </div>

          <div className="metric-card alert-card">
            <div className="metric-icon alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.newCount}</div>
              <div className="metric-label">Action Required (New)</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon active-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.active}</div>
              <div className="metric-label">Active In Pipeline</div>
            </div>
          </div>

          <div className="metric-card success-card">
            <div className="metric-icon success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.wonCount}</div>
              <div className="metric-label">Closed / Won Orders</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon resend-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.emailRate}%</div>
              <div className="metric-label">Resend Notification Rate</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="admin-controls-card">
          <div className="admin-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-svg">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by Reference ID, Company Name, Contact, Email, or City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                &times;
              </button>
            )}
          </div>

          <div className="admin-filters-row">
            <div className="filter-item">
              <label htmlFor="filterStatus">Status:</label>
              <select
                id="filterStatus"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses ({enquiries.length})</option>
                <option value="new">
                  New / Pending (
                  {enquiries.filter((e) => e.status === 'new' || e.status === 'pending').length})
                </option>
                <option value="in_review">In Review</option>
                <option value="contacted">Contacted</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="quoted">Quoted</option>
                <option value="won">Won / Closed Deals</option>
                <option value="resolved">Resolved</option>
                <option value="lost">Lost</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="filterService">Service:</label>
              <select
                id="filterService"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="all">All Service Categories</option>
                <option value="press">Press Solutions</option>
                <option value="furnace">Furnace Solutions</option>
                <option value="maintenance">Plant Maintenance</option>
                <option value="tool">Tool Room &amp; Dies</option>
                <option value="manpower">Manpower Supplier</option>
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="filterUrgency">Urgency:</label>
              <select
                id="filterUrgency"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="all">All Urgency Levels</option>
                <option value="immediate">Immediate (1-2 weeks)</option>
                <option value="1 month">1 Month</option>
                <option value="1 to 3">1 to 3 Months</option>
                <option value="3 to 6">3 to 6 Months</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-secondary btn-refresh"
              onClick={loadData}
              title="Refresh Enquiries from database"
            >
              ↻ Refresh ({filteredEnquiries.length}/{enquiries.length})
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="table-loading-state">
              <span className="spinner-circle"></span>
              <p>Fetching Aluminium Extrusion Enquiries...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="table-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h4>No Enquiries Found</h4>
              <p>
                {enquiries.length === 0
                  ? 'All submitted client requests are stored here permanently until you clear them manually.'
                  : 'Try adjusting your search query or status filter.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Company &amp; Contact</th>
                    <th>Service Category</th>
                    <th>Tonnage / Machinery</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Email Notice</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enq) => (
                    <tr
                      key={enq.referenceId || enq.id}
                      className="table-row-clickable"
                      onClick={() => setSelectedEnquiry(enq)}
                    >
                      <td>
                        <span className="ref-cell">{enq.referenceId}</span>
                      </td>
                      <td>
                        <div className="company-cell-name">{enq.companyName}</div>
                        <div className="contact-cell-sub">
                          {enq.fullName} &bull; {enq.cityState}
                        </div>
                      </td>
                      <td>
                        <span className="service-cell">{enq.serviceCategory}</span>
                      </td>
                      <td>
                        <div className="machinery-cell">
                          {enq.pressCapacity || enq.machineryRequired || '—'}
                        </div>
                      </td>
                      <td>
                        <span className="urgency-pill">
                          {enq.timelineUrgency || 'Standard'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(enq.status)}`}>
                          {enq.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`pill-email pill-${enq.emailStatus}`}>
                          {enq.emailStatus === 'sent' && '✓ Sent'}
                          {enq.emailStatus === 'pending' && '⏳ Pending'}
                          {enq.emailStatus === 'failed' && '⚠ Failed'}
                          {enq.emailStatus === 'skipped' && 'Skipped'}
                        </span>
                      </td>
                      <td>
                        <div className="date-cell">
                          {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-xs btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEnquiry(enq);
                          }}
                        >
                          View Details &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Enquiry Detail Drawer / Modal */}
      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onStatusUpdated={handleEnquiryUpdated}
          onNotesUpdated={handleEnquiryUpdated}
          onDeleted={handleEnquiryDeleted}
          onNotify={onNotify}
          currentAdminEmail={adminEmail}
        />
      )}

      {/* Explicit Manual Clear-All Confirmation Modal (Replaces window.confirm) */}
      {clearModalOpen && (
        <div className="enquiry-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="clearModalTitle">
          <div className="enquiry-modal-card" style={{ maxWidth: '520px' }}>
            <div className="enquiry-modal-header" style={{ background: '#7f1d1d', borderBottomColor: '#ef4444' }}>
              <div className="modal-title-group">
                <h3 id="clearModalTitle" style={{ margin: 0 }}>
                  Manual Clear All Requests
                </h3>
                <span className="meta-timestamp" style={{ color: '#fecaca' }}>
                  Permanent Retention Protection
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setClearModalOpen(false)}
                aria-label="Close clear confirmation"
              >
                &times;
              </button>
            </div>

            <div className="enquiry-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#1e293b', margin: 0 }}>
                All <strong>{enquiries.length}</strong> saved request(s) are stored permanently and are{' '}
                <strong>never cleared automatically</strong>. Only continue if you intentionally want to wipe
                every request from the Admin Portal.
              </p>

              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '12px', color: '#9a3412', fontWeight: 600 }}>
                  Recommended: save a backup copy before clearing.
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleBackupJSON}
                >
                  💾 Download JSON Backup
                </button>
              </div>

              <div>
                <label
                  htmlFor="confirmClearInput"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}
                >
                  Type <code>CLEAR ALL</code> below to confirm permanent manual deletion:
                </label>
                <input
                  id="confirmClearInput"
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="CLEAR ALL"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setClearModalOpen(false)}
                  disabled={isClearingAll}
                >
                  Cancel — Keep All Requests
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={clearConfirmText.trim().toUpperCase() !== 'CLEAR ALL' || isClearingAll}
                  onClick={executeManualClearAll}
                  style={{
                    background:
                      clearConfirmText.trim().toUpperCase() === 'CLEAR ALL' ? '#dc2626' : '#fca5a5',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor:
                      clearConfirmText.trim().toUpperCase() === 'CLEAR ALL' ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isClearingAll ? 'Clearing...' : 'Permanently Clear All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
