import React, { useState, useEffect } from 'react';
import { Enquiry, EnquiryStatus, EnquiryActivity } from '../../types';
import { enquiryService } from '../../services/enquiryService';

interface EnquiryDetailModalProps {
  enquiry: Enquiry;
  onClose: () => void;
  onStatusUpdated: (updatedEnquiry: Enquiry) => void;
  onNotesUpdated: (updatedEnquiry: Enquiry) => void;
  onNotify: (title: string, message: string, isSuccess?: boolean) => void;
  currentAdminEmail: string;
}

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({
  enquiry,
  onClose,
  onStatusUpdated,
  onNotesUpdated,
  onNotify,
  currentAdminEmail,
}) => {
  const [currentStatus, setCurrentStatus] = useState<EnquiryStatus>(enquiry.status);
  const [notes, setNotes] = useState<string>(enquiry.adminNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isRetryingEmail, setIsRetryingEmail] = useState(false);
  const [activities, setActivities] = useState<EnquiryActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    setCurrentStatus(enquiry.status);
    setNotes(enquiry.adminNotes || '');

    const loadActivities = async () => {
      setLoadingActivities(true);
      const data = await enquiryService.getActivities(enquiry.id);
      setActivities(data);
      setLoadingActivities(false);
    };

    loadActivities();
  }, [enquiry]);

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    setCurrentStatus(newStatus);
    const success = await enquiryService.updateStatus(enquiry.id, newStatus, currentAdminEmail);
    if (success) {
      onNotify('Status Updated', `Enquiry marked as ${newStatus.replace('_', ' ').toUpperCase()}`, true);
      onStatusUpdated({ ...enquiry, status: newStatus });
      const updatedActs = await enquiryService.getActivities(enquiry.id);
      setActivities(updatedActs);
    } else {
      onNotify('Error', 'Failed to update status', false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    const success = await enquiryService.updateNotes(enquiry.id, notes, currentAdminEmail);
    setIsSavingNotes(false);
    if (success) {
      onNotify('Notes Saved', 'Internal follow-up notes updated.', true);
      onNotesUpdated({ ...enquiry, adminNotes: notes });
      const updatedActs = await enquiryService.getActivities(enquiry.id);
      setActivities(updatedActs);
    } else {
      onNotify('Error', 'Failed to save notes', false);
    }
  };

  const handleRetryEmail = async () => {
    setIsRetryingEmail(true);
    const res = await enquiryService.retryEmailNotification(enquiry.id);
    setIsRetryingEmail(false);
    if (res.success) {
      onNotify('Email Dispatched', res.message, true);
      onStatusUpdated({
        ...enquiry,
        emailStatus: 'sent',
        emailProviderId: `resend_${Date.now()}`,
        emailError: undefined,
      });
      const updatedActs = await enquiryService.getActivities(enquiry.id);
      setActivities(updatedActs);
    } else {
      onNotify('Retry Failed', res.message, false);
    }
  };

  const cleanPhone = enquiry.phoneNumber.replace(/[^\d+]/g, '');
  const waPhone = cleanPhone.replace(/^\+/, '');

  return (
    <div className="enquiry-modal-overlay" role="dialog" aria-modal="true">
      <div className="enquiry-modal-card">
        {/* Modal Top Header */}
        <div className="enquiry-modal-header">
          <div className="modal-title-group">
            <span className="ref-pill">{enquiry.referenceId}</span>
            <h3>{enquiry.companyName}</h3>
            <span className="meta-timestamp">
              Received: {new Date(enquiry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
            </span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            &times;
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="enquiry-modal-body">
          <div className="modal-grid-two">
            {/* Left Column: Customer Profile & Requirements */}
            <div className="modal-left-col">
              {/* Customer Contact Card */}
              <div className="detail-card">
                <h4 className="detail-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="title-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Contact Profile
                </h4>
                <div className="detail-row">
                  <span className="label">Customer Name:</span>
                  <span className="value font-bold">{enquiry.fullName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Company:</span>
                  <span className="value font-bold">{enquiry.companyName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone / WhatsApp:</span>
                  <span className="value">{enquiry.phoneNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{enquiry.emailAddress}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{enquiry.cityState}, {enquiry.country}</span>
                </div>
                {enquiry.plantLocation && (
                  <div className="detail-row">
                    <span className="label">Plant / Site:</span>
                    <span className="value highlight-val">{enquiry.plantLocation}</span>
                  </div>
                )}
                {enquiry.preferredContact && (
                  <div className="detail-row">
                    <span className="label">Preferred Contact:</span>
                    <span className="value font-semibold">{enquiry.preferredContact}</span>
                  </div>
                )}

                {/* Instant Action Triggers */}
                <div className="quick-contact-actions">
                  <a
                    href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                      `Hello ${enquiry.fullName}, this is VSS Alutech Solutions regarding your enquiry ${enquiry.referenceId} for ${enquiry.companyName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-whatsapp-action"
                  >
                    💬 WhatsApp Lead
                  </a>
                  <a href={`tel:${cleanPhone}`} className="btn btn-sm btn-phone-action">
                    📞 Call Lead
                  </a>
                  <a
                    href={`mailto:${enquiry.emailAddress}?subject=Re:%20Enquiry%20${enquiry.referenceId}%20-%20VSS%20Alutech%20Solutions`}
                    className="btn btn-sm btn-email-action"
                  >
                    ✉️ Send Email
                  </a>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="detail-card">
                <h4 className="detail-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="title-icon">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  Equipment &amp; Technical Parameters
                </h4>
                <div className="detail-row">
                  <span className="label">Service Category:</span>
                  <span className="value service-badge">{enquiry.serviceCategory}</span>
                </div>
                {enquiry.machineryRequired && (
                  <div className="detail-row">
                    <span className="label">Equipment:</span>
                    <span className="value">{enquiry.machineryRequired}</span>
                  </div>
                )}
                {enquiry.pressCapacity && (
                  <div className="detail-row">
                    <span className="label">Capacity / Tonnage:</span>
                    <span className="value font-bold">{enquiry.pressCapacity}</span>
                  </div>
                )}
                {enquiry.technicalSpecs && (
                  <div className="detail-row">
                    <span className="label">Technical Specs:</span>
                    <span className="value">{enquiry.technicalSpecs}</span>
                  </div>
                )}
                {enquiry.projectStage && (
                  <div className="detail-row">
                    <span className="label">Project Stage:</span>
                    <span className="value">{enquiry.projectStage}</span>
                  </div>
                )}
                {enquiry.timelineUrgency && (
                  <div className="detail-row">
                    <span className="label">Urgency:</span>
                    <span className="value urgency-badge">{enquiry.timelineUrgency}</span>
                  </div>
                )}
                {enquiry.approxBudget && (
                  <div className="detail-row">
                    <span className="label">Budget Estimate:</span>
                    <span className="value">{enquiry.approxBudget}</span>
                  </div>
                )}
                {enquiry.attachmentName && (
                  <div className="detail-row">
                    <span className="label">Attached File:</span>
                    <span className="value file-badge">📎 {enquiry.attachmentName} ({enquiry.attachmentSizeMB} MB)</span>
                  </div>
                )}
              </div>

              {/* Customer Message */}
              <div className="detail-card">
                <h4 className="detail-card-title">Detailed Customer Message</h4>
                <div className="message-content-box">
                  {enquiry.message}
                </div>
                {enquiry.additionalNotes && (
                  <div className="additional-notes-box">
                    <strong>Additional Logistics Note:</strong> {enquiry.additionalNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Workflow, Follow-up Notes & Resend Status */}
            <div className="modal-right-col">
              {/* Status Selector */}
              <div className="detail-card highlight-card">
                <h4 className="detail-card-title">Enquiry Workflow Status</h4>
                <div className="status-selector-row">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
                    className={`status-dropdown status-style-${currentStatus}`}
                  >
                    <option value="new">● NEW ENQUIRY</option>
                    <option value="in_review">● IN REVIEW</option>
                    <option value="contacted">● CONTACTED</option>
                    <option value="proposal_sent">● PROPOSAL SENT</option>
                    <option value="won">● WON / CLOSED DEAL</option>
                    <option value="lost">● LOST</option>
                    <option value="archived">● ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Transactional Email Notification Tracker (Resend) */}
              <div className="detail-card">
                <h4 className="detail-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="title-icon">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Email Notification (Resend)
                </h4>
                <div className="email-status-display">
                  <div className="status-indicator-line">
                    <span className="label">Notification State:</span>
                    <span className={`pill-email pill-${enquiry.emailStatus}`}>
                      {enquiry.emailStatus === 'sent' && '✓ Delivered via Resend'}
                      {enquiry.emailStatus === 'pending' && '⏳ Queued / Pending'}
                      {enquiry.emailStatus === 'failed' && '⚠ Delivery Failed'}
                      {enquiry.emailStatus === 'skipped' && 'Bot Skipped'}
                    </span>
                  </div>

                  {enquiry.emailProviderId && (
                    <div className="provider-ref">
                      <span className="label">Resend Message ID:</span>
                      <code>{enquiry.emailProviderId}</code>
                    </div>
                  )}

                  {enquiry.emailSentAt && (
                    <div className="provider-ref">
                      <span className="label">Dispatched At:</span>
                      <span>{new Date(enquiry.emailSentAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {enquiry.emailError && (
                    <div className="email-error-callout">
                      <strong>Delivery Error:</strong> {enquiry.emailError}
                    </div>
                  )}

                  <div className="email-retry-wrap">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleRetryEmail}
                      disabled={isRetryingEmail}
                    >
                      {isRetryingEmail ? 'Re-triggering Resend...' : '↻ Re-Send Email Notification'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Internal Follow-up Notes */}
              <div className="detail-card">
                <h4 className="detail-card-title">Executive &amp; Technical Follow-Up Notes</h4>
                <textarea
                  className="admin-notes-textarea"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record call summary, quotation number, site visit dates, or commercial discussion details..."
                ></textarea>
                <div className="notes-action-row">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes ? 'Saving Notes...' : 'Save Follow-Up Notes'}
                  </button>
                </div>
              </div>

              {/* Audit Activity Log */}
              <div className="detail-card">
                <h4 className="detail-card-title">Audit Trail &amp; Activity Log</h4>
                {loadingActivities ? (
                  <p className="loading-activities">Loading history...</p>
                ) : activities.length === 0 ? (
                  <p className="empty-activities">No activities recorded yet.</p>
                ) : (
                  <ul className="activity-timeline">
                    {activities.map((act) => (
                      <li key={act.id} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-action">{act.action}</div>
                          <div className="timeline-meta">
                            <span>{act.performedBy}</span> &bull;{' '}
                            <span>{new Date(act.createdAt).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
