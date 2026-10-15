import React, { useState } from 'react';

interface AlloyGradesProps {
  onSelectAlloy: (alloyName: string) => void;
}

interface AlloySeriesGroup {
  id: string;
  series: string;
  name: string;
  description: string;
  grades: string[];
  featured?: boolean;
}

const ALLOY_SERIES_DATA: AlloySeriesGroup[] = [
  {
    id: '1xxx',
    series: '1xxx Series',
    name: 'Pure Aluminium (99%+)',
    description: 'High electrical and thermal conductivity, excellent corrosion resistance, and superior ductility for electrical busbars and specialized chemical containers.',
    grades: ['1050', '1060', '1070', '1350'],
  },
  {
    id: '2xxx',
    series: '2xxx Series',
    name: 'High-Strength Copper Alloys',
    description: 'High mechanical yield strength and fatigue endurance suitable for aerospace, defense framing, and specialized heavy engineering structural applications.',
    grades: ['2014', '2017'],
  },
  {
    id: '3xxx',
    series: '3xxx Series',
    name: 'Manganese Structural Alloys',
    description: 'Moderate strength with excellent formability, atmospheric corrosion resistance, and thermal transfer performance for heat exchangers and industrial cladding.',
    grades: ['3003'],
  },
  {
    id: '4xxx',
    series: '4xxx Series',
    name: 'Silicon Extrusion Alloys',
    description: 'Optimized lower melting point range and thermal stability utilized for specialized architectural trim profiles, welding rods, and brazing materials.',
    grades: ['4043', '4047'],
  },
  {
    id: '5xxx',
    series: '5xxx Series',
    name: 'Marine-Grade Magnesium Alloys',
    description: 'Superior salt-water corrosion resistance, high weldability, and structural resilience for shipbuilding, marine framing, and transportation tanks.',
    grades: ['5052', '5083', '5086'],
  },
  {
    id: '6xxx',
    series: '6xxx Series',
    name: 'Magnesium-Silicon Extrusion Alloys',
    description: 'The premier extrusion alloy class: exceptional surface finish for anodizing, robust strength-to-weight ratio, and tight dimensional tolerances for architectural and structural systems.',
    grades: ['6061', '6063', '6066', '6101', '6201', '6351', '6082'],
    featured: true,
  },
  {
    id: '7xxx',
    series: '7xxx Series',
    name: 'Ultra-High Strength Zinc Alloys',
    description: 'Highest tensile strength among commercial aluminium alloys, engineered for armor plate, military transport structures, and high-stress aerospace components.',
    grades: ['7039', '7075'],
  },
];

const LEGACY_DESIGNATIONS = [
  '19500', '19501', '19600', '19700', '24345',
  '24534', '31000', '43000', '46000', '52000',
  '53000', '55000', '54300', '65032', '63400',
  '64423', '63401', '64401', '64430', '74530',
];

