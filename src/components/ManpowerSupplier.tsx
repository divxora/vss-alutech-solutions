import React, { useState } from 'react';
import { ManpowerFormData } from '../types';

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
  const [submittedData, setSubmittedData] = useState<ManpowerFormData | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    const payload: ManpowerFormData = {
      ...formData,
      requestedAt: new Date().toISOString(),
    };

    console.info('Manpower Staffing Inquiry Captured:', payload);

    try {
      const stored = JSON.parse(localStorage.getItem('vss_manpower_requests') || '[]');
      stored.push(payload);
      localStorage.setItem('vss_manpower_requests', JSON.stringify(stored));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    setSubmittedData(payload);
    onNotify('Staffing Request Logged', `${payload.workersCount}x ${payload.designation} in ${payload.location}`);

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
              style={{ backgroundImage: `url('/assets/images/manpower-team.jpg')` }}
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
                    placeholder="+91 XXXXX XXXXX"
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

              <button type="submit" className="btn btn-primary btn-block" id="submitManpowerBtn">
                <span>Request Manpower</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {submittedData && (
                <div className="form-alert success" id="mpFormAlert">
                  <strong>Staffing Request Received!</strong><br />
                  We have logged your request for <strong>{submittedData.workersCount}x {submittedData.designation}</strong> in <em>{submittedData.location}</em>.<br />
                  <small>*Candidate profiles will be matched based on availability and contractual terms.</small>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
