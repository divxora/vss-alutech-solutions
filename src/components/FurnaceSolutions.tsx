import React from 'react';
import { getAssetUrl } from '../utils/asset';

interface FurnaceSolutionsProps {
  onSelectService: (serviceName: string) => void;
}

export const FurnaceSolutions: React.FC<FurnaceSolutionsProps> = ({ onSelectService }) => {
  return (
    <section className="service-detail-section bg-light-alt" id="furnace-solutions">
      <div className="container">
        <div className="service-detail-grid reverse-on-desktop">
          <div className="service-visual-col">
            <div className="visual-card">
              <img
                src={getAssetUrl('assets/images/furnace-solutions.jpg')}
                alt="Aluminium Billet Heating Furnace and Ageing Oven in Extrusion Facility"
                className="service-img"
                loading="lazy"
              />
              <div className="visual-badge">
                <span className="badge-title">Thermal Uniformity</span>
                <span className="badge-desc">Precision Heat Treatment &amp; Ageing</span>
              </div>
            </div>

            <div className="visual-spec-box">
              <h4 className="spec-title">Furnace Solutions Scope</h4>
              <ul className="spec-list">
                <li><span>Gas-Fired Multi-Log Billet Heaters with Hot Shear</span></li>
                <li><span>Single-Log Induction Rapid Billet Heaters</span></li>
                <li><span>High-Convection Artificial Ageing Ovens (T5 / T6)</span></li>
                <li><span>Die Pre-Heating Ovens (Chest &amp; Drawer Types)</span></li>
                <li><span>Melting &amp; Holding Furnaces (Consultation)</span></li>
              </ul>
            </div>
          </div>

          <div className="service-text-col">
            <div className="section-tag">SERVICE CATEGORY 02</div>
            <h2 className="service-heading">Industrial Furnace Solutions for Aluminium Extrusion</h2>
            <p className="service-lead">
              Thermal management directly determines metal metallurgical properties, surface finish, extrusion speed, and fuel consumption. VSS Alutech Solutions assists plants in planning and sourcing robust thermal systems.
            </p>
            <p className="service-body">
              Whether you require rapid heating for high-volume architectural runs or tightly controlled temperature gradients for aerospace-grade alloys, we help identify the most energy-efficient, reliable furnace technology.
            </p>

            <div className="service-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Billet Heating Furnaces:</strong> Sourcing guidance for continuous multi-log gas heaters with integrated hot log shears, or induction heaters providing taper heating for isothermal extrusion.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Ageing Ovens (T4, T5, T6 Tempers):</strong> Design evaluation for batch-type ageing ovens featuring high-velocity cross-flow recirculation fans and tight temperature uniformity (+/- 3°C).
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Melting &amp; Holding Furnaces:</strong> Consultation on reverberatory melting furnaces, scrap recycling setups, and holding furnaces where casting or remelt is integrated.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Furnace Selection &amp; Capacity Planning:</strong> Matching hourly thermal throughput (kg/hr) to press cycle demand to avoid furnace bottlenecks or idle waiting time.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Equipment Sourcing &amp; Energy Efficiency:</strong> Vetting burner systems, recuperators, refractory linings, and flue gas heat recovery systems to drive down specific fuel cost per MT.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Installation &amp; Project Execution Coordination:</strong> Vendor schedule tracking, refractory drying cycles, combustion tuning, and thermal profile compliance verification.
                </div>
              </div>
            </div>

            <div className="service-cta-wrap">
              <a
                href="#consultation"
                className="btn btn-primary"
                data-service="Furnace Solutions"
                onClick={() => onSelectService('Furnace Solutions')}
              >
                <span>Discuss Furnace Requirements</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
              <span className="cta-note">*VSS Alutech Solutions coordinates sourcing and engineering advisory; we do not claim in-house manufacturing.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
