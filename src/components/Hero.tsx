import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section
      className="hero-section"
      id="hero"
      style={{ backgroundImage: `url('/assets/images/hero-extrusion-press.jpg')` }}
    >
      <div className="hero-overlay"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>B2B Industrial Engineering &amp; Operations Partner</span>
          </div>

          <h1 className="hero-headline">
            Complete Aluminium Extrusion <span className="highlight-orange">Plant Solutions</span>
          </h1>

          <p className="hero-subtext">
            From machinery selection and plant setup to technical troubleshooting, die sourcing and skilled manpower — your complete partner for aluminium extrusion operations.
          </p>

          {/* 5 Compact Service Highlights */}
          <div className="hero-highlights">
            <a href="#press-solutions" className="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Press &amp; Machinery</span>
            </a>
            <a href="#furnace-solutions" className="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c2 4 6 6 6 11a6 6 0 0 1-12 0c0-5 4-7 6-11z" />
                <path d="M12 11c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-3 3-5z" />
              </svg>
              <span>Furnace Solutions</span>
            </a>
            <a href="#plant-troubleshooting" className="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span>Plant Consultancy</span>
            </a>
            <a href="#toolroom-dies" className="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="3" x2="12" y2="9" />
                <line x1="12" y1="15" x2="12" y2="21" />
              </svg>
              <span>Tool Room &amp; Dies</span>
            </a>
            <a href="#manpower-supplier" className="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Manpower Supply</span>
            </a>
          </div>

          {/* Dual Call to Action Buttons */}
          <div className="hero-cta-group">
            <a href="#consultation" className="btn btn-primary btn-lg" id="heroTalkExpertsBtn">
              <span>Talk to Our Experts</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <a href="#consultation" className="btn btn-outline-light btn-lg" id="heroRequestConsultBtn">
              <span>Request a Consultation</span>
            </a>
          </div>

          {/* Trust Badges Bar */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-check">&#10003;</span>
              <span>Single-Source Plant Solutions</span>
            </div>
            <div className="trust-item">
              <span className="trust-check">&#10003;</span>
              <span>Independent Tool Room Network</span>
            </div>
            <div className="trust-item">
              <span className="trust-check">&#10003;</span>
              <span>Skilled Operational Manpower</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
