import React from 'react';
import { getAssetUrl } from '../utils/asset';

interface ToolRoomDiesProps {
  onSelectService: (serviceName: string) => void;
}

export const ToolRoomDies: React.FC<ToolRoomDiesProps> = ({ onSelectService }) => {
  return (
    <section className="service-detail-section bg-light-alt" id="toolroom-dies">
      <div className="container">
        <div className="service-detail-grid reverse-on-desktop">
          <div className="service-visual-col">
            <div className="visual-card">
              <img
                src={getAssetUrl('assets/images/toolroom-dies.jpg')}
                alt="Precision Extrusion Dies, Micrometers, and CNC Wire EDM in Modern Tool Room"
                className="service-img"
                loading="lazy"
              />
              <div className="visual-badge">
                <span className="badge-title">Extrusion Die Tooling</span>
                <span className="badge-desc">Precision Sourcing &amp; Quality Review</span>
              </div>
            </div>

            {/* Business Model Workflow Diagram */}
            <div className="workflow-box">
              <h4 className="workflow-title">Transparent Die Sourcing Process</h4>
              <div className="workflow-steps">
                <div className="wf-step">
                  <span className="wf-num">1</span>
                  <div className="wf-info">
                    <strong>Drawing Submission:</strong> Client shares profile dimensions, DWG/DXF files, alloy, press specs, and tolerance standards.
                  </div>
                </div>
                <div className="wf-step">
                  <span className="wf-num">2</span>
                  <div className="wf-info">
                    <strong>Tool Room Matching:</strong> VSS matches requirements with an independent tool room specializing in that profile geometry.
                  </div>
                </div>
                <div className="wf-step">
                  <span className="wf-num">3</span>
                  <div className="wf-info">
                    <strong>Precision Machining:</strong> Independent tool room fabricates die using premium H13 tool steel, CNC wire EDM, and nitriding.
                  </div>
                </div>
                <div className="wf-step">
                  <span className="wf-num">4</span>
                  <div className="wf-info">
                    <strong>Delivery &amp; Follow-up:</strong> VSS manages quotation, quality checks, shipment tracking, and die trial feedback.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="service-text-col">
            <div className="section-tag">SERVICE CATEGORY 04</div>
            <h2 className="service-heading">Tool Room &amp; Die Solutions</h2>
            <p className="service-lead">
              High-precision die design and fabrication are the cornerstone of dimensional accuracy, profile wall uniformity, and extrusion speed.
            </p>
            <p className="service-body">
              <strong>Our Transparent Model:</strong> VSS Alutech Solutions acts as your technical bridge to certified, independent tool rooms across India. We review drawings, coordinate die bearing designs, negotiate commercial quotes, and track delivery — eliminating trial-and-error headaches.
            </p>

            <div className="service-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Extrusion Die Sourcing:</strong> Sourcing of solid flat dies, hollow porthole bridge dies, multi-cavity dies, and modular insert dies.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Custom Profile Die Requirements:</strong> Architectural sections, curtain wall glazes, solar module mounting channels, automotive heat sinks, and thermal break profiles.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Tool Room Coordination &amp; Design Review:</strong> Choke angle, relief angle, bearing land length, pocket geometry, and mandrel deflection calculations.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Drawing &amp; Specification Coordination:</strong> Conversion of customer CAD sketches into manufacturable extrusion die blueprints adhering to DIN/EN/ASTM tolerances.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Order &amp; Delivery Follow-up:</strong> Expediting die fabrication schedules, sample trial tracking, correction reporting, and nitriding life cycle advice.
                </div>
              </div>
            </div>

            {/* Transparency Disclaimer Box */}
            <div className="disclaimer-callout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="disclaimer-icon">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Ethical Sourcing Notice:</strong> VSS Alutech Solutions coordinates with carefully vetted, independent specialized tool rooms. We do not operate an in-house tool room or manufacture dies directly.
              </div>
            </div>

            <div className="service-cta-wrap">
              <a
                href="#consultation"
                className="btn btn-primary"
                data-service="Tool Room & Die Solutions"
                onClick={() => onSelectService('Tool Room & Die Solutions')}
              >
                <span>Request a Die Quote</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
