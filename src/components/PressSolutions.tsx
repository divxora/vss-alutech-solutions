import React, { useState } from 'react';
import { TonnageRule } from '../types';
import { getAssetUrl } from '../utils/asset';

interface PressSolutionsProps {
  onSelectService: (serviceName: string) => void;
  onApplyEstimate: (estimate: string) => void;
}

const TONNAGE_RULES: Record<string, TonnageRule> = {
  '4': {
    press: '660 UST (5.8 MN)',
    container: 'Ø 108 mm (4.25")',
    output: '120 - 180 MT / mo',
    ccd: 'Up to 90 mm profile',
  },
  '5': {
    press: '1,100 UST (9.8 MN)',
    container: 'Ø 133 mm (5.25")',
    output: '250 - 320 MT / mo',
    ccd: 'Up to 150 mm profile',
  },
  '7': {
    press: '1,800 UST (16.0 MN)',
    container: 'Ø 185 mm (7.28")',
    output: '450 - 600 MT / mo',
    ccd: 'Up to 220 mm profile',
  },
  '8': {
    press: '2,500 UST (22.2 MN)',
    container: 'Ø 210 mm (8.27")',
    output: '650 - 850 MT / mo',
    ccd: 'Up to 280 mm profile',
  },
  '10': {
    press: '3,600 UST (32.0 MN)',
    container: 'Ø 262 mm (10.3")',
    output: '950 - 1,250 MT / mo',
    ccd: 'Up to 360 mm profile',
  },
  '12': {
    press: '5,000 UST (44.5 MN)',
    container: 'Ø 315 mm (12.4")',
    output: '1,400 - 1,900 MT / mo',
    ccd: 'Up to 450 mm profile',
  },
};

