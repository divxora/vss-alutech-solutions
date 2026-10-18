import React, { useState, useEffect, useRef } from 'react';
import {
  ServiceCategory,
  ProjectStage,
  TimelineUrgency,
  PreferredContactMethod,
  EmailDeliveryStatus,
} from '../types';
import { getAssetUrl } from '../utils/asset';
import { enquiryService } from '../services/enquiryService';

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
  const [formData, setFormData] = useState<{
    fullName: string;
    companyName: string;
    phoneNumber: string;
    emailAddress: string;
    cityState: string;
    country: string;
    serviceCategory: ServiceCategory | string;
    plantLocation: string;
    machineryRequired: string;
    pressCapacity: string;
    technicalSpecs: string;
    approxBudget: string;
    projectStage: ProjectStage | string;
    timelineUrgency: TimelineUrgency | string;
    preferredContact: PreferredContactMethod | string;
    message: string;
    additionalNotes: string;
    honeypot: string; // anti-spam
  }>({
    fullName: '',
    companyName: '',
    phoneNumber: '',
    emailAddress: '',
    cityState: '',
    country: 'India',
    serviceCategory: selectedService || 'Aluminium extrusion press solutions',
    plantLocation: '',
    machineryRequired: '',
    pressCapacity: estimatedRequirement || '',
    technicalSpecs: '',
    approxBudget: '',
    projectStage: 'New Greenfield Plant',
    timelineUrgency: '1 to 3 Months',
    preferredContact: 'WhatsApp',
    message: '',
    additionalNotes: '',
    honeypot: '',
  });

  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; sizeMB: string } | null>(null);

  const [submissionResult, setSubmissionResult] = useState<{
    referenceId: string;
    companyName: string;
    fullName: string;
    serviceCategory: string;
    emailStatus: EmailDeliveryStatus;
    message: string;
  } | null>(null);

  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedService) {
      // Map incoming service string to one of the canonical categories if needed
      let matchedService = selectedService;
      if (selectedService.toLowerCase().includes('press')) {
        matchedService = 'Aluminium extrusion press solutions';
      } else if (selectedService.toLowerCase().includes('furnace')) {
        matchedService = 'Furnace selection, setup and execution';
      } else if (selectedService.toLowerCase().includes('trouble')) {
        matchedService = 'Plant troubleshooting and technical consultancy';
      } else if (selectedService.toLowerCase().includes('tool') || selectedService.toLowerCase().includes('die')) {
        matchedService = 'Tool-room solutions and die sourcing';
      } else if (selectedService.toLowerCase().includes('manpower')) {
        matchedService = 'Skilled and contract manpower';
      }
      setFormData((prev) => ({ ...prev, serviceCategory: matchedService }));
    }
  }, [selectedService]);

  useEffect(() => {
    if (estimatedRequirement) {
      setFormData((prev) => ({
        ...prev,
        pressCapacity: estimatedRequirement,
      }));
      setShowAdvancedSpecs(true);
    }
  }, [estimatedRequirement]);

  const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        return value.trim().length >= 2 ? '' : 'Please enter your full name (minimum 2 characters).';
      case 'companyName':
        return value.trim().length >= 2 ? '' : 'Please enter your company or business name.';
      case 'phoneNumber':
        return phoneRegex.test(value.trim())
          ? ''
          : 'Please enter a valid mobile/WhatsApp number with country code (e.g. +91 98765 43210).';
      case 'emailAddress':
        return emailRegex.test(value.trim()) ? '' : 'Please enter a valid business email address.';
      case 'cityState':
        return value.trim().length >= 2 ? '' : 'Please provide your city and state.';
      case 'country':
        return value.trim().length >= 2 ? '' : 'Please enter your country.';
      case 'serviceCategory':
        return value.trim() ? '' : 'Please select a required service category.';
      case 'message':
        return value.trim().length >= 10
          ? ''
          : 'Please provide details about your requirement or project scope (minimum 10 characters).';
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
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setAttachedFile({ name: file.name, sizeMB });
      onNotify('Document Attached', `${file.name} (${sizeMB} MB) attached to enquiry.`);
    } else {
      setAttachedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check honeypot (silent drop for bots)
    if (formData.honeypot) {
      console.warn('Bot detected via honeypot; aborting.');
      return;
    }

    const requiredFields = [
      'fullName',
      'companyName',
      'phoneNumber',
      'emailAddress',
      'cityState',
      'country',
      'serviceCategory',
      'message',
    ];

    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      const val = formData[field as keyof typeof formData] || '';
      const err = validateField(field, String(val));
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onNotify('Form Incomplete', 'Please review highlighted required fields.', false);
      const firstErrorField = Object.keys(newErrors)[0];
      const el = document.getElementById(firstErrorField);
      if (el) el.focus();
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await enquiryService.submitEnquiry({
        fullName: formData.fullName,
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress,
        cityState: formData.cityState,
        country: formData.country,
        serviceCategory: formData.serviceCategory,
        message: formData.message,
        plantLocation: formData.plantLocation || undefined,
        machineryRequired: formData.machineryRequired || undefined,
        pressCapacity: formData.pressCapacity || undefined,
        technicalSpecs: formData.technicalSpecs || undefined,
        approxBudget: formData.approxBudget || undefined,
        projectStage: formData.projectStage || undefined,
        timelineUrgency: formData.timelineUrgency || undefined,
        preferredContact: formData.preferredContact || 'WhatsApp',
        additionalNotes: formData.additionalNotes || undefined,
        attachmentName: attachedFile?.name,
        attachmentSizeMB: attachedFile?.sizeMB,
        honeypot: formData.honeypot,
        submittedAtClient: new Date().toISOString(),
      });

      if (response.success && response.referenceId) {
        setSubmissionResult({
          referenceId: response.referenceId,
          companyName: formData.companyName,
          fullName: formData.fullName,
          serviceCategory: formData.serviceCategory,
          emailStatus: response.emailStatus || 'pending',
          message: response.message,
        });
        setServerError(null);

        onNotify(
          'Enquiry Registered',
          `Reference ID ${response.referenceId} generated. Notification dispatched to engineering.`,
          true
        );

        // Reset inputs only after confirmed server success
        setFormData({
          fullName: '',
          companyName: '',
          phoneNumber: '',
          emailAddress: '',
          cityState: '',
          country: 'India',
          serviceCategory: 'Aluminium extrusion press solutions',
          plantLocation: '',
          machineryRequired: '',
          pressCapacity: '',
          technicalSpecs: '',
          approxBudget: '',
          projectStage: 'New Greenfield Plant',
          timelineUrgency: '1 to 3 Months',
          preferredContact: 'WhatsApp',
          message: '',
          additionalNotes: '',
          honeypot: '',
        });
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setErrors({});
        setShowAdvancedSpecs(false);
      } else {
        const errMsg = response.message || 'Server was unable to record enquiry. Please retry.';
        setServerError(errMsg);
        onNotify('Submission Issue', errMsg, false);
      }
    } catch (err: unknown) {
      console.error('Submission failed:', err);
      const errMsg =
        err instanceof Error ? err.message : 'An unexpected error occurred. Your inputs have been preserved.';
      setServerError(errMsg);
      onNotify('Submission Error', errMsg, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = (refId: string) => {
    navigator.clipboard?.writeText(refId);
    onNotify('Copied to Clipboard', `Enquiry Reference: ${refId}`, true);
  };

  return (
    <section
      className="consultation-section"
      id="consultation"
      style={{ backgroundImage: `url('${getAssetUrl('assets/images/factory-dark-bg.jpg')}')` }}
    >
      <div className="consultation-overlay"></div>
      <div className="container consultation-container">
        <div className="consultation-grid">
          {/* Left Column: Direct B2B Contact & Value Proposition */}
          <div className="consultation-info-col">
            <span className="section-tag light-tag">B2B INDUSTRIAL ENQUIRY</span>
            <h2 className="consultation-heading">Speak with Our Aluminium Extrusion Specialists</h2>
            <p className="consultation-lead">
              Whether you are evaluating a greenfield plant investment, troubleshooting an active extrusion line, sourcing precision dies, or hiring skilled machine operators, our technical engineering team is ready to assist.
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
                  <strong>Direct Engineering Inbox:</strong>
                  <p>
                    <a href="mailto:info@vsslutechsolutions.in">info@vsslutechsolutions.in</a>
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
                  <strong>WhatsApp &amp; Direct Hotline:</strong>
                  <p>
                    <a href="tel:+919800000000">+91 [Hotline Placeholder]</a>
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
                  <strong>Pan-India Operational Footprint:</strong>
                  <p>Maharashtra, Gujarat, Karnataka, Tamil Nadu &amp; North India Hubs</p>
                </div>
              </div>
            </div>

            <div className="confidentiality-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Commercial NDA Assurance: All plant designs, die drawings, alloy requirements, and equipment queries are handled with strict non-disclosure protocol.</span>
            </div>
          </div>

          {/* Right Column: Upgraded Customer Enquiry Form */}
          <div className="consultation-form-col">
            <div className="white-form-card">
              <div className="form-card-header">
                <div>
                  <h3 className="form-card-title">Commercial &amp; Technical Enquiry</h3>
                  <p className="form-card-subtitle">
                    Submit your requirement below. Every enquiry receives an official tracking reference and prompt technical follow-up.
                  </p>
                </div>
                <span className="badge-b2b">B2B DIRECT</span>
              </div>

              {/* Success Result View */}
              {submissionResult ? (
                <div className="enquiry-success-panel" role="region" aria-label="Enquiry Success Details">
                  <div className="success-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="success-check-svg">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h4>Enquiry Successfully Registered</h4>
                  <p className="success-tagline">
                    Thank you, <strong>{submissionResult.fullName}</strong> ({submissionResult.companyName}). Your enquiry has been securely logged into our system.
                  </p>

                  <div className="ref-highlight-card">
                    <div className="ref-label">Official Tracking Reference ID</div>
                    <div className="ref-value-row">
                      <span className="ref-code">{submissionResult.referenceId}</span>
                      <button
                        type="button"
                        className="btn-copy-ref"
                        onClick={() => handleCopyRef(submissionResult.referenceId)}
                        title="Copy Reference ID"
                      >
                        Copy Ref
                      </button>
                    </div>
                    <div className="ref-meta">
                      <span>Service: <strong>{submissionResult.serviceCategory}</strong></span>
                      <span className="meta-sep">&bull;</span>
                      <span>
                        Notification Status:{' '}
                        <span className={`status-pill pill-${submissionResult.emailStatus}`}>
                          {submissionResult.emailStatus === 'sent' ? 'Delivered to Engineering' : 'Notification Queued'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <p className="response-sla-notice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sla-icon">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Our aluminium extrusion technical team typically reviews specifications and responds within <strong>2 to 4 business hours</strong>.
                  </p>

                  <div className="success-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSubmissionResult(null)}
                    >
                      Submit Another Requirement
                    </button>
                    <a
                      href={`https://wa.me/919800000000?text=${encodeURIComponent(
                        `Hello VSS Alutech, I just submitted enquiry ${submissionResult.referenceId} for ${submissionResult.companyName}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp-direct"
                    >
                      WhatsApp Follow-Up
                    </a>
                  </div>
                </div>
              ) : (
                <form id="consultationForm" className="site-form b2b-enquiry-form" onSubmit={handleSubmit} noValidate>
                  {/* Honeypot field for bot protection (visually hidden) */}
                  <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                    <label htmlFor="website_hp">Leave this empty</label>
                    <input
                      type="text"
                      id="website_hp"
                      name="honeypot"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Section 1: Customer & Company Details (Required) */}
                  <div className="form-section-label">
                    <span>1. Customer &amp; Business Profile</span>
                    <small>* Required</small>
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label htmlFor="fullName">Customer Full Name *</label>
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
                      <label htmlFor="companyName">Company / Business Name *</label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={errors.companyName ? 'is-invalid' : ''}
                        placeholder="e.g. Apex Extrusions Pvt Ltd"
                        required
                      />
                      {errors.companyName && <div className="field-error visible">{errors.companyName}</div>}
                    </div>
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label htmlFor="phoneNumber">Mobile / WhatsApp Number *</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={errors.phoneNumber ? 'is-invalid' : ''}
                        placeholder="+91 98201 44552"
                        required
                      />
                      {errors.phoneNumber && <div className="field-error visible">{errors.phoneNumber}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="emailAddress">Corporate Email Address *</label>
                      <input
                        type="email"
                        id="emailAddress"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        className={errors.emailAddress ? 'is-invalid' : ''}
                        placeholder="r.sharma@apexextrusions.in"
                        required
                      />
                      {errors.emailAddress && <div className="field-error visible">{errors.emailAddress}</div>}
                    </div>
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label htmlFor="cityState">City &amp; State *</label>
                      <input
                        type="text"
                        id="cityState"
                        name="cityState"
                        value={formData.cityState}
                        onChange={handleChange}
                        className={errors.cityState ? 'is-invalid' : ''}
                        placeholder="e.g. Pune, Maharashtra"
                        required
                      />
                      {errors.cityState && <div className="field-error visible">{errors.cityState}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="country">Country *</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={errors.country ? 'is-invalid' : ''}
                        placeholder="India"
                        required
                      />
                      {errors.country && <div className="field-error visible">{errors.country}</div>}
                    </div>
                  </div>

                  {/* Section 2: Required Service Category */}
                  <div className="form-section-label" style={{ marginTop: '16px' }}>
                    <span>2. Required Service Category</span>
                    <small>* Required</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="serviceCategory">Select Service Category *</label>
                    <select
                      id="serviceCategory"
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      className={errors.serviceCategory ? 'is-invalid' : ''}
                      required
                    >
                      <option value="Aluminium extrusion press solutions">
                        Aluminium extrusion press solutions
                      </option>
                      <option value="Furnace selection, setup and execution">
                        Furnace selection, setup and execution
                      </option>
                      <option value="Plant troubleshooting and technical consultancy">
                        Plant troubleshooting and technical consultancy
                      </option>
                      <option value="Tool-room solutions and die sourcing">
                        Tool-room solutions and die sourcing
                      </option>
                      <option value="Skilled and contract manpower">
                        Skilled and contract manpower
                      </option>
                      <option value="Other aluminium extrusion requirements">
                        Other aluminium extrusion requirements
                      </option>
                    </select>
                    {errors.serviceCategory && <div className="field-error visible">{errors.serviceCategory}</div>}
                  </div>

                  {/* Progressive Disclosure Toggle for Advanced Machinery & Plant Specifications */}
                  <div className="specs-accordion-control">
                    <button
                      type="button"
                      className="btn-toggle-specs"
                      onClick={() => setShowAdvancedSpecs((prev) => !prev)}
                      aria-expanded={showAdvancedSpecs}
                    >
                      <span className="specs-toggle-text">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="specs-toggle-icon"
                        >
                          <polygon points="12 2 2 7 12 12 22 7 12 2"><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></polygon>
                        </svg>
                        {showAdvancedSpecs
                          ? 'Hide Technical & Equipment Parameters (Optional)'
                          : '+ Add Machinery Sizing, Plant Location & Budget Parameters (Optional)'}
                      </span>
                      <span className="specs-toggle-chevron">{showAdvancedSpecs ? '▲' : '▼'}</span>
                    </button>
                    <p className="specs-help-text">
                      Add details if known. You can leave these blank if you prefer our engineers to calculate them.
                    </p>
                  </div>

                  {/* Section 3: Optional Technical & Equipment Parameters */}
                  {showAdvancedSpecs && (
                    <div className="advanced-specs-box">
                      <div className="form-row-two">
                        <div className="form-group">
                          <label htmlFor="plantLocation">Plant / Site Location (If different from address)</label>
                          <input
                            type="text"
                            id="plantLocation"
                            name="plantLocation"
                            value={formData.plantLocation}
                            onChange={handleChange}
                            placeholder="e.g. Chakan MIDC / Sanand GIDC"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="machineryRequired">Machinery or Equipment Required</label>
                          <input
                            type="text"
                            id="machineryRequired"
                            name="machineryRequired"
                            value={formData.machineryRequired}
                            onChange={handleChange}
                            placeholder="e.g. 1450 UST Press, Billet Heater, Ageing Oven"
                          />
                        </div>
                      </div>

                      <div className="form-row-two">
                        <div className="form-group">
                          <label htmlFor="pressCapacity">Press Capacity / Billet Tonnage</label>
                          <input
                            type="text"
                            id="pressCapacity"
                            name="pressCapacity"
                            value={formData.pressCapacity}
                            onChange={handleChange}
                            placeholder="e.g. 1100 UST / 5-inch billet / 250 MT monthly"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="projectStage">Project Stage</label>
                          <select
                            id="projectStage"
                            name="projectStage"
                            value={formData.projectStage}
                            onChange={handleChange}
                          >
                            <option value="New Greenfield Plant">New Greenfield Plant</option>
                            <option value="Plant Expansion / Line Addition">Plant Expansion / Line Addition</option>
                            <option value="Machinery Replacement / Modernization">Machinery Replacement / Modernization</option>
                            <option value="Troubleshooting & Optimization">Troubleshooting &amp; Optimization</option>
                            <option value="Die / Tooling Sourcing">Die / Tooling Sourcing</option>
                            <option value="Skilled Manpower Requirement">Skilled Manpower Requirement</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row-two">
                        <div className="form-group">
                          <label htmlFor="approxBudget">Approximate Budget (Optional)</label>
                          <input
                            type="text"
                            id="approxBudget"
                            name="approxBudget"
                            value={formData.approxBudget}
                            onChange={handleChange}
                            placeholder="e.g. ₹1.5 - ₹2.5 Cr / Open for feasibility study"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="timelineUrgency">Required Timeline / Urgency</label>
                          <select
                            id="timelineUrgency"
                            name="timelineUrgency"
                            value={formData.timelineUrgency}
                            onChange={handleChange}
                          >
                            <option value="Immediate (Within 1-2 weeks)">Immediate (Within 1-2 weeks)</option>
                            <option value="1 Month">1 Month</option>
                            <option value="1 to 3 Months">1 to 3 Months</option>
                            <option value="3 to 6 Months">3 to 6 Months</option>
                            <option value="Budgetary / Exploratory Planning">Budgetary / Exploratory Planning</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row-two">
                        <div className="form-group">
                          <label htmlFor="preferredContact">Preferred Contact Method</label>
                          <select
                            id="preferredContact"
                            name="preferredContact"
                            value={formData.preferredContact}
                            onChange={handleChange}
                          >
                            <option value="WhatsApp">WhatsApp Message / Document</option>
                            <option value="Phone Call">Direct Phone Call</option>
                            <option value="Email">Formal Email Communication</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="technicalSpecs">Quantity &amp; Technical Specifications</label>
                          <input
                            type="text"
                            id="technicalSpecs"
                            name="technicalSpecs"
                            value={formData.technicalSpecs}
                            onChange={handleChange}
                            placeholder="e.g. 6063 alloy, 150 mm container, multi-hole dies"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="additionalNotes">Additional Notes / Internal Logistics</label>
                        <input
                          type="text"
                          id="additionalNotes"
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleChange}
                          placeholder="e.g. Plant visit possible on weekends / Prefer turnkey installation"
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 4: Detailed Requirement & Attachments */}
                  <div className="form-section-label" style={{ marginTop: '16px' }}>
                    <span>3. Detailed Requirement &amp; Scope</span>
                    <small>* Required</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Detailed Requirement / Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? 'is-invalid' : ''}
                      placeholder="Please describe your aluminium extrusion requirements, plant objectives, current bottlenecks, or equipment specifications in detail..."
                      required
                    ></textarea>
                    {errors.message && <div className="field-error visible">{errors.message}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="drawingAttachment">
                      Attach Profile Drawings / Layout / Equipment Specs (Optional)
                    </label>
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
                            : 'Upload Drawings or Specs (.pdf, .dwg, .dxf, .step, .jpg)'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {serverError && (
                    <div className="server-error-banner" role="alert">
                      <div className="server-error-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <div className="server-error-content">
                        <strong>Submission Issue:</strong>
                        <p>{serverError}</p>
                        <small>Your entered details are preserved below. Please review and try again.</small>
                      </div>
                      <button
                        type="button"
                        className="server-error-dismiss"
                        onClick={() => setServerError(null)}
                        aria-label="Dismiss error"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                    id="submitConsultationBtn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-circle"></span>
                        <span>Processing &amp; Registering Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Business Enquiry</span>
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </>
                    )}
                  </button>

                  <div className="form-footer-guarantee">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="guarantee-icon">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>Instant Reference ID generated &bull; Secure encrypted transmission &bull; No marketing spam</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
