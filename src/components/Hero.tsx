import React from 'react';
import { getAssetUrl } from '../utils/asset';

interface HeroProps {
  onOpenConsultation?: (serviceCategory?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenConsultation }) => {
  const handleScrollTo = (targetId: string, serviceCategory?: string) => {
    if (serviceCategory && onOpenConsultation) {
      onOpenConsultation(serviceCategory);
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-editorial-section" id="hero">
      <div className="container hero-editorial-container">
        {/* Main Asymmetric Grid matching reference design */}
        <div className="hero-editorial-grid">
          {/* Left Column: Image on top, text & CTAs beneath */}
          <div className="hero-col-left">
            <div className="hero-image-frame-wrapper">
              <div className="hero-image-frame">
                <img
                  src={getAssetUrl('assets/images/hero-extrusion-press.jpg')}
                  alt="Aluminium Extrusion Press Facility"
                  className="hero-image-primary"
                  loading="eager"
                />
              </div>
              <div className="hero-frame-offset-box" aria-hidden="true"></div>
            </div>

            <div className="hero-left-text-block">
              <span className="hero-kicker">PRECISION &amp; PLANT RECOVERY</span>
              <p className="hero-narrative">
                We elevate aluminium extrusion manufacturing through turnkey machinery sourcing, furnace engineering, precision die networks, and hands-on operational troubleshooting across India.
              </p>

              {/* Action Buttons */}
              <div className="hero-editorial-actions">
                <a
                  href="#consultation"
                  className="btn-architectural-dark"
                  id="heroTalkExpertsBtn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('consultation', 'Aluminium extrusion press solutions');
                  }}
                >
                  <span>Talk to Our Experts</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <a
                  href="#consultation"
                  className="btn-architectural-outline"
                  id="heroRequestConsultBtn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('consultation');
                  }}
                >
                  <span>Request Consultation</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="hero-editorial-trust">
                <span className="trust-pill">&bull; Turnkey Plant Setup</span>
                <span className="trust-pill">&bull; Die Recovery Network</span>
                <span className="trust-pill">&bull; Skilled Technical Crews</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Serif Title on top, Portrait Image beneath */}
          <div className="hero-col-right">
            <div className="hero-title-group">
              <h1 className="hero-grand-title">
                <span className="title-row">VSS</span>
                <span className="title-row">ALUTECH.</span>
              </h1>
              <div className="hero-origin-meta">
                <span>TAMKUHIRAJ, INDIA &mdash; EST. OPERATIONS</span>
              </div>
            </div>

            <div className="hero-portrait-wrapper">
              {/* Delicate Geometric Wireframe Accent from reference */}
              <div className="hero-wireframe-circle" aria-hidden="true">
                <svg viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
                </svg>
              </div>

              <div className="hero-portrait-frame">
                <img
                  src={getAssetUrl('assets/images/plant-troubleshooting.jpg')}
                  alt="Extrusion Operations & Technical Engineering"
                  className="hero-image-secondary"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5 Architectural Service Links */}
        <div className="hero-services-bar">
          <a
            href="#press-solutions"
            className="hero-service-tag"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo('press-solutions');
            }}
          >
            <span className="tag-index">01</span>
            <span className="tag-name">PRESS &amp; MACHINERY</span>
          </a>
          <a
            href="#furnace-solutions"
            className="hero-service-tag"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo('furnace-solutions');
            }}
          >
            <span className="tag-index">02</span>
            <span className="tag-name">FURNACE SOLUTIONS</span>
          </a>
          <a
            href="#plant-troubleshooting"
            className="hero-service-tag"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo('plant-troubleshooting');
            }}
          >
            <span className="tag-index">03</span>
            <span className="tag-name">PLANT CONSULTANCY</span>
          </a>
          <a
            href="#toolroom-dies"
            className="hero-service-tag"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo('toolroom-dies');
            }}
          >
            <span className="tag-index">04</span>
            <span className="tag-name">TOOL ROOM &amp; DIES</span>
          </a>
          <a
            href="#manpower-supplier"
            className="hero-service-tag"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo('manpower-supplier');
            }}
          >
            <span className="tag-index">05</span>
            <span className="tag-name">MANPOWER SUPPLY</span>
          </a>
        </div>

        {/* Full-width Hairline Rule with SCROLL DOWN label matching reference */}
        <div className="hero-scroll-divider">
          <div className="hero-divider-line"></div>
          <a
            href="#service-overview"
            className="hero-scroll-label"
            aria-label="Scroll down to services"
            onClick={(e) => {
              e.preventDefault();
              handleScrollTo('service-overview');
            }}
          >
            <span>SCROLL DOWN</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="scroll-arrow">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};
