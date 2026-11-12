import React from 'react';
import { PageRoute } from '../types/navigation';
import { getAssetUrl } from '../utils/asset';

interface SectorsPageProps {
  onNavigate: (page: PageRoute, targetSection?: string) => void;
}

export const SectorsPage: React.FC<SectorsPageProps> = ({ onNavigate }) => {
  return (
    <div className="page-sectors">
      {/* Page Header */}
      <section className="page-hero-header">
        <div className="container">
          <span className="section-tag">APPLICATIONS &bull; METALLURGICAL ALLOY EXPERTISE</span>
          <h1 className="page-main-title">Industries We Serve</h1>
          <p className="page-lead-narrative">
            From precision architectural facades and solar mounting frames to structural automotive crash boxes and high-conductivity thermal heat sinks — our plant solutions power critical industries across India.
          </p>
        </div>
      </section>

      {/* Main Sector Grid */}
      <section className="sectors-detail-section">
        <div className="container">
          <div className="sector-detail-card">
            <div className="sector-detail-image-box">
              <img
                src={getAssetUrl('assets/images/industry-architectural.jpg')}
                alt="Architectural & Structural Façade Extrusions"
                className="sector-detail-img"
                loading="lazy"
              />
              <span className="sector-num-badge">01 &bull; ARCHITECTURAL</span>
            </div>
            <div className="sector-detail-content">
              <span className="sector-subtag">BUILDING &bull; STRUCTURAL GLAZING</span>
              <h2 className="sector-heading">Architectural &amp; Building Systems</h2>
              <p className="sector-text">
                Architectural profiles demand superior surface finish for anodizing and powder coating, alongside strict dimensional tolerances for weather sealing and structural curtain wall assemblies.
              </p>
              <ul className="sector-spec-list">
                <li><strong>Common Alloys:</strong> AA 6063-T6, AA 6060, AA 6005A</li>
                <li><strong>Applications:</strong> Curtain walls, unitized façade mullions, structural glazing, thermal break windows, louvers, and interior partitioning.</li>
                <li><strong>Engineering Focus:</strong> Die bearing mirror polishing, zero streaking, consistent anodizing response, and tight geometric twist/straightness tolerances.</li>
              </ul>
              <button
                type="button"
                className="btn-architectural-dark"
                onClick={() => onNavigate('contact', 'Aluminium extrusion press solutions')}
              >
                <span>Inquire for Architectural Lines</span>
              </button>
            </div>
          </div>

          <div className="sector-detail-card reverse">
            <div className="sector-detail-image-box">
              <img
                src={getAssetUrl('assets/images/industry-solar.jpg')}
                alt="Solar PV Module Frame & Tracker Extrusions"
                className="sector-detail-img"
                loading="lazy"
              />
              <span className="sector-num-badge">02 &bull; SOLAR &amp; ENERGY</span>
            </div>
            <div className="sector-detail-content">
              <span className="sector-subtag">RENEWABLE ENERGY &bull; MOUNTING</span>
              <h2 className="sector-heading">Solar PV Frames &amp; Tracker Structures</h2>
              <p className="sector-text">
                Solar extrusion requires high-speed multi-hole extrusion presses, precise punching profiles, and rapid cycle times to meet massive utility-scale gigawatt demand.
              </p>
              <ul className="sector-spec-list">
                <li><strong>Common Alloys:</strong> AA 6005A-T6, AA 6063-T6, AA 6061-T6</li>
                <li><strong>Applications:</strong> 40mm and 35mm module border frames, tracker torque tubes, ground-mount purlins, and rooftop walkways.</li>
                <li><strong>Engineering Focus:</strong> Automated high-speed puller lines, multi-strand runout cooling tables, and high-volume automated cut-off saws.</li>
              </ul>
              <button
                type="button"
                className="btn-architectural-dark"
                onClick={() => onNavigate('contact', 'Aluminium extrusion press solutions')}
              >
                <span>Inquire for Solar Lines</span>
              </button>
            </div>
          </div>

          <div className="sector-detail-card">
            <div className="sector-detail-image-box">
              <img
                src={getAssetUrl('assets/images/industry-automotive.jpg')}
                alt="Automotive & EV Extrusions"
                className="sector-detail-img"
                loading="lazy"
              />
              <span className="sector-num-badge">03 &bull; AUTOMOTIVE &amp; EV</span>
            </div>
            <div className="sector-detail-content">
              <span className="sector-subtag">E-MOBILITY &bull; CRASH MANAGEMENT</span>
              <h2 className="sector-heading">Automotive &amp; Electric Vehicles (EV)</h2>
              <p className="sector-text">
                Automotive components require high-integrity structural extrusion with zero internal porosity, controlled grain recrystallization, and superior crush energy absorption.
              </p>
              <ul className="sector-spec-list">
                <li><strong>Common Alloys:</strong> AA 6082-T6, AA 6061-T6, AA 6110A</li>
                <li><strong>Applications:</strong> EV battery pack enclosures, bumper beams, crash boxes, side sill structural runners, and heat exchange tubes.</li>
                <li><strong>Engineering Focus:</strong> Water quench systems (standing wave / spray), rigorous billet homogenization, and automated ultrasonic flaw inspection.</li>
              </ul>
              <button
                type="button"
                className="btn-architectural-dark"
                onClick={() => onNavigate('contact', 'Aluminium extrusion press solutions')}
              >
                <span>Inquire for Automotive Lines</span>
              </button>
            </div>
          </div>

          <div className="sector-detail-card reverse">
            <div className="sector-detail-image-box">
              <img
                src={getAssetUrl('assets/images/industry-industrial.jpg')}
                alt="Industrial & Heat Sink Extrusions"
                className="sector-detail-img"
                loading="lazy"
              />
              <span className="sector-num-badge">04 &bull; INDUSTRIAL</span>
            </div>
            <div className="sector-detail-content">
              <span className="sector-subtag">AUTOMATION &bull; HEAT DISSIPATION</span>
              <h2 className="sector-heading">Industrial Automation &amp; Electronics</h2>
              <p className="sector-text">
                Demanding high fin-to-base aspect ratios for thermal dissipation, heavy-wall pneumatic cylinders, and modular conveyor t-slot profiles.
              </p>
              <ul className="sector-spec-list">
                <li><strong>Common Alloys:</strong> AA 6063-T5 (high thermal conductivity), AA 6061, AA 6082</li>
                <li><strong>Applications:</strong> Dense fin heat sinks, inverter housings, linear motion gantries, pneumatic actuator cylinders, and motor casings.</li>
                <li><strong>Engineering Focus:</strong> Extreme die tongue ratios, nitrogen die cooling for fin stability, and precise ageing cycle programming.</li>
              </ul>
              <button
                type="button"
                className="btn-architectural-dark"
                onClick={() => onNavigate('contact', 'Aluminium extrusion press solutions')}
              >
                <span>Inquire for Industrial Lines</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="sectors-bottom-cta">
        <div className="container text-center">
          <span className="section-tag">CUSTOM DIES &bull; ALLOY FORMULATIONS</span>
          <h2 className="section-title">Developing a Custom Profile for Your Industry?</h2>
          <p className="section-subtitle">
            Send us your CAD drawings (DXF/DWG/STEP) for an independent feasibility review, press tonnage calculation, and die toolroom sourcing quote.
          </p>
          <div style={{ marginTop: '30px' }}>
            <button
              type="button"
              className="btn-architectural-dark"
              onClick={() => onNavigate('contact')}
            >
              <span>Submit Profile Drawing for Review</span>
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
