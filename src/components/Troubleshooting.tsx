import React from 'react';
import { getAssetUrl } from '../utils/asset';

interface TroubleshootingProps {
  onSelectService: (serviceName: string) => void;
}

export const Troubleshooting: React.FC<TroubleshootingProps> = ({ onSelectService }) => {
  return (
    <section className="service-detail-section" id="plant-troubleshooting">
      <div className="container">
        <div className="service-detail-grid">
          <div className="service-text-col">
            <div className="section-tag">SERVICE CATEGORY 03</div>
            <h2 className="service-heading">Plant Troubleshooting &amp; Operational Consultancy</h2>
            <p className="service-lead">
              Targeted for existing aluminium extrusion plants dealing with production slowdowns, frequent die chokes, high scrap rates, or surface quality rejects.
            </p>
            <p className="service-body">
              Extrusion involves dynamic interplay between alloy temperature, container friction, die bearing friction, quench rate, and stretching tension. Our troubleshooting approach diagnoses root causes rather than symptoms.
            </p>

            <div className="service-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Production Bottleneck Elimination:</strong> Dead-cycle time reduction, billet transfer optimization, puller return synchronization, and stretcher cycle balancing.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Process &amp; Quality Defect Troubleshooting:</strong> Systematic elimination of surface tears, die lines, pick-up, blisters, grain boundary sensitization, cross-sectional distortion, and uneven wall thickness.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Equipment-Related Problems:</strong> Container alignment verification, stem deflection checks, platen parallelism, hydraulic valve response times, and temperature logging.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Technical Consultancy &amp; Standard Operating Procedures:</strong> Implementing disciplined die maintenance, nitriding schedules, caustic wash guidelines, and billet temperature recipes.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Operational Improvement Programs:</strong> Scrap reduction strategies (butt length optimization, front/back saw cuts) to improve overall plant recovery rates.
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">&#9679;</span>
                <div>
                  <strong>Expert On-Site Visits &amp; Contract Support:</strong> Hands-on plant audits, scheduled monthly reviews, and emergency breakdown advisory services.
                </div>
              </div>
            </div>

            <div className="service-cta-wrap">
              <a
                href="#consultation"
                className="btn btn-primary"
                data-service="Plant Troubleshooting"
                onClick={() => onSelectService('Plant Troubleshooting')}
              >
                <span>Discuss Your Plant Problem</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
              <span className="cta-note">*Consultancy tailored to operational challenges; outcomes depend on plant equipment and operational adherence.</span>
            </div>
          </div>

          <div className="service-visual-col">
            <div className="visual-card">
              <img
                src={getAssetUrl('assets/images/plant-troubleshooting.jpg')}
                alt="Industrial Engineers Conducting Aluminium Extrusion Plant Troubleshooting and Inspection"
                className="service-img"
                loading="lazy"
              />
              <div className="visual-badge">
                <span className="badge-title">Field Diagnostic Support</span>
                <span className="badge-desc">Root Cause Quality &amp; Mechanical Audits</span>
              </div>
            </div>

            <div className="troubleshoot-issues-card">
              <h4 className="issues-title">Common Defects We Help Investigate:</h4>
              <div className="issue-tags">
                <span className="issue-tag">Surface Die Lines</span>
                <span className="issue-tag">Extrusion Blisters</span>
                <span className="issue-tag">Grain Growth / Orange Peel</span>
                <span className="issue-tag">Twist &amp; Camber Inaccuracies</span>
                <span className="issue-tag">Low Hardness (Webster / Barcol)</span>
                <span className="issue-tag">Hydraulic Overheating</span>
                <span className="issue-tag">Die Deflection &amp; Breakage</span>
                <span className="issue-tag">Excessive Butt Scrap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
