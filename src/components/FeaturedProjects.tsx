import React from 'react';

export const FeaturedProjects: React.FC = () => {
  return (
    <section className="projects-section" id="projects">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">PROJECT BENCHMARKS</span>
          <h2 className="section-title">Featured Project Categories</h2>
          <p className="section-subtitle">
            Illustrative representations of engineering and operational scopes coordinated by VSS Alutech Solutions across the extrusion lifecycle.
          </p>
        </div>

        <div className="projects-grid">
          <div className="project-card">
            <div className="project-img-box">
              <img
                src="/assets/images/project-press.jpg"
                alt="Illustrative Extrusion Press Machinery Installation"
                loading="lazy"
              />
              <span className="project-category-badge">Machinery Sourcing</span>
            </div>
            <div className="project-details">
              <h3 className="project-name">Extrusion Press Installation</h3>
              <p className="project-summary">
                Coordination of 1,800 UST automated direct extrusion press line, foundation alignment, runout table setup, and hydraulic commissioning.
              </p>
              <div className="project-meta">
                <span>Scope: Machinery Vetting &amp; Setup Advisory</span>
              </div>
            </div>
          </div>

          <div className="project-card">
            <div className="project-img-box">
              <img
                src="/assets/images/project-furnace.jpg"
                alt="Illustrative Gas Billet Heating Furnace and Ageing Oven Setup"
                loading="lazy"
              />
              <span className="project-category-badge">Thermal Engineering</span>
            </div>
            <div className="project-details">
              <h3 className="project-name">Furnace Setup &amp; Energy Audit</h3>
              <p className="project-summary">
                Sourcing coordination for a rapid-heating gas billet furnace with hot log shear, reducing specific fuel consumption per metric ton.
              </p>
              <div className="project-meta">
                <span>Scope: Furnace Capacity &amp; Thermal Balancing</span>
              </div>
            </div>
          </div>

          <div className="project-card">
            <div className="project-img-box">
              <img
                src="/assets/images/profiles-billets.jpg"
                alt="Illustrative Aluminium Profile Production Line Optimization"
                loading="lazy"
              />
              <span className="project-category-badge">Process Optimization</span>
            </div>
            <div className="project-details">
              <h3 className="project-name">Aluminium Profile Production</h3>
              <p className="project-summary">
                Comprehensive cycle-time audit for architectural hollow profile manufacturing, eliminating runout pinch-point bottlenecks.
              </p>
              <div className="project-meta">
                <span>Scope: Plant Troubleshooting &amp; Recovery</span>
              </div>
            </div>
          </div>

          <div className="project-card">
            <div className="project-img-box">
              <img
                src="/assets/images/toolroom-dies.jpg"
                alt="Illustrative Precision Die Sourcing and Tool Room Coordination"
                loading="lazy"
              />
              <span className="project-category-badge">Tooling Coordination</span>
            </div>
            <div className="project-details">
              <h3 className="project-name">Tool Room &amp; Die Sourcing</h3>
              <p className="project-summary">
                Bridging client CAD profiles with independent certified tool rooms for multi-cavity solar bracket dies with high nitriding endurance.
              </p>
              <div className="project-meta">
                <span>Scope: Drawing Review &amp; Independent Tool Room Link</span>
              </div>
            </div>
          </div>
        </div>

        <div className="projects-note">
          <p>
            <strong>Note on Illustrative Projects:</strong> The above project categories illustrate representative operational scopes. Detailed technical case studies and reference visits can be shared upon direct business inquiry under confidentiality agreements.
          </p>
        </div>
      </div>
    </section>
  );
};
