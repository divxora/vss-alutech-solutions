import React from 'react';
import { PageRoute } from '../types/navigation';
import { getAssetUrl } from '../utils/asset';

interface AboutPageProps {
  onNavigate: (page: PageRoute, targetSection?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="page-about">
      {/* Page Header */}
      <section className="page-hero-header">
        <div className="container">
          <span className="section-tag">ENGINEERING CONSULTANCY &bull; EST. OPERATIONS</span>
          <h1 className="page-main-title">About VSS Alutech Solutions</h1>
          <p className="page-lead-narrative">
            We are a premier aluminium extrusion engineering consultancy and operational partner, delivering turnkey machinery sourcing, furnace thermal optimization, die toolroom networks, and skilled industrial manpower across India.
          </p>
        </div>
      </section>

      {/* Main Story & Values Grid */}
      <section className="about-content-section">
        <div className="container">
          <div className="about-story-grid">
            {/* Left Story Column */}
            <div className="about-text-column">
              <span className="about-kicker">WHO WE ARE</span>
              <h2 className="about-section-heading">
                Transforming Extrusion Operations with Technical Rigor
              </h2>
              <p className="about-paragraph">
                Headquartered in Tamkuhiraj, Kushinagar, Uttar Pradesh, <strong>VSS Alutech Solutions</strong> operates as an independent technical services provider, engineering coordinator, and plant management ally for aluminium extrusion enterprises throughout India.
              </p>
              <p className="about-paragraph">
                The aluminium extrusion sector demands exacting metallurgical precision, hydraulic consistency, and thermal equilibrium. Too often, plant owners face misaligned presses, erratic thermal profiles in billet heaters, premature die failures, and high scrap rates. VSS Alutech was founded to bridge this operational gap with end-to-end engineering authority.
              </p>

              <div className="about-quote-box">
                <blockquote>
                  "We do not merely supply advice; we work side-by-side on the plant floor to optimize recovery ratios, stabilize press hydraulics, and train operational crews to world-class standards."
                </blockquote>
              </div>

              <div className="about-key-points">
                <div className="key-point-item">
                  <span className="key-point-icon">&bull;</span>
                  <div>
                    <strong>Independent Engineering Integrity:</strong> We are an independent consultancy and sourcing coordinator. We evaluate machinery, furnaces, and tooling purely on technical merit and commercial viability.
                  </div>
                </div>
                <div className="key-point-item">
                  <span className="key-point-icon">&bull;</span>
                  <div>
                    <strong>Thermal &amp; Recovery Mastery:</strong> Our furnace and plant maintenance engineers focus on reducing fuel consumption and raising extrusion recovery percentages.
                  </div>
                </div>
                <div className="key-point-item">
                  <span className="key-point-icon">&bull;</span>
                  <div>
                    <strong>Vetted Toolroom &amp; Die Ecosystem:</strong> Through our established network of independent tool rooms, we ensure rapid trial coordination, correct bearing design, and dependable nitriding schedules.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="about-image-column">
              <div className="about-frame-wrapper">
                <div className="about-main-image-frame">
                  <img
                    src={getAssetUrl('assets/images/hero-extrusion-press.jpg')}
                    alt="VSS Alutech Extrusion Facility"
                    className="about-image"
                    loading="lazy"
                  />
                </div>
                <div className="about-frame-offset-box" aria-hidden="true"></div>
              </div>

              <div className="about-office-card">
                <span className="office-tag">REGISTERED OPERATIONS OFFICE</span>
                <h4 className="office-location">Tamkuhiraj, Kushinagar</h4>
                <p className="office-address">Uttar Pradesh &mdash; 274407, India</p>
                <div className="office-contact-links">
                  <a href="tel:+919517098011" className="office-link">+91 9517098011</a>
                  <a href="mailto:vssalutechsolutions@gmail.com" className="office-link">vssalutechsolutions@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Excellence */}
      <section className="about-pillars-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">CORE COMMITMENTS</span>
            <h2 className="section-title">The VSS Engineering Standard</h2>
          </div>

          <div className="about-commitments-grid">
            <div className="commitment-card">
              <span className="commitment-number">01</span>
              <h3 className="commitment-title">Turnkey Plant Architecture</h3>
              <p className="commitment-desc">
                From initial site layout and civil foundation planning to hydraulic pump room setup and electrical sub-station sizing, we ensure zero commissioning delays.
              </p>
            </div>

            <div className="commitment-card">
              <span className="commitment-number">02</span>
              <h3 className="commitment-title">Thermal Energy Audits</h3>
              <p className="commitment-desc">
                Furnace efficiency directly dictates operational EBITDA. We inspect burner air-fuel ratios, thermocouple calibration, and insulation linings to cut specific energy consumption.
              </p>
            </div>

            <div className="commitment-card">
              <span className="commitment-number">03</span>
              <h3 className="commitment-title">Die Management Network</h3>
              <p className="commitment-desc">
                Minimizing trial iterations and eliminating profile surface tearing through computer-modeled flow dynamics, nitriding management, and on-site die correction expertise.
              </p>
            </div>

            <div className="commitment-card">
              <span className="commitment-number">04</span>
              <h3 className="commitment-title">Industrial Manpower Supply</h3>
              <p className="commitment-desc">
                Deploying certified, seasoned plant managers, extrusion technicians, maintenance fitters, and operators capable of operating 24/7 continuous production shifts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="about-cta-section">
        <div className="container text-center">
          <span className="section-tag">COLLABORATE WITH EXPERTS</span>
          <h2 className="section-title">Partner with VSS Alutech for Your Next Plant Milestone</h2>
          <p className="section-subtitle">
            Whether establishing a new greenfield facility or upgrading existing press lines, let our engineering specialists evaluate your requirements.
          </p>
          <div style={{ marginTop: '32px' }}>
            <button
              type="button"
              className="btn-architectural-dark"
              onClick={() => onNavigate('contact')}
            >
              <span>Schedule a Technical Consultation</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
