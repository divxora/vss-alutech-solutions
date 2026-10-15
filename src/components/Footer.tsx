import React from 'react';

interface FooterProps {
  onOpenBrochure: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBrochure,
  onOpenPrivacy,
  onOpenTerms,
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
              Technical machinery consultancy, thermal systems advisory, independent tool room die coordination, production troubleshooting, and industrial staffing.
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
              <li><a href="#plant-troubleshooting">3. Plant Troubleshooting</a></li>
              <li><a href="#toolroom-dies">4. Tool Room &amp; Die Solutions</a></li>
              <li><a href="#manpower-supplier">5. Manpower Supplier</a></li>
              <li><a href="#alloy-grades">6. Supported Alloy Grades</a></li>
              <li><a href="#process">Plant Execution Roadmap</a></li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#hero">Home</a></li>
              <li><a href="#service-overview">Services Overview</a></li>
              <li><a href="#alloy-grades">Alloy Grades We Support</a></li>
              <li><a href="#industries">Industries Served</a></li>
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
              <a href="mailto:info@vsslutechsolutions.in">info@vsslutechsolutions.in</a>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href="tel:+910000000000">+91 [Phone Placeholder]</a>
            </div>

            <div className="footer-whatsapp-wrap">
              <a
                href="#consultation"
                className="btn btn-whatsapp"
                id="footerWhatsappBtn"
                title="Connect on WhatsApp (Placeholder)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.126-.532-1.745-.724-2.883-2.502-2.97-2.617-.087-.116-.708-.941-.708-1.792s.448-1.271.607-1.445c.16-.175.348-.219.463-.219.116 0 .232.001.333.006.107.005.25.04.391.377.145.348.493 1.203.536 1.29.043.087.072.189.014.305-.058.115-.087.188-.174.29-.087.102-.183.228-.261.306-.087.087-.179.182-.077.357.101.174.45 1.018 1.054 1.554.778.691 1.433.906 1.636 1.008.203.101.319.087.435-.044.116-.13.493-.58.623-.782.13-.203.261-.174.435-.102.174.072 1.102.52 1.29.614.189.094.316.14.362.217.046.077.046.448-.098.853z" />
                </svg>
                <span>WhatsApp Chat</span>
                <span className="placeholder-tag">[Placeholder]</span>
              </a>
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
          </div>
        </div>
      </div>
    </footer>
  );
};
