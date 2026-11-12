import React from 'react';
import { Hero } from '../components/Hero';
import { StatsPanel } from '../components/StatsPanel';
import { ProcessRoadmap } from '../components/ProcessRoadmap';
import { FeaturedProjects } from '../components/FeaturedProjects';
import { PageRoute } from '../types/navigation';
import { getAssetUrl } from '../utils/asset';

interface HomePageProps {
  onNavigate: (page: PageRoute, targetSection?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="page-home">
      {/* Editorial Hero matching reference screenshot */}
      <Hero
        onOpenConsultation={(service) => onNavigate('contact', service)}
      />

      {/* 5 Core Pillars Section with Editorial Cards */}
      <section className="home-pillars-section" id="core-pillars">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">ENGINEERING PILLARS</span>
            <h2 className="section-title">Turnkey Extrusion Capabilities</h2>
            <p className="section-subtitle">
              Comprehensive operational services covering every stage of aluminium extrusion manufacturing, from initial layout to steady-state output.
            </p>
          </div>

          <div className="pillars-grid-five">
            {/* Card 1: Press Machinery */}
            <div
              className="pillar-card"
              onClick={() => onNavigate('solutions', 'press-solutions')}
              role="button"
              tabIndex={0}
            >
              <div className="pillar-image-wrapper">
                <img
                  src={getAssetUrl('assets/images/project-press.jpg')}
                  alt="Extrusion Press Machinery"
                  className="pillar-image"
                  loading="lazy"
                />
                <span className="pillar-badge">01 &bull; MACHINERY</span>
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Extrusion Presses</h3>
                <p className="pillar-desc">
                  Tonnage sizing (500T to 10,000T), hydraulic powerpacks, PLC automation, and continuous extrusion line sourcing.
                </p>
                <div className="pillar-action">
                  <span>Explore Solutions</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pillar-arrow">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2: Furnace Systems */}
            <div
              className="pillar-card"
              onClick={() => onNavigate('solutions', 'furnace-solutions')}
              role="button"
              tabIndex={0}
            >
              <div className="pillar-image-wrapper">
                <img
                  src={getAssetUrl('assets/images/furnace-solutions.jpg')}
                  alt="Thermal Furnace Systems"
                  className="pillar-image"
                  loading="lazy"
                />
                <span className="pillar-badge">02 &bull; THERMAL</span>
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Furnace Solutions</h3>
                <p className="pillar-desc">
                  Multi-zone gas &amp; induction billet heaters, log hot shears, die preheat ovens, and multi-chamber ageing ovens.
                </p>
                <div className="pillar-action">
                  <span>Explore Solutions</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pillar-arrow">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 3: Plant Consultancy & Maintenance */}
            <div
              className="pillar-card"
              onClick={() => onNavigate('solutions', 'plant-troubleshooting')}
              role="button"
              tabIndex={0}
            >
              <div className="pillar-image-wrapper">
                <img
                  src={getAssetUrl('assets/images/plant-troubleshooting.jpg')}
                  alt="Plant Troubleshooting & Maintenance"
                  className="pillar-image"
                  loading="lazy"
                />
                <span className="pillar-badge">03 &bull; AUDIT</span>
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Plant Maintenance</h3>
                <p className="pillar-desc">
                  Operational troubleshooting, recovery improvement, downtime reduction, hydraulic auditing, and greenfield layout.
                </p>
                <div className="pillar-action">
                  <span>Explore Solutions</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pillar-arrow">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 4: Tool Room & Dies */}
            <div
              className="pillar-card"
              onClick={() => onNavigate('solutions', 'toolroom-dies')}
              role="button"
              tabIndex={0}
            >
              <div className="pillar-image-wrapper">
                <img
                  src={getAssetUrl('assets/images/toolroom-dies.jpg')}
                  alt="Precision Extrusion Dies"
                  className="pillar-image"
                  loading="lazy"
                />
                <span className="pillar-badge">04 &bull; TOOLROOM</span>
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Dies &amp; Toolroom</h3>
                <p className="pillar-desc">
                  Solid and hollow architectural profiles, independent die trial coordination, nitriding schedules, and die correction.
                </p>
                <div className="pillar-action">
                  <span>Explore Solutions</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pillar-arrow">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 5: Skilled Manpower */}
            <div
              className="pillar-card"
              onClick={() => onNavigate('solutions', 'manpower-supplier')}
              role="button"
              tabIndex={0}
            >
              <div className="pillar-image-wrapper">
                <img
                  src={getAssetUrl('assets/images/manpower-team.jpg')}
                  alt="Skilled Extrusion Manpower"
                  className="pillar-image"
                  loading="lazy"
                />
                <span className="pillar-badge">05 &bull; MANPOWER</span>
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Technical Crews</h3>
                <p className="pillar-desc">
                  Certified press operators, furnace engineers, die correctors, supervisors, and complete plant operational staffing.
                </p>
                <div className="pillar-action">
                  <span>Explore Solutions</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pillar-arrow">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Stats Panel */}
      <StatsPanel />

      {/* Execution Roadmap */}
      <ProcessRoadmap />

      {/* Featured Projects & Sectors */}
      <FeaturedProjects />

      {/* Direct Contact Banner */}
      <section className="home-cta-banner">
        <div className="container">
          <div className="cta-banner-card">
            <div className="cta-banner-text">
              <span className="section-tag" style={{ color: 'var(--color-orange)' }}>READY TO OPTIMIZE?</span>
              <h2 className="cta-banner-title">Consult with Our Extrusion Engineers</h2>
              <p className="cta-banner-desc">
                From Greenfield feasibility studies to recovery troubleshooting and die sourcing — discuss your plant requirements with our specialists.
              </p>
            </div>
            <div className="cta-banner-actions">
              <button
                type="button"
                className="btn-architectural-dark"
                onClick={() => onNavigate('contact')}
              >
                <span>Request Technical Consultation</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <button
                type="button"
                className="btn-architectural-outline"
                onClick={() => onNavigate('about')}
              >
                <span>About Our Firm</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
