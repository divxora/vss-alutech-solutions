import React, { useState, useEffect } from 'react';
import { PageRoute } from '../types/navigation';
import { VSS_DISPLAY_PHONE_1, VSS_BUSINESS_EMAIL } from '../utils/whatsapp';

interface HeaderProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute, targetSection?: string) => void;
  onOpenBrochure: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenBrochure,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 30);

      if (currentScrollY > 100 && currentScrollY > lastScrollY + 8) {
        setScrollHidden(true);
      } else if (currentScrollY < lastScrollY - 8 || currentScrollY <= 100) {
        setScrollHidden(false);
      }

      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
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

  const handleNavClick = (page: PageRoute, targetSection?: string) => {
    closeDrawer();
    onNavigate(page, targetSection);
  };

  return (
    <>
      <header
        className={`site-header ${isScrolled ? 'scrolled' : ''} ${scrollHidden ? 'scroll-hidden' : ''}`}
        id="siteHeader"
      >
        {/* Main Minimalist Editorial Navigation - Zero black notch bar, pure warm stone canvas */}
        <nav className="main-nav" aria-label="Main Navigation">
          <div className="container nav-container">
            {/* Brand Wordmark matching reference aesthetic: |'| VSS ALUTECH. */}
            <button
              type="button"
              className="brand-logo"
              onClick={() => handleNavClick('home')}
              aria-label="VSS Alutech Solutions Homepage"
            >
              <span className="brand-graphic-tick" aria-hidden="true">|'|</span>
              <div className="brand-text">
                <span className="brand-title">VSS ALUTECH.</span>
              </div>
            </button>

            {/* Centered Spaced Nav Links in Tracked Minimalist Uppercase */}
            <ul className="nav-links" id="navLinks">
              <li>
                <button
                  type="button"
                  className={`nav-link-btn ${currentPage === 'home' ? 'active' : ''}`}
                  onClick={() => handleNavClick('home')}
                >
                  HOME
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-link-btn ${currentPage === 'about' ? 'active' : ''}`}
                  onClick={() => handleNavClick('about')}
                >
                  ABOUT
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-link-btn ${currentPage === 'solutions' ? 'active' : ''}`}
                  onClick={() => handleNavClick('solutions')}
                >
                  SOLUTIONS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-link-btn ${currentPage === 'sectors' ? 'active' : ''}`}
                  onClick={() => handleNavClick('sectors')}
                >
                  SECTORS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-link-btn ${currentPage === 'contact' ? 'active' : ''}`}
                  onClick={() => handleNavClick('contact')}
                >
                  CONTACT
                </button>
              </li>
            </ul>

            {/* Right Action: Brochure, Portal, and Pill-Outlined CONTACT Button */}
            <div className="nav-actions">
              <button
                type="button"
                className="nav-link-btn hidden-mobile"
                onClick={onOpenBrochure}
                style={{ fontSize: '0.68rem', letterSpacing: '0.14em' }}
              >
                BROCHURE
              </button>
              <button
                type="button"
                className="nav-link-btn hidden-mobile"
                onClick={onOpenAdmin}
                title="Executive B2B Admin Portal"
                style={{ fontSize: '0.68rem', letterSpacing: '0.14em', opacity: 0.8 }}
              >
                PORTAL
              </button>

              <button
                type="button"
                className="btn-contact-pill"
                id="headerContactBtn"
                onClick={() => handleNavClick('contact')}
              >
                <span>GET A QUOTE</span>
              </button>

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
            <span className="brand-graphic-tick">|'|</span>
            <span className="brand-title">VSS ALUTECH.</span>
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
          <li>
            <button
              type="button"
              className={`mobile-nav-link text-left w-full ${currentPage === 'home' ? 'text-orange font-bold' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              01. HOME &bull; OVERVIEW
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`mobile-nav-link text-left w-full ${currentPage === 'about' ? 'text-orange font-bold' : ''}`}
              onClick={() => handleNavClick('about')}
            >
              02. ABOUT VSS ALUTECH
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`mobile-nav-link text-left w-full ${currentPage === 'solutions' ? 'text-orange font-bold' : ''}`}
              onClick={() => handleNavClick('solutions')}
            >
              03. PLANT SOLUTIONS &amp; MACHINERY
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`mobile-nav-link text-left w-full ${currentPage === 'sectors' ? 'text-orange font-bold' : ''}`}
              onClick={() => handleNavClick('sectors')}
            >
              04. INDUSTRIES &amp; SECTORS
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`mobile-nav-link text-left w-full ${currentPage === 'contact' ? 'text-orange font-bold' : ''}`}
              onClick={() => handleNavClick('contact')}
            >
              05. CONTACT &amp; CONSULTATION
            </button>
          </li>
          <li>
            <button
              type="button"
              className="mobile-nav-link text-left w-full"
              onClick={() => {
                closeDrawer();
                onOpenBrochure();
              }}
            >
              06. DOWNLOAD BROCHURE (PDF)
            </button>
          </li>
          <li>
            <button
              type="button"
              className="mobile-nav-link text-left w-full admin-nav-btn"
              onClick={() => {
                closeDrawer();
                onOpenAdmin?.();
              }}
            >
              07. EXECUTIVE PORTAL &bull; ADMIN LOGIN
            </button>
          </li>
        </ul>
        <div className="mobile-drawer-footer">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => handleNavClick('contact')}
          >
            REQUEST A QUOTE
          </button>
          <div className="mobile-contact-info">
            <p><strong>Email:</strong> <a href={`mailto:${VSS_BUSINESS_EMAIL}`}>{VSS_BUSINESS_EMAIL}</a></p>
            <p><strong>Phone:</strong> <a href={`tel:${VSS_DISPLAY_PHONE_1.replace(/\s+/g, '')}`}>{VSS_DISPLAY_PHONE_1}</a></p>
            <p><strong>Office:</strong> Tamkuhiraj, Kushinagar, UP - 274407</p>
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