export const PressSolutions: React.FC<PressSolutionsProps> = ({
  onSelectService,
  onApplyEstimate,
}) => {
  const [billetSize, setBilletSize] = useState('5');
  const [alloyGroup, setAlloyGroup] = useState('6063');

  const rule = TONNAGE_RULES[billetSize] || TONNAGE_RULES['5'];

  let pressDisplay = rule.press;
  if (alloyGroup === '6061') {
    pressDisplay += ' (Recommended +15% pressure)';
  } else if (alloyGroup === 'hard') {
    pressDisplay += ' (High Specific Pressure)';
  }

  const handleApply = () => {
    const alloyName =
      alloyGroup === '6063'
        ? '6063 / 6060'
        : alloyGroup === '6061'
        ? '6061 / 6082'
        : '2024 / 7075';
    const summary = `Billet: ${billetSize}" | Alloy: ${alloyName} | Estimated Press: ${rule.press}`;
    onApplyEstimate(summary);
  };

  return (
    <section className="service-detail-section" id="press-solutions">
      <div className="container">
        <div className="service-detail-grid">
          <div className="service-text-col">
            <div className="section-tag">SERVICE CATEGORY 01</div>
            <h2 className="service-heading">Aluminium Extrusion Press Solutions &amp; Machinery</h2>
            <p className="service-lead">
              Planning a new aluminium extrusion plant or upgrading an existing production line? VSS Alutech Solutions provides end-to-end machinery consultancy to ensure you invest in the right press capacity and technology.
            </p>
            <p className="service-body">
              The extrusion press is the beating heart of your plant. Choosing the appropriate tonnage, container size, hydraulic architecture, and runout handling system dictates your product profile capability, cycle speed, and operational profitability for decades.
            </p>

            <div className="service-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Extrusion Press Selection:</strong> Front-loading, back-loading, short-stroke, and direct extrusion press evaluation tailored to your target product range.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Capacity &amp; Tonnage Consultation:</strong> Press sizing analysis (from 550 UST up to 4000+ UST) based on billet diameter, profile CCD, wall thickness, and alloy mix (6063, 6061, 6082).
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Machinery Sourcing &amp; Quotations:</strong> Vendor comparison, commercial quotation analysis, and technical vetting across domestic and international machinery makers.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Technical Specifications &amp; Line Automation:</strong> Reviewing hydraulic pumps, proportional valves, PLC control systems, runout cooling tables, pullers, and stretcher specifications.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Installation &amp; Commissioning Coordination:</strong> Foundation layout planning, civil coordination, mechanical assembly oversight, hydraulic flushing, and trial extrusion support.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>New Plant Project Consultation:</strong> Complete greenfield and brownfield master planning, plant civil footprint sizing, crane capacities, and utility load assessments.
                </div>
              </div>
            </div>

            <div className="service-cta-wrap">
              <a
                href="#consultation"
                className="btn btn-primary"
                data-service="Press Solutions"
                onClick={() => onSelectService('Press Solutions')}
              >
                <span>Enquire About Presses</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
              <span className="cta-note">*Independent consulting and sourcing coordination</span>
            </div>
          </div>

          <div className="service-visual-col">
            <div className="visual-card">
              <img
                src={getAssetUrl('assets/images/hero-extrusion-press.jpg')}
                alt="Aluminium Extrusion Press Machinery in operation with glowing extruded profile"
                className="service-img"
                loading="lazy"
              />
              <div className="visual-badge">
                <span className="badge-title">Press Capacity Range</span>
                <span className="badge-desc">550 UST to 4,500+ UST Lines</span>
              </div>
            </div>

            <div className="visual-spec-box">
              <h4 className="spec-title">Key Machinery Focus Areas</h4>
              <ul className="spec-list">
                <li><span>Extrusion Press Main Cylinder &amp; Tie Rods</span></li>
                <li><span>Container Heating Systems &amp; Die Slide</span></li>
                <li><span>Automated Single / Double Puller Systems</span></li>
                <li><span>High-Velocity Air &amp; Water Quench Zones</span></li>
                <li><span>Hydraulic Power Packs &amp; Servo Drives</span></li>
              </ul>
            </div>

            {/* Interactive Press Tonnage Estimator Widget */}
            <div className="tonnage-calculator-card" id="pressCalculator">
              <div className="calc-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="calc-icon">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </svg>
                <div>
                  <h4 className="calc-title">Press Capacity Sizing Estimator</h4>
                  <span className="calc-subtitle">Engineering rule-of-thumb benchmark</span>
                </div>
              </div>

              <div className="calc-inputs-grid">
                <div className="calc-group">
                  <label htmlFor="calcBilletSize">Billet Diameter:</label>
                  <select
                    id="calcBilletSize"
                    className="calc-select"
                    value={billetSize}
                    onChange={(e) => setBilletSize(e.target.value)}
                  >
                    <option value="4">4" (102 mm) - Small Architectural</option>
                    <option value="5">5" (127 mm) - Standard Architectural / Industrial</option>
                    <option value="7">7" (178 mm) - Heavy Architectural / Solar</option>
                    <option value="8">8" (203 mm) - Structural / Transportation</option>
                    <option value="10">10" (254 mm) - Heavy Industrial / Rail</option>
                    <option value="12">12" (305 mm) - Aerospace / Custom Heavy</option>
                  </select>
                </div>
                <div className="calc-group">
                  <label htmlFor="calcAlloy">Target Alloy Group:</label>
                  <select
                    id="calcAlloy"
                    className="calc-select"
                    value={alloyGroup}
                    onChange={(e) => setAlloyGroup(e.target.value)}
                  >
                    <option value="6063">6063 / 6060 (Standard Extrusion)</option>
                    <option value="6061">6061 / 6082 (High Strength Structural)</option>
                    <option value="hard">2024 / 7075 (Hard High-Spec Alloy)</option>
                  </select>
                </div>
              </div>

              <div className="calc-results-panel">
                <div className="calc-result-item">
                  <span className="res-label">Recommended Press:</span>
                  <span className="res-value" id="calcRecommendedPress">{pressDisplay}</span>
                </div>
                <div className="calc-result-item">
                  <span className="res-label">Container Dia:</span>
                  <span className="res-value" id="calcContainerDia">{rule.container}</span>
                </div>
                <div className="calc-result-item">
                  <span className="res-label">Typical Monthly Output:</span>
                  <span className="res-value" id="calcMonthlyOutput">{rule.output}</span>
                </div>
                <div className="calc-result-item">
                  <span className="res-label">Typical Max CCD:</span>
                  <span className="res-value" id="calcMaxCCD">{rule.ccd}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block calc-apply-btn"
                id="applyCalcEstimateBtn"
                onClick={handleApply}
              >
                <span>Use This Sizing in Consultation</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
