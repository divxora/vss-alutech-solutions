import React from 'react';

export const StatsPanel: React.FC = () => {
  return (
    <section className="stats-panel-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="stat-number">5</div>
            <div className="stat-label">Core Service Categories</div>
            <p className="stat-detail">Presses, Furnaces, Troubleshooting, Die Sourcing &amp; Manpower</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-number">360°</div>
            <div className="stat-label">End-to-End Plant Support</div>
            <p className="stat-detail">From greenfield layout design to routine plant operational optimization</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-number">4+</div>
            <div className="stat-label">Manpower Skill Levels</div>
            <p className="stat-detail">Plant management, technical supervisors, press operators &amp; floor crew</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="stat-number">Pan-India</div>
            <div className="stat-label">Equipment &amp; Die Sourcing</div>
            <p className="stat-detail">Independent certified tool room network and machinery sourcing advice</p>
          </div>
        </div>
      </div>
    </section>
  );
};
