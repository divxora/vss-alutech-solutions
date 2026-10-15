import React from 'react';

export const ProcessRoadmap: React.FC = () => {
  return (
    <section className="process-section" id="process">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">PROJECT LIFECYCLE</span>
          <h2 className="section-title">Complete Plant Solutions Process</h2>
          <p className="section-subtitle">
            A systematic 7-stage roadmap guiding aluminium extrusion entrepreneurs from conceptual feasibility to profitable daily production.
          </p>
        </div>

        <div className="process-track">
          {/* Step 1 */}
          <div className="process-node">
            <div className="step-badge">01</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="step-name">Consultation &amp; Feasibility</h3>
            <p className="step-desc">Market demand study, product profile mix, capacity assessment &amp; ROI financial estimates.</p>
          </div>

          <div className="process-arrow" aria-hidden="true">&#10140;</div>

          {/* Step 2 */}
          <div className="process-node">
            <div className="step-badge">02</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className="step-name">Plant Planning &amp; Layout</h3>
            <p className="step-desc">Civil shop floor architecture, crane coverage, raw material flow &amp; utility routing.</p>
          </div>

          <div className="process-arrow" aria-hidden="true">&#10140;</div>

          {/* Step 3 */}
          <div className="process-node">
            <div className="step-badge">03</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 className="step-name">Equipment Selection &amp; Sourcing</h3>
            <p className="step-desc">Extrusion press line, log heaters, ageing ovens, handling systems &amp; auxiliary quotes.</p>
          </div>

          <div className="process-arrow" aria-hidden="true">&#10140;</div>

          {/* Step 4 */}
          <div className="process-node">
            <div className="step-badge">04</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h3 className="step-name">Installation &amp; Commissioning</h3>
            <p className="step-desc">Civil foundation checks, mechanical erection, hydraulic flushing, dry runs &amp; hot test trials.</p>
          </div>

          <div className="process-arrow" aria-hidden="true">&#10140;</div>

          {/* Step 5 */}
          <div className="process-node">
            <div className="step-badge">05</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="step-name">Manpower Arrangement</h3>
            <p className="step-desc">Deploying qualified plant heads, shift in-charges, skilled press operators &amp; helpers.</p>
          </div>

          <div className="process-arrow" aria-hidden="true">&#10140;</div>

          {/* Step 6 */}
          <div className="process-node">
            <div className="step-badge">06</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="3" x2="12" y2="9" />
                <line x1="12" y1="15" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="step-name">Tooling, Supplies &amp; Spares</h3>
            <p className="step-desc">Independent tool room die sourcing, dummy blocks, container liners &amp; shear blades.</p>
          </div>

          <div className="process-arrow" aria-hidden="true">&#10140;</div>

          {/* Step 7 */}
          <div className="process-node">
            <div className="step-badge">07</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className="step-name">Ongoing Technical Support</h3>
            <p className="step-desc">Routine scrap audits, metallurgical troubleshooting, recovery optimization &amp; plant visits.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
