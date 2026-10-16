import React from 'react';
import { getAssetUrl } from '../utils/asset';

export const ServiceOverview: React.FC = () => {
  return (
    <section className="service-cards-section" id="service-overview">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">CAPABILITIES OVERVIEW</span>
          <h2 className="section-title">Specialized Services for Aluminium Extrusion Plants</h2>
          <p className="section-subtitle">
            Click on any core specialization below to explore technical specifications, operational scope, and consulting workflows.
          </p>
        </div>

        <div className="cards-grid-six">
          {/* Card 1 */}
          <a
            href="#press-solutions"
            className="image-service-card"
            style={{ backgroundImage: `url('${getAssetUrl('assets/images/hero-extrusion-press.jpg')}')` }}
          >
            <div className="card-gradient"></div>
            <div className="card-content">
              <span className="card-number">01</span>
              <h3 className="card-title">Extrusion Presses</h3>
              <p className="card-desc">Complete machinery selection, tonnage sizing, line automation, and commissioning.</p>
              <div className="card-arrow" aria-label="Explore Extrusion Presses">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </a>

          {/* Card 2 */}
          <a
            href="#furnace-solutions"
            className="image-service-card"
            style={{ backgroundImage: `url('${getAssetUrl('assets/images/furnace-solutions.jpg')}')` }}
          >
            <div className="card-gradient"></div>
            <div className="card-content">
              <span className="card-number">02</span>
              <h3 className="card-title">Furnaces</h3>
              <p className="card-desc">Billet heating furnaces, log shears, and precision ageing ovens.</p>
              <div className="card-arrow" aria-label="Explore Furnaces">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </a>

          {/* Card 3 */}
          <a
            href="#alloy-grades"
            className="image-service-card"
            style={{ backgroundImage: `url('${getAssetUrl('assets/images/profiles-billets.jpg')}')` }}
          >
            <div className="card-gradient"></div>
            <div className="card-content">
              <span className="card-number">03</span>
              <h3 className="card-title">Alloy Grades &amp; Billets</h3>
              <p className="card-desc">7 standard series, 20 legacy codes, extrusion recipes, and yield optimization advice.</p>
              <div className="card-arrow" aria-label="Explore Alloy Grades & Billets">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </a>

          {/* Card 4 */}
          <a
            href="#plant-troubleshooting"
            className="image-service-card"
            style={{ backgroundImage: `url('${getAssetUrl('assets/images/plant-troubleshooting.jpg')}')` }}
          >
            <div className="card-gradient"></div>
            <div className="card-content">
              <span className="card-number">04</span>
              <h3 className="card-title">Plant Troubleshooting</h3>
              <p className="card-desc">Extrusion press console diagnostics, defect elimination, and cycle-time balancing.</p>
              <div className="card-arrow" aria-label="Explore Plant Troubleshooting">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </a>

          {/* Card 5 */}
          <a
            href="#toolroom-dies"
            className="image-service-card"
            style={{ backgroundImage: `url('${getAssetUrl('assets/images/toolroom-dies.jpg')}')` }}
          >
            <div className="card-gradient"></div>
            <div className="card-content">
              <span className="card-number">05</span>
              <h3 className="card-title">Tool Room &amp; Dies</h3>
              <p className="card-desc">Independent tool room sourcing, die trial review, and profile design.</p>
              <div className="card-arrow" aria-label="Explore Tool Room & Dies">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </a>

          {/* Card 6 */}
          <a
            href="#manpower-supplier"
            className="image-service-card"
            style={{ backgroundImage: `url('${getAssetUrl('assets/images/manpower-team.jpg')}')` }}
          >
            <div className="card-gradient"></div>
            <div className="card-content">
              <span className="card-number">06</span>
              <h3 className="card-title">Manpower Supply</h3>
              <p className="card-desc">Contract staffing: plant heads, press operators, and technicians.</p>
              <div className="card-arrow" aria-label="Explore Manpower Supply">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
