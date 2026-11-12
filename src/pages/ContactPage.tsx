import React from 'react';
import { ConsultationSection } from '../components/ConsultationSection';
import { FaqSection } from '../components/FaqSection';
import { VSS_DISPLAY_PHONE_1, VSS_BUSINESS_EMAIL } from '../utils/whatsapp';

interface ContactPageProps {
  selectedService: string;
  estimatedRequirement: string;
  onNotify: (title: string, message: string, isSuccess?: boolean) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  selectedService,
  estimatedRequirement,
  onNotify,
}) => {
  return (
    <div className="page-contact">
      {/* Page Header */}
      <section className="page-hero-header">
        <div className="container">
          <span className="section-tag">CONNECT &bull; FAST TECHNICAL RESPONSE</span>
          <h1 className="page-main-title">Contact &amp; Request a Consultation</h1>
          <p className="page-lead-narrative">
            Submit your plant setup inquiries, machinery requirements, furnace specifications, or die toolroom sourcing requests directly to our senior engineering team.
          </p>
        </div>
      </section>

      {/* Office & Direct Contact Channels Cards */}
      <section className="contact-info-strip">
        <div className="container">
          <div className="contact-cards-grid">
            <div className="contact-card">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="contact-card-title">Headquarters</h3>
              <p className="contact-card-text">
                Tamkuhiraj, Kushinagar<br />
                Uttar Pradesh &mdash; 274407, India
              </p>
              <span className="contact-card-sub">Pan-India On-Site Deployments</span>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className="contact-card-title">Direct Calling / WhatsApp</h3>
              <p className="contact-card-text">
                <a href={`tel:${VSS_DISPLAY_PHONE_1.replace(/\s+/g, '')}`} className="contact-link">
                  {VSS_DISPLAY_PHONE_1}
                </a>
              </p>
              <span className="contact-card-sub">Mon &ndash; Sat: 9:00 AM &ndash; 7:30 PM IST</span>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="contact-card-title">Official Email</h3>
              <p className="contact-card-text">
                <a href={`mailto:${VSS_BUSINESS_EMAIL}`} className="contact-link">
                  {VSS_BUSINESS_EMAIL}
                </a>
              </p>
              <span className="contact-card-sub">Technical specs &amp; RFQs welcome</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Consultation Form (with Dual Action Buttons & Helper Note) */}
      <section className="contact-form-wrapper" id="consultation">
        <ConsultationSection
          selectedService={selectedService}
          estimatedRequirement={estimatedRequirement}
          onNotify={onNotify}
        />
      </section>

      {/* Technical FAQ Section */}
      <FaqSection />
    </div>
  );
};
