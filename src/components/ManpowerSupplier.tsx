import React, { useState } from 'react';
import { ManpowerFormData } from '../types';
import { getAssetUrl } from '../utils/asset';
import { enquiryService } from '../services/enquiryService';
import {
  formatWhatsAppEnquiryMessage,
  buildWhatsAppUrl,
  openWhatsAppDirectly,
  VSS_PRIMARY_WHATSAPP,
} from '../utils/whatsapp';

interface ManpowerSupplierProps {
  onNotify: (title: string, message: string, isSuccess?: boolean) => void;
}

export const ManpowerSupplier: React.FC<ManpowerSupplierProps> = ({ onNotify }) => {
  const [filter, setFilter] = useState<'all' | 'management' | 'supervisory' | 'operators' | 'support'>('all');

  const [formData, setFormData] = useState<ManpowerFormData>({
    designation: '',
    workersCount: '',
    skillLevel: '',
    shift: 'General Shift (Day)',
    duration: 'Contract (6 Months)',
    location: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  const phoneRegex = /^[+]?[\d\s\-()]{7,18}$/;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  const validateField = (name: keyof ManpowerFormData, value: string): string => {
    switch (name) {
      case 'designation':
        return value.trim() ? '' : 'Please choose a primary designation.';
      case 'workersCount':
        return Number(value) > 0 ? '' : 'Please enter a valid worker count (min 1).';
      case 'skillLevel':
        return value.trim() ? '' : 'Please select required skill level.';
      case 'location':
        return value.trim().length >= 2 ? '' : 'Please enter plant location (min 2 characters).';
      case 'phone':
        return phoneRegex.test(value.trim()) ? '' : 'Please enter a valid phone number (7-15 digits).';
      case 'email':
        return emailRegex.test(value.trim()) ? '' : 'Please enter a valid business email address.';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const err = validateField(name as keyof ManpowerFormData, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    (['designation', 'workersCount', 'skillLevel', 'location', 'phone', 'email'] as (keyof ManpowerFormData)[]).forEach((f) => {
      const err = validateField(f, String(formData[f] || ''));
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const messageDetails = `Service: Skilled and contract manpower | Designation: ${formData.designation} | Quantity: ${formData.workersCount} | Skill Level: ${formData.skillLevel} | Shift: ${formData.shift} | Contract Duration: ${formData.duration} | Plant Location: ${formData.location}`;

    try {
      const response = await enquiryService.submitEnquiry({
        fullName: `${formData.designation} Staffing Lead`,
        companyName: `Manpower Requirement (${formData.location})`,
        phoneNumber: formData.phone,
        emailAddress: formData.email,
        cityState: formData.location || 'India',
        country: 'India',
        serviceCategory: 'Skilled and contract manpower',
        message: messageDetails,
      });

      if (response.success && response.referenceId) {
        // Build complete structured WhatsApp message
        const waText = formatWhatsAppEnquiryMessage({
          referenceId: response.referenceId,
          type: 'Industrial Manpower Request',
          fullName: `Staffing Lead (${formData.location})`,
          companyName: `Extrusion Plant (${formData.location})`,
          phone: formData.phone,
          email: formData.email,
          location: formData.location,
          serviceCategory: 'Skilled and contract manpower',
          timelineUrgency: formData.duration,
          technicalSpecs: `${formData.workersCount}x ${formData.designation} (${formData.skillLevel}, Shift: ${formData.shift})`,
          message: `Manpower Staffing Request: ${formData.workersCount}x ${formData.designation}. Skill: ${formData.skillLevel}. Shift: ${formData.shift}. Contract duration: ${formData.duration}. Plant location: ${formData.location}.`,
        });

        const waUrl = buildWhatsAppUrl(waText, VSS_PRIMARY_WHATSAPP);
        setWhatsAppUrl(waUrl);

        // Open WhatsApp directly with complete information
        openWhatsAppDirectly(waText, VSS_PRIMARY_WHATSAPP);

        setSubmitSuccess(
          `Staffing request confirmed for ${formData.workersCount}x ${formData.designation} in ${formData.location}. Reference: ${response.referenceId}`
        );
        onNotify(
          'Staffing Request Registered',
          `Reference ${response.referenceId} saved in Admin Portal. Complete details opened in WhatsApp.`,
          true
        );

        // Reset form fields
        setFormData({
          designation: '',
          workersCount: '',
          skillLevel: '',
          shift: 'General Shift (Day)',
          duration: 'Contract (6 Months)',
          location: '',
          phone: '',
          email: '',
        });
        setErrors({});
      } else {
        const errorMsg = response.message || 'Failed to submit staffing enquiry. Please try again.';
        setSubmitError(errorMsg);
        onNotify('Submission Failed', errorMsg, false);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Network error submitting staffing request.';
      setSubmitError(errorMsg);
      onNotify('Submission Error', errorMsg, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectWhatsApp = () => {
    if (!formData.phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: 'Please enter your contact phone/WhatsApp number.' }));
      onNotify('Phone Number Required', 'Please enter your contact phone number to open WhatsApp.', false);
      const el = document.getElementById('mpPhone');
      if (el) el.focus();
      return;
    }

    const waText = formatWhatsAppEnquiryMessage({
      referenceId: `VSS-MPR-${Date.now().toString().slice(-6)}`,
      type: 'Industrial Manpower Request',
      fullName: `Staffing Lead (${formData.location || 'India'})`,
      companyName: `Extrusion Plant (${formData.location || 'India'})`,
      phone: formData.phone,
      email: formData.email || 'Not Specified',
      location: formData.location || 'India',
      serviceCategory: 'Skilled and contract manpower',
      timelineUrgency: formData.duration,
      technicalSpecs: `${formData.workersCount || '1'}x ${formData.designation || 'Staff'} (${formData.skillLevel || 'Experienced'}, Shift: ${formData.shift})`,
      message: `Manpower Staffing Request: ${formData.workersCount || '1'}x ${formData.designation || 'Specialist'}. Skill: ${formData.skillLevel || 'Skilled'}. Shift: ${formData.shift}. Contract duration: ${formData.duration}. Plant location: ${formData.location || 'India'}.`,
    });

    openWhatsAppDirectly(waText, VSS_PRIMARY_WHATSAPP);
    onNotify('Opening WhatsApp', 'Launching WhatsApp chat with pre-filled staffing details...', true);
  };

  return (
    <section className="service-detail-section" id="manpower-supplier">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">SERVICE CATEGORY 05</span>
          <h2 className="section-title">Industrial Manpower Supply &amp; Technical Staffing</h2>
          <p className="section-subtitle">
            Reliable, trained workforce sourcing for aluminium extrusion operations. Manpower is arranged based on customer technical requirements, subject to availability and mutually agreed contract terms.
          </p>
        </div>

        {/* Manpower Interactive Category Filter Tabs */}
        <div className="manpower-filter-tabs" id="manpowerFilterTabs">
          <button
            type="button"
            className={`mp-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Roles (4 Categories)
          </button>
          <button
            type="button"
            className={`mp-tab-btn ${filter === 'management' ? 'active' : ''}`}
            onClick={() => setFilter('management')}
          >
            Senior &amp; Management
          </button>
          <button
            type="button"
            className={`mp-tab-btn ${filter === 'supervisory' ? 'active' : ''}`}
            onClick={() => setFilter('supervisory')}
          >
            Supervisory &amp; Technical
          </button>
          <button
            type="button"
            className={`mp-tab-btn ${filter === 'operators' ? 'active' : ''}`}
            onClick={() => setFilter('operators')}
          >
            Machine Operators
          </button>
          <button
            type="button"
            className={`mp-tab-btn ${filter === 'support' ? 'active' : ''}`}
            onClick={() => setFilter('support')}
          >
            Support Staff
          </button>
        </div>

        <div className="manpower-categories-grid" id="manpowerGrid">
          {/* Senior & Management */}
          {(filter === 'all' || filter === 'management') && (
            <div className="manpower-card" data-category="management">
              <div className="manpower-card-header">
                <div className="manpower-category-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="manpower-cat-title">Senior &amp; Management</h3>
              </div>
              <ul className="manpower-role-list">
                <li><span className="role-bullet">&#10003;</span> <strong>Plant Head:</strong> End-to-end plant operations, P&amp;L, shift coordination &amp; productivity.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Production Manager:</strong> Extrusion scheduling, scrap control &amp; yield management.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Maintenance Manager:</strong> Preventive maintenance, hydraulic &amp; electrical uptime.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Quality Manager:</strong> Dimensional tolerances, alloy testing &amp; QA/QC compliance.</li>
              </ul>
            </div>
          )}

          {/* Supervisory & Technical */}
          {(filter === 'all' || filter === 'supervisory') && (
            <div className="manpower-card" data-category="supervisory">
              <div className="manpower-card-header">
                <div className="manpower-category-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <h3 className="manpower-cat-title">Supervisory &amp; Technical</h3>
              </div>
              <ul className="manpower-role-list">
                <li><span className="role-bullet">&#10003;</span> <strong>Production Supervisors:</strong> Shift supervision, production logs &amp; team management.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Shift In-charges:</strong> On-floor process coordination and safety protocol oversight.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Quality Technicians:</strong> Vernier, micrometer, hardness &amp; profile projector inspection.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Maintenance Technicians:</strong> Mechanical alignments, seal changes &amp; lubrication.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Electrical Technicians:</strong> PLC troubleshooting, drive tuning &amp; sensor calibration.</li>
              </ul>
            </div>
          )}

          {/* Machine Operators */}
          {(filter === 'all' || filter === 'operators') && (
            <div className="manpower-card" data-category="operators">
              <div className="manpower-card-header">
                <div className="manpower-category-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <h3 className="manpower-cat-title">Machine Operators</h3>
              </div>
              <ul className="manpower-role-list">
                <li><span className="role-bullet">&#10003;</span> <strong>Extrusion Press Operators:</strong> Console desk handling, extrusion speed &amp; pressure.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Furnace Operators:</strong> Billet heater &amp; log shear temperature &amp; feed regulation.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Puller &amp; Handling Operators:</strong> Runout table, transfer arms &amp; cooling fans.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Ageing Oven Operators:</strong> Heat cycle batch loading &amp; soak time monitoring.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Packing &amp; Finishing Operators:</strong> Precision saw cutting, deburring &amp; packing.</li>
              </ul>
            </div>
          )}

          {/* Support Staff */}
          {(filter === 'all' || filter === 'support') && (
            <div className="manpower-card" data-category="support">
              <div className="manpower-card-header">
                <div className="manpower-category-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="manpower-cat-title">Support Staff</h3>
              </div>
              <ul className="manpower-role-list">
                <li><span className="role-bullet">&#10003;</span> <strong>Skilled Workers:</strong> Stretcher operators, die assembly crew &amp; log loaders.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Semi-Skilled Workers:</strong> Spacer placing, bundle strapping &amp; inventory stacking.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Helpers:</strong> General plant cleanliness, scrap sorting &amp; loading assistance.</li>
                <li><span className="role-bullet">&#10003;</span> <strong>Material Handling Staff:</strong> Overhead crane and forklift operators.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Staffing Models & Manpower Dedicated Enquiry Form */}
        <div className="manpower-models-wrap">
          <div className="models-overview">
            <h3 className="sub-heading">Flexible Staffing Models</h3>
            <div className="models-grid">
              <div className="model-box">
                <strong>Contract-Based Manpower:</strong> Long-term outsourced staffing covering ongoing factory operational shifts.
              </div>
              <div className="model-box">
                <strong>Project-Based Staffing:</strong> Specialized teams deployed for new plant commissioning, ramp-up, or trial runs.
              </div>
              <div className="model-box">
                <strong>Shift-Based Requirements:</strong> Backfilling 2nd or 3rd shift capacity during peak production seasons.
              </div>
              <div className="model-box">
                <strong>Bulk Manpower Requirements:</strong> Comprehensive staffing packages from management to helpers for greenfield projects.
              </div>
            </div>
            <div
              className="manpower-photo-banner"
              style={{ backgroundImage: `url('${getAssetUrl('assets/images/manpower-team.jpg')}')` }}
            >
              <div className="photo-banner-overlay">
                <p>Industrial recruitment and placement subject to candidate verification, geographical feasibility, and agreed statutory compliance.</p>
              </div>
            </div>
          </div>

          {/* Dedicated Manpower Enquiry Box */}
          <div className="manpower-form-card" id="manpower-form-block">
            <h3 className="manpower-form-title">Request Industrial Manpower</h3>
            <p className="manpower-form-sub">Specify your staffing requirements for aluminium extrusion operations.</p>

            <form id="manpowerEnquiryForm" className="manpower-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="mpDesignation">Required Designation(s) *</label>
                <select
                  id="mpDesignation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={errors.designation ? 'is-invalid' : ''}
                  required
                >
                  <option value="">Select Primary Role</option>
                  <option value="Plant Head / Production Manager">Plant Head / Production Manager</option>
                  <option value="Maintenance / Electrical Head">Maintenance / Electrical Head</option>
                  <option value="Extrusion Press Operator">Extrusion Press Operator</option>
                  <option value="Furnace / Log Shear Operator">Furnace / Log Shear Operator</option>
                  <option value="Production Supervisor / Shift In-Charge">Production Supervisor / Shift In-Charge</option>
                  <option value="Quality Control Technician">Quality Control Technician</option>
                  <option value="Maintenance / Electrical Technician">Maintenance / Electrical Technician</option>
                  <option value="Stretcher / Puller Operator">Stretcher / Puller Operator</option>
                  <option value="Packing / General Floor Helpers">Packing / General Floor Helpers</option>
                  <option value="Full Plant Crew (All Levels)">Full Plant Crew (All Levels)</option>
                </select>
                {errors.designation && <div className="field-error visible">{errors.designation}</div>}
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="mpWorkersCount">No. of Workers *</label>
                  <input
                    type="number"
                    id="mpWorkersCount"
                    name="workersCount"
                    value={formData.workersCount}
                    onChange={handleChange}
                    className={errors.workersCount ? 'is-invalid' : ''}
                    placeholder="e.g. 5"
                    min="1"
                    max="200"
                    required
                  />
                  {errors.workersCount && <div className="field-error visible">{errors.workersCount}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="mpSkillLevel">Skill Level *</label>
                  <select
                    id="mpSkillLevel"
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleChange}
                    className={errors.skillLevel ? 'is-invalid' : ''}
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Experienced Senior (7+ Years)">Experienced Senior (7+ Years)</option>
                    <option value="Mid-Level Operator (3-7 Years)">Mid-Level Operator (3-7 Years)</option>
                    <option value="Junior / Semi-Skilled">Junior / Semi-Skilled</option>
                    <option value="Helpers / Unskilled">Helpers / Unskilled</option>
                  </select>
                  {errors.skillLevel && <div className="field-error visible">{errors.skillLevel}</div>}
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="mpShift">Shift Requirements</label>
                  <select
                    id="mpShift"
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                  >
                    <option value="General Shift (Day)">General Shift (Day)</option>
                    <option value="2-Shift Rotation (12 Hr)">2-Shift Rotation (12 Hr)</option>
                    <option value="3-Shift Continuous (8 Hr)">3-Shift Continuous (8 Hr)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mpDuration">Contract Duration</label>
                  <select
                    id="mpDuration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                  >
                    <option value="Project-Based (1-3 Months)">Project-Based (1-3 Months)</option>
                    <option value="Contract (6 Months)">Contract (6 Months)</option>
                    <option value="Long-Term (1+ Year)">Long-Term (1+ Year)</option>
                    <option value="Permanent Placement Advisory">Permanent Placement Advisory</option>
                  </select>
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="mpLocation">Plant Location (City / State) *</label>
                  <input
                    type="text"
                    id="mpLocation"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={errors.location ? 'is-invalid' : ''}
                    placeholder="e.g. Ahmedabad, Gujarat"
                    required
                  />
                  {errors.location && <div className="field-error visible">{errors.location}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="mpPhone">Contact Phone *</label>
                  <input
                    type="tel"
                    id="mpPhone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'is-invalid' : ''}
                    placeholder="+91 9517098011"
                    required
                  />
                  {errors.phone && <div className="field-error visible">{errors.phone}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mpEmail">Business Email *</label>
                <input
                  type="email"
                  id="mpEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'is-invalid' : ''}
                  placeholder="manager@yourcompany.com"
                  required
                />
                {errors.email && <div className="field-error visible">{errors.email}</div>}
              </div>

              <div className="form-dual-action-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Top Button: Primary Action */}
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  id="submitManpowerBtn"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                    width: '100%',
                    padding: '14px 20px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-circle"></span>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      <span>Submit Request</span>
                    </>
                  )}
                </button>

                {/* Bottom Button: Secondary WhatsApp Style */}
                <button
                  type="button"
                  className="btn btn-whatsapp-action btn-block btn-lg"
                  id="whatsappManpowerBtn"
                  onClick={handleDirectWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    backgroundColor: '#25D366',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                    width: '100%',
                    padding: '14px 20px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Send to WhatsApp</span>
                </button>

                {/* Helper Note Directly Below Buttons */}
                <div
                  className="form-helper-callout"
                  style={{
                    padding: '12px 14px',
                    background: '#FEF9C3',
                    border: '1px solid #FDE047',
                    borderRadius: '6px',
                    color: '#854D0E',
                    fontSize: '13.5px',
                    lineHeight: '1.5',
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  💡 Note: Fast response aur quick solution ke liye 'Submit Request' ke saath-saath 'Send to WhatsApp' bhi zaroor karein!
                </div>
              </div>

              {submitError && (
                <div
                  className="form-alert error"
                  id="mpFormError"
                  style={{
                    marginTop: '16px',
                    background: '#FFF1F2',
                    color: '#BE123C',
                    border: '1px solid #FDA4AF',
                    padding: '12px 16px',
                    borderRadius: '6px',
                  }}
                >
                  <strong>Submission Failed:</strong><br />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="form-alert success" id="mpFormAlert" style={{ marginTop: '16px' }}>
                  <strong>Request Transmitted Successfully!</strong><br />
                  <span>{submitSuccess}</span><br />
                  <small>*Logged in Admin Portal with real-time tracking.</small>
                  {whatsAppUrl && (
                    <div style={{ marginTop: '12px' }}>
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp-direct"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#25D366',
                          color: '#ffffff',
                          fontWeight: '600',
                          padding: '10px 18px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span>Send via WhatsApp Directly</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
