import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenBrochure: () => void;
  activeSection: string;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBrochure, activeSection, onOpenAdmin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} id="siteHeader">
        <div className="top-utility-bar">
          <div className="container utility-container">
            <div className="utility-left">
              <div className="utility-item">
                <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a href="mailto:info@vsslutechsolutions.in" title="Email VSS Alutech Solutions">info@vsslutechsolutions.in</a>
                <span className="placeholder-tag">[Email Placeholder]</span>
              </div>
              <div className="utility-item">
                <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a href="tel:+910000000000" title="Call Us">+91 [Phone Placeholder]</a>
              </div>
            </div>
            <div className="utility-right">
              <div className="utility-item location-badge">
                <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>India | Industrial Solutions</span>
              </div>
              <button
                type="button"
                className="utility-btn"
                id="openBrochureBtn"
                onClick={onOpenBrochure}
                aria-label="Download Solutions Brochure"
              >
                <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span>Brochure</span>
              </button>
              <button
                type="button"
                className="utility-btn"
                onClick={onOpenAdmin}
                title="Executive B2B Admin Portal"
                style={{ cursor: 'pointer' }}
              >
                <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Admin</span>
              </button>
              <a href="#consultation" className="utility-link">Contact</a>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="main-nav" aria-label="Main Navigation">
          <div className="container nav-container">
            <a href="#hero" className="brand-logo" aria-label="VSS Alutech Solutions Homepage">
              <div className="logo-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" className="logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" stroke="#0A192F" strokeWidth="3" fill="#F0F4F8" />
                  <polygon points="24,10 37,17.5 37,30.5 24,38 11,30.5 11,17.5" stroke="#FF6B00" strokeWidth="2.5" fill="#FFFFFF" />
                  <circle cx="24" cy="24" r="6" stroke="#0A192F" strokeWidth="2.5" fill="#0A192F" />
                  <line x1="24" y1="10" x2="24" y2="18" stroke="#FF6B00" strokeWidth="2" />
                  <line x1="24" y1="30" x2="24" y2="38" stroke="#FF6B00" strokeWidth="2" />
                  <line x1="11" y1="24" x2="18" y2="24" stroke="#FF6B00" strokeWidth="2" />
                  <line x1="30" y1="24" x2="37" y2="24" stroke="#FF6B00" strokeWidth="2" />
                </svg>
              </div>
              <div className="brand-text">
                <span className="brand-title">VSS ALUTECH <span className="brand-accent">SOLUTIONS</span></span>
                <span className="brand-subtitle">Aluminium Extrusion Plant Solutions</span>
              </div>
            </a>

            <ul className="nav-links" id="navLinks">
              <li>
                <a
                  href="#press-solutions"
                  className={`nav-link ${activeSection === 'press-solutions' ? 'active' : ''}`}
                >
                  Press Solutions
                </a>
              </li>
              <li>
                <a
                  href="#furnace-solutions"
                  className={`nav-link ${activeSection === 'furnace-solutions' ? 'active' : ''}`}
                >
                  Furnace Solutions
                </a>
              </li>
              <li>
                <a
                  href="#plant-troubleshooting"
                  className={`nav-link ${activeSection === 'plant-troubleshooting' ? 'active' : ''}`}
                >
                  Plant Troubleshooting
                </a>
              </li>
              <li>
                <a
                  href="#toolroom-dies"
                  className={`nav-link ${activeSection === 'toolroom-dies' ? 'active' : ''}`}
                >
                  Tool Room &amp; Die Solutions
                </a>
              </li>
              <li>
                <a
                  href="#manpower-supplier"
                  className={`nav-link ${activeSection === 'manpower-supplier' ? 'active' : ''}`}
                >
                  Manpower Supplier
                </a>
              </li>
              <li>
                <a
                  href="#alloy-grades"
                  className={`nav-link ${activeSection === 'alloy-grades' ? 'active' : ''}`}
                >
                  Alloy Grades
                </a>
              </li>
            </ul>

            <div className="nav-actions">
              <a href="#consultation" className="btn btn-quote" id="headerQuoteBtn">
                <span>Get a Quote</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>

              <button
                type="button"
                className="hamburger-btn"
                id="hamburgerBtn"
                onClick={() => setDrawerOpen(true)}
                aria-label="Toggle Navigation Menu"
                aria-expanded={drawerOpen}
                aria-controls="mobileDrawer"
              >
                <span className="hamburger-bar"></span>
                <span className="hamburger-bar"></span>
                <span className="hamburger-bar"></span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} id="mobileDrawer" aria-hidden={!drawerOpen}>
        <div className="mobile-drawer-header">
          <div className="drawer-brand">
            <span className="brand-title">VSS ALUTECH</span>
            <span className="brand-sub">Plant Solutions</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            id="drawerCloseBtn"
            onClick={closeDrawer}
            aria-label="Close Navigation Menu"
          >
            &times;
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li><a href="#press-solutions" className="mobile-nav-link" onClick={closeDrawer}>1. Press Solutions</a></li>
          <li><a href="#furnace-solutions" className="mobile-nav-link" onClick={closeDrawer}>2. Furnace Solutions</a></li>
          <li><a href="#plant-troubleshooting" className="mobile-nav-link" onClick={closeDrawer}>3. Plant Troubleshooting</a></li>
          <li><a href="#toolroom-dies" className="mobile-nav-link" onClick={closeDrawer}>4. Tool Room &amp; Die Solutions</a></li>
          <li><a href="#manpower-supplier" className="mobile-nav-link" onClick={closeDrawer}>5. Manpower Supplier</a></li>
          <li><a href="#alloy-grades" className="mobile-nav-link" onClick={closeDrawer}>Aluminium Alloy Grades</a></li>
          <li><a href="#process" className="mobile-nav-link" onClick={closeDrawer}>Complete Plant Process</a></li>
          <li><a href="#industries" className="mobile-nav-link" onClick={closeDrawer}>Industries Served</a></li>
          <li><a href="#consultation" className="mobile-nav-link" onClick={closeDrawer}>Consultation Form</a></li>
          <li>
            <button
              type="button"
              className="mobile-nav-link"
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--color-orange)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={() => {
                closeDrawer();
                onOpenAdmin?.();
              }}
            >
              <span>🔒 Executive Admin Portal</span>
            </button>
          </li>
        </ul>
        <div className="mobile-drawer-footer">
          <a href="#consultation" className="btn btn-primary btn-block" onClick={closeDrawer}>Get a Quote</a>
          <div className="mobile-contact-info">
            <p><strong>Email:</strong> info@vsslutechsolutions.in</p>
            <p><strong>Phone:</strong> +91 [Phone Placeholder]</p>
            <p className="placeholder-note">*Placeholder contact details</p>
          </div>
        </div>
      </div>
      <div
        className={`mobile-backdrop ${drawerOpen ? 'open' : ''}`}
        id="mobileBackdrop"
        onClick={closeDrawer}
      ></div>
    </>
  );
};
