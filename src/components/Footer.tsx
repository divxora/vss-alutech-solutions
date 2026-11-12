import React from 'react';
import { PageRoute } from '../types/navigation';
import { VSS_DISPLAY_PHONE_1, VSS_BUSINESS_EMAIL } from '../utils/whatsapp';

interface FooterProps {
  onNavigate?: (page: PageRoute, targetSection?: string) => void;
  onOpenBrochure: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenBrochure,
  onOpenPrivacy,
  onOpenTerms,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();

  const handleNav = (page: PageRoute, targetSection?: string) => {
    if (onNavigate) {
      onNavigate(page, targetSection);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Col 1: Branding & Tagline */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="brand-graphic-tick" style={{ color: 'var(--color-orange, #C47A3A)', fontSize: '1.4rem' }}>|'|</span>
              <div className="brand-text">
                <span className="brand-title text-white" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}>VSS ALUTECH.</span>
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

          {/* Col 2: Solutions Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Plant Solutions</h4>
            <ul className="footer-links">
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('solutions', 'press-solutions')}>
                  1. Press Machinery Solutions
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('solutions', 'furnace-solutions')}>
                  2. Furnace Thermal Systems
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('solutions', 'plant-troubleshooting')}>
                  3. Plant Maintenance &amp; Audit
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('solutions', 'toolroom-dies')}>
                  4. Tool Room &amp; Die Network
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('solutions', 'manpower-supplier')}>
                  5. Skilled Manpower Supply
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Company &amp; Pages</h4>
            <ul className="footer-links">
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('home')}>
                  Home
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('about')}>
                  About VSS Alutech
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('solutions')}>
                  All Plant Solutions
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('sectors')}>
                  Industries We Serve
                </button>
              </li>
              <li>
                <button type="button" className="footer-nav-btn" onClick={() => handleNav('contact')}>
                  Contact &amp; Request Quote
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-nav-btn"
                  onClick={onOpenBrochure}
                  style={{ color: 'var(--color-orange)', fontWeight: 600 }}
                >
                  Download Brochure (PDF)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Placeholders */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Registered Office</h4>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Tamkuhiraj, Kushinagar, Uttar Pradesh - 274407</span>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href={`mailto:${VSS_BUSINESS_EMAIL}`}>{VSS_BUSINESS_EMAIL}</a>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <a href={`tel:${VSS_DISPLAY_PHONE_1.replace(/\s+/g, '')}`}>{VSS_DISPLAY_PHONE_1}</a>
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
