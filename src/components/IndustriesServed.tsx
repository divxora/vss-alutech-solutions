import React from 'react';
import { getAssetUrl } from '../utils/asset';

export const IndustriesServed: React.FC = () => {
  return (
    <section className="industries-section" id="industries">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">APPLICATION SECTORS</span>
          <h2 className="section-title">Industries We Serve</h2>
          <p className="section-subtitle">
            Aluminium extrusion enables lightweight, high-strength solutions across vital modern industries. We advise plants producing profiles for every major market.
          </p>
        </div>

        <div className="industries-grid">
          {/* Industry 1 */}
          <div className="industry-card">
            <div className="industry-img-wrap">
              <img
                src={getAssetUrl('assets/images/industry-architectural.jpg')}
                alt="Modern Building Facade using Architectural Aluminium Profiles"
                loading="lazy"
              />
              <div className="industry-overlay"></div>
            </div>
            <div className="industry-info">
              <h3 className="industry-title">Architectural Aluminium Profiles</h3>
              <p className="industry-desc">
                Curtain walls, structural glazing, window and door frames, louvers, and partition systems requiring superior surface finish and tight anodizing tolerances.
              </p>
            </div>
          </div>

          {/* Industry 2 */}
          <div className="industry-card">
            <div className="industry-img-wrap">
              <img
                src={getAssetUrl('assets/images/industry-automotive.jpg')}
                alt="Automotive Chassis and Lightweight Structural Components"
                loading="lazy"
              />
              <div className="industry-overlay"></div>
            </div>
            <div className="industry-info">
              <h3 className="industry-title">Automotive Profiles</h3>
              <p className="industry-desc">
                EV battery enclosure frames, crash management beams, roof rails, heat shields, and suspension parts requiring 6082/6061 heat-treatable alloys.
              </p>
            </div>
          </div>

          {/* Industry 3 */}
          <div className="industry-card">
            <div className="industry-img-wrap">
              <img
                src={getAssetUrl('assets/images/industry-industrial.jpg')}
                alt="Industrial Modular T-slot Aluminium Framing and Automation"
                loading="lazy"
              />
              <div className="industry-overlay"></div>
            </div>
            <div className="industry-info">
              <h3 className="industry-title">Industrial Profiles</h3>
              <p className="industry-desc">
                Modular T-slot automation framing, pneumatic cylinder tubes, conveyor guide rails, and heavy structural engineering extrusions.
              </p>
            </div>
          </div>

          {/* Industry 4 */}
          <div className="industry-card">
            <div className="industry-img-wrap">
              <img
                src={getAssetUrl('assets/images/industry-solar.jpg')}
                alt="Solar Panel Mounting Structures and Aluminium Brackets"
                loading="lazy"
              />
              <div className="industry-overlay"></div>
            </div>
            <div className="industry-info">
              <h3 className="industry-title">Solar &amp; Renewable Energy</h3>
              <p className="industry-desc">
                Photovoltaic module frame profiles, rooftop mounting rails, ground-mount brackets, and high-corrosion-resistant alloy applications.
              </p>
            </div>
          </div>

          {/* Industry 5 */}
          <div className="industry-card">
            <div className="industry-img-wrap">
              <img
                src={getAssetUrl('assets/images/industry-consumer.jpg')}
                alt="Consumer Electronics and Precision Extruded Heat Sinks"
                loading="lazy"
              />
              <div className="industry-overlay"></div>
            </div>
            <div className="industry-info">
              <h3 className="industry-title">Consumer Products</h3>
              <p className="industry-desc">
                Electronics enclosures, LED lighting tracks, heat sink extrusions, appliance trim, and consumer lifestyle product hardware.
              </p>
            </div>
          </div>

          {/* Industry 6 */}
          <div className="industry-card">
            <div className="industry-img-wrap">
              <img
                src={getAssetUrl('assets/images/industry-custom.jpg')}
                alt="Complex Custom Aluminium Profile Geometries"
                loading="lazy"
              />
              <div className="industry-overlay"></div>
            </div>
            <div className="industry-info">
              <h3 className="industry-title">Custom Aluminium Extrusions</h3>
              <p className="industry-desc">
                Specialized proprietary hollow and solid profiles engineered to custom drawings with multi-port die tooling and special alloy tempers.
              </p>
            </div>
          </div>
        </div>

        <div className="industry-disclaimer text-center">
          <p className="disclaimer-text">
            *Representative industrial application categories. VSS Alutech Solutions provides equipment consultancy, die sourcing, and plant operational advisory for manufacturers across these sectors.
          </p>
        </div>
      </div>
    </section>
  );
};
