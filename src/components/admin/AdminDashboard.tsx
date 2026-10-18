import React, { useState, useEffect, useMemo } from 'react';
import { Enquiry, EnquiryStatus } from '../../types';
import { enquiryService } from '../../services/enquiryService';
import { isSupabaseConfigured } from '../../utils/supabase';
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

  const isConfigured = isSupabaseConfigured();

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
      // Search
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

      // Status
      if (statusFilter !== 'all' && enq.status !== statusFilter) {
        return false;
      }

      // Service Category
      if (serviceFilter !== 'all' && !enq.serviceCategory.toLowerCase().includes(serviceFilter.toLowerCase())) {
        return false;
      }

      // Urgency
      if (urgencyFilter !== 'all') {
        if (!enq.timelineUrgency || !enq.timelineUrgency.toLowerCase().includes(urgencyFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [enquiries, searchQuery, statusFilter, serviceFilter, urgencyFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter((e) => e.status === 'new').length;
    const active = enquiries.filter((e) => ['in_review', 'contacted', 'proposal_sent'].includes(e.status)).length;
    const wonCount = enquiries.filter((e) => e.status === 'won').length;
    const emailSentCount = enquiries.filter((e) => e.emailStatus === 'sent').length;
    const emailRate = total > 0 ? Math.round((emailSentCount / total) * 100) : 100;

    return { total, newCount, active, wonCount, emailRate };
  }, [enquiries]);

  const handleExportCSV = () => {
    enquiryService.exportToCSV(filteredEnquiries);
    onNotify('Export Successful', `Exported ${filteredEnquiries.length} enquiries to CSV.`, true);
  };

  const handleEnquiryUpdated = (updated: Enquiry) => {
    setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEnquiry(updated);
  };

  const getStatusBadgeClass = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return 'badge-status-new';
      case 'in_review':
        return 'badge-status-review';
      case 'contacted':
        return 'badge-status-contacted';
      case 'proposal_sent':
        return 'badge-status-proposal';
      case 'won':
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
              <span className="admin-sub">Executive B2B Enquiry Management System</span>
            </div>
          </div>

          <div className="admin-header-right">
            <div className={`connection-badge ${isConfigured ? 'live' : 'sandbox'}`}>
              <span className="pulse-dot"></span>
              {isConfigured ? 'Supabase PostgreSQL Live' : 'Demo Sandbox Mode'}
            </div>

            <div className="admin-user-info">
              <span className="user-email">{adminEmail}</span>
            </div>

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
              <div className="metric-label">Total Enquiries</div>
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
                <option value="new">New ({enquiries.filter((e) => e.status === 'new').length})</option>
                <option value="in_review">In Review</option>
                <option value="contacted">Contacted</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="won">Won / Closed Deals</option>
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
                <option value="trouble">Plant Troubleshooting</option>
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
              ↻ Refresh
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
              <p>Try adjusting your search query or status filter.</p>
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
                      key={enq.id}
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
          onNotify={onNotify}
          currentAdminEmail={adminEmail}
        />
      )}
    </div>
  );
};