export const AlloyGrades: React.FC<AlloyGradesProps> = ({ onSelectAlloy }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredSeries =
    activeFilter === 'all'
      ? ALLOY_SERIES_DATA
      : ALLOY_SERIES_DATA.filter((s) => s.id === activeFilter);

  const showLegacyOnly = activeFilter === 'legacy';
  const showAllOrSeries = activeFilter !== 'legacy';

  return (
    <section className="alloy-grades-section" id="alloy-grades">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="section-tag">METALLURGICAL CAPABILITIES</span>
          <h2 className="section-title">Aluminium Alloy Grades We Support</h2>
          <p className="section-subtitle">
            Comprehensive extrusion press selection, precision die sourcing, and thermal process advisory across standard international alloy series and legacy industrial specifications.
          </p>
        </div>

        {/* Intro Advisory Banner */}
        <div className="alloy-intro-banner">
          <div className="alloy-intro-text">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 22, height: 22, color: 'var(--color-orange)' }}>
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              Extrusion Sizing &amp; Tooling Advisory by Alloy
            </h3>
            <p>
              Different aluminium alloys require distinct specific extrusion pressure, billet heating temperature gradients, quench rates, and artificial ageing cycles. Whether you are running high-speed architectural 6063, structural 6082/6061, marine 5083, or high-purity electrical 1xxx billets, our engineering consultancy helps configure your press tonnage, die bearings, and furnace systems accordingly.
            </p>
          </div>
          <div className="alloy-intro-action">
            <a
              href="#consultation"
              className="btn btn-primary"
              onClick={() => onSelectAlloy('Aluminium Alloy Consultation')}
            >
              <span>Enquire for Your Grade</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="alloy-filter-tabs">
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Grades (7 Series + Legacy)
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === '1xxx' ? 'active' : ''}`}
            onClick={() => setActiveFilter('1xxx')}
          >
            1xxx
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === '2xxx' ? 'active' : ''}`}
            onClick={() => setActiveFilter('2xxx')}
          >
            2xxx
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === '3xxx' ? 'active' : ''}`}
            onClick={() => setActiveFilter('3xxx')}
          >
            3xxx
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === '4xxx' ? 'active' : ''}`}
            onClick={() => setActiveFilter('4xxx')}
          >
            4xxx
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === '5xxx' ? 'active' : ''}`}
            onClick={() => setActiveFilter('5xxx')}
          >
            5xxx
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === '6xxx' ? 'active' : ''}`}
            onClick={() => setActiveFilter('6xxx')}
          >
            6xxx (Architectural &amp; Structural)
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === '7xxx' ? 'active' : ''}`}
            onClick={() => setActiveFilter('7xxx')}
          >
            7xxx
          </button>
          <button
            type="button"
            className={`alloy-tab-btn ${activeFilter === 'legacy' ? 'active' : ''}`}
            onClick={() => setActiveFilter('legacy')}
          >
            Additional Legacy Designations
          </button>
        </div>

        {/* Standard Alloy Series Cards Grid */}
        {showAllOrSeries && (
          <div className="alloy-series-grid">
            {filteredSeries.map((group) => (
              <div
                key={group.id}
                className={`alloy-card ${group.featured ? 'featured' : ''}`}
              >
                <div className="alloy-card-header">
                  <div className="alloy-series-badge-row">
                    <span className="alloy-series-tag">{group.series}</span>
                    <span className="alloy-count-tag">{group.grades.length} Grades</span>
                  </div>
                  <h3 className="alloy-card-title">{group.name}</h3>
                  <p className="alloy-card-desc">{group.description}</p>
                </div>

                <div className="alloy-grades-container">
                  <span className="alloy-grades-label">Supported Grade Designations</span>
                  <div className="alloy-chips-wrap">
                    {group.grades.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        className="alloy-chip"
                        title={`Click to enquire about Alloy ${grade}`}
                        onClick={() => onSelectAlloy(`Alloy Grade ${grade} (${group.series})`)}
                      >
                        <span className="alloy-chip-dot"></span>
                        <span>{grade}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="alloy-card-footer">
                  <button
                    type="button"
                    className="alloy-card-btn"
                    onClick={() => onSelectAlloy(`${group.series} Extrusion Solutions`)}
                  >
                    <span>Enquire for {group.series}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Separate Section: Additional Alloy Designations (Legacy Standards) */}
        {(showLegacyOnly || activeFilter === 'all') && (
          <div className="alloy-legacy-panel" id="legacy-alloy-designations">
            <div className="alloy-legacy-header">
              <div className="alloy-legacy-title-area">
                <span className="alloy-legacy-badge">Specialized Standards</span>
                <h3 className="alloy-legacy-title">Additional Alloy Designations</h3>
                <p className="alloy-legacy-desc">
                  Recognized legacy designations and proprietary industrial reference codes verified in regional technical references. Customers can enquire regarding tooling compatibility, billet conversion, and press parameters for any of the listed designations.
                </p>
              </div>
              <div className="alloy-legacy-action">
                <a
                  href="#consultation"
                  className="btn btn-outline-dark"
                  onClick={() => onSelectAlloy('Legacy Alloy Designations Inquiry')}
                >
                  <span>Request Legacy Sourcing</span>
                </a>
              </div>
            </div>

            <div className="alloy-legacy-grid">
              {LEGACY_DESIGNATIONS.map((code) => (
                <button
                  key={code}
                  type="button"
                  className="alloy-legacy-chip"
                  title={`Click to enquire about legacy code ${code}`}
                  onClick={() => onSelectAlloy(`Legacy Alloy Code ${code}`)}
                >
                  <span>{code}</span>
                  <span className="chip-sub">Grade</span>
                </button>
              ))}
            </div>

            <div className="alloy-legacy-footer">
              <div className="alloy-note-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="alloy-note-icon">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  <strong>Tip:</strong> Click on any alloy number or legacy designation above to automatically populate your inquiry into the Consultation Form below.
                </span>
              </div>
              <a
                href="#consultation"
                className="btn btn-primary btn-sm"
                onClick={() => onSelectAlloy('Custom Alloy Extrusion Quote')}
              >
                <span>Get an Alloy Quote</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
