import React, { useEffect } from 'react';
import { PressSolutions } from '../components/PressSolutions';
import { FurnaceSolutions } from '../components/FurnaceSolutions';
import { Troubleshooting } from '../components/Troubleshooting';
import { ToolRoomDies } from '../components/ToolRoomDies';
import { ManpowerSupplier } from '../components/ManpowerSupplier';
import { PageRoute } from '../types/navigation';

interface SolutionsPageProps {
  initialSection?: string;
  onNavigate: (page: PageRoute, targetSection?: string) => void;
  onNotify: (title: string, message: string, isSuccess?: boolean) => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  initialSection,
  onNavigate,
  onNotify,
}) => {
  useEffect(() => {
    if (initialSection) {
      setTimeout(() => {
        const el = document.getElementById(initialSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [initialSection]);

  const scrollToSubSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectService = (serviceName: string) => {
    onNavigate('contact', serviceName);
  };

  const handleApplyEstimate = (estimate: string) => {
    onNotify('Calculator Sizing Saved', `Transferred ${estimate} to your consultation inquiry.`);
    onNavigate('contact', 'Aluminium extrusion press solutions');
  };

  return (
    <div className="page-solutions">
      {/* Page Header */}
      <section className="page-hero-header">
        <div className="container">
          <span className="section-tag">ENGINEERING CATALOGUE &bull; TURNKEY CAPABILITIES</span>
          <h1 className="page-main-title">Aluminium Extrusion Plant Solutions</h1>
          <p className="page-lead-narrative">
            From extrusion press sizing and multi-zone thermal furnaces to precision die correction networks and skilled operational crews — discover our end-to-end industrial capabilities.
          </p>
        </div>
      </section>

      {/* Sticky Solutions Sub-Navigation Bar */}
      <div className="solutions-subnav-bar">
        <div className="container subnav-container">
          <button
            type="button"
            className="subnav-btn"
            onClick={() => scrollToSubSection('press-solutions')}
          >
            01. PRESS MACHINERY
          </button>
          <button
            type="button"
            className="subnav-btn"
            onClick={() => scrollToSubSection('furnace-solutions')}
          >
            02. FURNACE SYSTEMS
          </button>
          <button
            type="button"
            className="subnav-btn"
            onClick={() => scrollToSubSection('plant-troubleshooting')}
          >
            03. PLANT MAINTENANCE
          </button>
          <button
            type="button"
            className="subnav-btn"
            onClick={() => scrollToSubSection('toolroom-dies')}
          >
            04. TOOLROOM &amp; DIES
          </button>
          <button
            type="button"
            className="subnav-btn"
            onClick={() => scrollToSubSection('manpower-supplier')}
          >
            05. MANPOWER SUPPLY
          </button>
        </div>
      </div>

      {/* 01. Press Solutions */}
      <PressSolutions
        onSelectService={handleSelectService}
        onApplyEstimate={handleApplyEstimate}
      />

      {/* 02. Furnace Solutions */}
      <FurnaceSolutions onSelectService={handleSelectService} />

      {/* 03. Troubleshooting & Maintenance */}
      <Troubleshooting onSelectService={handleSelectService} />

      {/* 04. Tool Room & Dies */}
      <ToolRoomDies onSelectService={handleSelectService} />

      {/* 05. Manpower Supplier */}
      <ManpowerSupplier onNotify={onNotify} />

      {/* Bottom CTA */}
      <section className="solutions-bottom-cta">
        <div className="container text-center">
          <span className="section-tag">CUSTOM SIZING &bull; ON-SITE AUDITS</span>
          <h2 className="section-title">Require Custom Engineering Specifications?</h2>
          <p className="section-subtitle">
            Submit your billet dimensions, alloy grades, and expected monthly metric tonnage to receive a tailored equipment sizing proposal.
          </p>
          <div style={{ marginTop: '28px' }}>
            <button
              type="button"
              className="btn-architectural-dark"
              onClick={() => onNavigate('contact')}
            >
              <span>Request Custom Proposal</span>
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
