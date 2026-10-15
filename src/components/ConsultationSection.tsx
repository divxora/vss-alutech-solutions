import React, { useState, useEffect, useRef } from 'react';
import { ConsultationFormData } from '../types';

interface ConsultationSectionProps {
  selectedService: string;
  estimatedRequirement: string;
  onNotify: (title: string, message: string, isSuccess?: boolean) => void;
}

export const ConsultationSection: React.FC<ConsultationSectionProps> = ({
  selectedService,
  estimatedRequirement,
  onNotify,
}) => {
  const [formData, setFormData] = useState<ConsultationFormData>({
    fullName: '',
    companyName: '',
    phoneNumber: '',
    emailAddress: '',
    serviceRequired: selectedService || '',
    projectStage: 'Planning New Greenfield Plant',
    estimatedRequirement: estimatedRequirement || '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachedFile, setAttachedFile] = useState<{ name: string; sizeMB: string } | null>(null);
  const [submittedData, setSubmittedData] = useState<ConsultationFormData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({ ...prev, serviceRequired: selectedService }));
    }
  }, [selectedService]);

  useEffect(() => {
    if (estimatedRequirement) {
      setFormData((prev) => ({ ...prev, estimatedRequirement }));
    }
  }, [estimatedRequirement]);

  const phoneRegex = /^[+]?[\d\s\-()]{7,18}$/;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  const validateField = (name: keyof ConsultationFormData, value: string): string => {
    switch (name) {
      case 'fullName':
        return value.trim().length >= 2 ? '' : 'Please enter your full name (minimum 2 characters).';
      case 'companyName':
        return value.trim().length >= 2 ? '' : 'Please enter your company or business name.';
      case 'phoneNumber':
        return phoneRegex.test(value.trim()) ? '' : 'Please enter a valid phone number (7-15 digits).';
      case 'emailAddress':
        return emailRegex.test(value.trim()) ? '' : 'Please enter a valid business email address.';
      case 'serviceRequired':
        return value.trim() ? '' : 'Please select the required service category.';
      case 'message':
        return value.trim().length >= 10 ? '' : 'Please provide details about your inquiry (minimum 10 characters).';
      default:
        return '';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const err = validateField(name as keyof ConsultationFormData, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setAttachedFile({ name: file.name, sizeMB });
      onNotify('File Attached', `${file.name} (${sizeMB} MB) ready to submit.`);
    } else {
      setAttachedFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    (['fullName', 'companyName', 'phoneNumber', 'emailAddress', 'serviceRequired', 'message'] as (keyof ConsultationFormData)[]).forEach((f) => {
      const err = validateField(f, String(formData[f] || ''));
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: ConsultationFormData = {
      ...formData,
      attachmentName: attachedFile?.name,
      attachmentSizeMB: attachedFile?.sizeMB,
      submittedAt: new Date().toISOString(),
    };

    console.info('Consultation Form Inquiry Captured (Ready for Backend Integration):', payload);

    try {
      const existingInquiries = JSON.parse(localStorage.getItem('vss_inquiries') || '[]');
      existingInquiries.push(payload);
      localStorage.setItem('vss_inquiries', JSON.stringify(existingInquiries));
    } catch (err) {
      console.warn('LocalStorage unavailable:', err);
    }

    setSubmittedData(payload);
    onNotify('Inquiry Form Validated & Logged', `Thank you, ${payload.fullName} (${payload.companyName}).`);

    // Reset form inputs
    setFormData({
      fullName: '',
      companyName: '',
      phoneNumber: '',
      emailAddress: '',
      serviceRequired: '',
      projectStage: 'Planning New Greenfield Plant',
      estimatedRequirement: '',
      message: '',
    });
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors({});
  };

  return (
    <section
      className="consultation-section"
      id="consultation"
      style={{ backgroundImage: `url('/assets/images/factory-dark-bg.jpg')` }}
    >
      <div className="consultation-overlay"></div>
      <div className="container consultation-container">
        <div className="consultation-grid">
          {/* Left Column */}
          <div className="consultation-info-col">
            <span className="section-tag light-tag">LET'S CONNECT</span>
            <h2 className="consultation-heading">Speak with Our Aluminium Extrusion Specialists</h2>
            <p className="consultation-lead">
              Whether you are evaluating a greenfield plant investment, troubleshooting an active extrusion line, sourcing precision dies, or hiring skilled machine operators, we are ready to assist.
            </p>

            <div className="consultation-contact-cards">
              <div className="contact-mini-card">
                <div className="mini-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <strong>Direct Email Inquiries:</strong>
                  <p>
                    <a href="mailto:info@vsslutechsolutions.in">info@vsslutechsolutions.in</a>{' '}
                    <span className="placeholder-tag">[Placeholder]</span>
                  </p>
                </div>
              </div>

              <div className="contact-mini-card">
                <div className="mini-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <strong>Phone / WhatsApp:</strong>
                  <p>
                    <a href="tel:+910000000000">+91 [Phone Placeholder]</a>
                  </p>
                </div>
              </div>

              <div className="contact-mini-card">
                <div className="mini-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <strong>Operational Reach:</strong>
                  <p>Pan-India Engineering &amp; Sourcing Coordination</p>
                </div>
              </div>
            </div>

            <div className="confidentiality-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Non-Disclosure Assurance: All technical drawings, project feasibility data, and plant operational details are handled with strict commercial confidentiality.</span>
            </div>
          </div>

          {/* Right White Form Card */}
          <div className="consultation-form-col">
            <div className="white-form-card">
              <h3 className="form-card-title">Request a Consultation / Quote</h3>
              <p className="form-card-subtitle">
                Fill in the project details below and our technical team will respond within 24 business hours.
              </p>

              <form id="consultationForm" className="site-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? 'is-invalid' : ''}
                      placeholder="e.g. Rajesh Sharma"
                      required
                    />
                    {errors.fullName && <div className="field-error visible">{errors.fullName}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={errors.companyName ? 'is-invalid' : ''}
                      placeholder="e.g. Apex Extrusions Ltd."
                      required
                    />
                    {errors.companyName && <div className="field-error visible">{errors.companyName}</div>}
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={errors.phoneNumber ? 'is-invalid' : ''}
                      placeholder="+91 98765 43210"
                      required
                    />
                    {errors.phoneNumber && <div className="field-error visible">{errors.phoneNumber}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="emailAddress">Email Address *</label>
                    <input
                      type="email"
                      id="emailAddress"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      className={errors.emailAddress ? 'is-invalid' : ''}
                      placeholder="rajesh@example.com"
                      required
                    />
                    {errors.emailAddress && <div className="field-error visible">{errors.emailAddress}</div>}
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="serviceRequired">Service Required *</label>
                    <select
                      id="serviceRequired"
                      name="serviceRequired"
                      value={formData.serviceRequired}
                      onChange={handleChange}
                      className={errors.serviceRequired ? 'is-invalid' : ''}
                      required
                    >
                      <option value="">Select Service</option>
                      <option value="Press Solutions">Press Solutions</option>
                      <option value="Furnace Solutions">Furnace Solutions</option>
                      <option value="Plant Troubleshooting">Plant Troubleshooting</option>
                      <option value="Tool Room & Die Solutions">Tool Room &amp; Die Solutions</option>
                      <option value="Manpower Supplier">Manpower Supplier</option>
                      <option value="Aluminium Alloy Consultation">Aluminium Alloy Consultation</option>
                      <option value="Complete Plant Setup">Complete Plant Setup</option>
                    </select>
                    {errors.serviceRequired && <div className="field-error visible">{errors.serviceRequired}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="projectStage">Project Stage</label>
                    <select
                      id="projectStage"
                      name="projectStage"
                      value={formData.projectStage}
                      onChange={handleChange}
                    >
                      <option value="Planning New Greenfield Plant">Planning New Greenfield Plant</option>
                      <option value="Upgrading Existing Extrusion Line">Upgrading Existing Extrusion Line</option>
                      <option value="Active Plant Troubleshooting">Active Plant Troubleshooting</option>
                      <option value="Die Sourcing Requirement">Die Sourcing Requirement</option>
                      <option value="Staffing / Manpower Sourcing">Staffing / Manpower Sourcing</option>
                      <option value="General Technical Inquiry">General Technical Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedRequirement">Estimated Requirement / Press Tonnage (Optional)</label>
                  <input
                    type="text"
                    id="estimatedRequirement"
                    name="estimatedRequirement"
                    value={formData.estimatedRequirement}
                    onChange={handleChange}
                    placeholder="e.g. 1,400 UST press line / 10 dies per month / 6 operators"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="drawingAttachment">Attach Profile Drawings / Technical Specs (Optional)</label>
                  <div className="file-upload-box">
                    <input
                      type="file"
                      id="drawingAttachment"
                      name="drawingAttachment"
                      className="file-input"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.dwg,.dxf,.step,.stp,.png,.jpg,.jpeg"
                    />
                    <label htmlFor="drawingAttachment" className="file-upload-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="upload-icon">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span id="fileUploadText">
                        {attachedFile
                          ? `Attached: ${attachedFile.name} (${attachedFile.sizeMB} MB)`
                          : 'Upload 2D/3D Drawings (.dwg, .dxf, .step, .pdf)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Project Scope or Problem Description *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? 'is-invalid' : ''}
                    placeholder="Briefly describe your aluminium extrusion requirements, current equipment, or operational goals..."
                    required
                  ></textarea>
                  {errors.message && <div className="field-error visible">{errors.message}</div>}
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" id="submitConsultationBtn">
                  <span>Submit Inquiry</span>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                {submittedData && (
                  <div className="form-alert success" id="formAlert">
                    <strong>Inquiry Form Validated &amp; Logged!</strong><br />
                    Thank you, <em>{submittedData.fullName}</em> ({submittedData.companyName}). Your inquiry for <strong>{submittedData.serviceRequired}</strong> has been structured and recorded.<br />
                    <small style={{ display: 'inline-block', marginTop: '6px', color: '#064E3B' }}>
                      *Prototype Notice: Frontend validation passed. In production, this form will forward directly to the VSS Alutech email gateway via Formspree, EmailJS, or your internal CRM.
                    </small>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
