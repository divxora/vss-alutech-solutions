import React from 'react';

interface FooterProps {
  onOpenBrochure: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBrochure,
  onOpenPrivacy,
  onOpenTerms,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Col 1: Branding & Tagline */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <svg viewBox="0 0 48 48" className="footer-logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" stroke="#FFFFFF" strokeWidth="3" fill="#0A192F" />
                <polygon points="24,10 37,17.5 37,30.5 24,38 11,30.5 11,17.5" stroke="#FF6B00" strokeWidth="2" fill="none" />
                <circle cx="24" cy="24" r="5" fill="#FF6B00" />
              </svg>
              <div className="brand-text">
                <span className="brand-title text-white">VSS ALUTECH</span>
                <span className="brand-accent">SOLUTIONS</span>
              </div>
            </div>
            <p className="footer-tagline">
              "Your Partner for Complete Aluminium Extrusion Plant Solutions"
            </p>
            <p className="footer-desc">
              Technical machinery consultancy, thermal systems advisory, independent tool room die coordination, plant maintenance, and industrial staffing.
            </p>
            <div className="footer-social-placeholders">
              <span className="social-badge">Industrial B2B Solutions</span>
              <span className="social-badge">Pan-India Support</span>
            </div>
          </div>

          {/* Col 2: Five Core Service Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Our Solutions</h4>
            <ul className="footer-links">
              <li><a href="#press-solutions">1. Press Solutions</a></li>
              <li><a href="#furnace-solutions">2. Furnace Solutions</a></li>
              <li><a href="#plant-troubleshooting">3. Plant Maintenance</a></li>
              <li><a href="#toolroom-dies">4. Tool Room &amp; Die Solutions</a></li>
              <li><a href="#manpower-supplier">5. Manpower Supplier</a></li>
              <li><a href="#process">Plant Execution Roadmap</a></li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#hero">Home</a></li>
              <li><a href="#service-overview">Services Overview</a></li>
              <li><a href="#projects">Project Categories</a></li>
              <li><a href="#consultation">Request Consultation</a></li>
              <li>
                <button
                  type="button"
                  className="footer-text-btn"
                  id="footerBrochureBtn"
                  onClick={onOpenBrochure}
                >
                  Download Brochure
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Placeholders */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Contact Details</h4>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>[Office Address Placeholder], India</span>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:vssalutechsolutions@gmail.com">vssalutechsolutions@gmail.com</a>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <a href="tel:+919517098011">+91 9517098011</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Utility */}
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="copyright-text">
            &copy; <span id="currentYear">{currentYear}</span> <strong>VSS Alutech Solutions</strong>. All Rights Reserved.
          </p>
          <p className="intended-domain-note">
            Intended Domain: <code>vsslutechsolutions.in</code> (Demonstration &amp; Architecture Prototype)
          </p>
            <div className="footer-legal-links">
              <button type="button" className="legal-link-btn" id="openPrivacyModal" onClick={onOpenPrivacy}>
                Privacy Policy
              </button>
              <span className="legal-divider">|</span>
              <button type="button" className="legal-link-btn" id="openTermsModal" onClick={onOpenTerms}>
                Terms &amp; Conditions
              </button>
              <span className="legal-divider">|</span>
              <button
                type="button"
                className="legal-link-btn"
                style={{ color: 'var(--color-orange)', fontWeight: 700 }}
                onClick={onOpenAdmin}
                title="Restricted Executive Admin Portal"
              >
                🔒 Admin Portal
              </button>
            </div>
        </div>
      </div>
    </footer>
  );
};
