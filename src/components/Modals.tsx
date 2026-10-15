import React, { useState, useEffect } from 'react';

interface ModalsProps {
  brochureOpen: boolean;
  privacyOpen: boolean;
  termsOpen: boolean;
  onCloseBrochure: () => void;
  onClosePrivacy: () => void;
  onCloseTerms: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  brochureOpen,
  privacyOpen,
  termsOpen,
  onCloseBrochure,
  onClosePrivacy,
  onCloseTerms,
}) => {
  const [brName, setBrName] = useState('');
  const [brCompany, setBrCompany] = useState('');
  const [brEmail, setBrEmail] = useState('');
  const [brErrors, setBrErrors] = useState<{ name?: string; company?: string; email?: string }>({});
  const [brSuccess, setBrSuccess] = useState(false);

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  const anyOpen = brochureOpen || privacyOpen || termsOpen;

  useEffect(() => {
    if (anyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [anyOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (brochureOpen) onCloseBrochure();
        if (privacyOpen) onClosePrivacy();
        if (termsOpen) onCloseTerms();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [brochureOpen, privacyOpen, termsOpen, onCloseBrochure, onClosePrivacy, onCloseTerms]);

  const handleBrochureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; company?: string; email?: string } = {};

    if (!brName.trim()) errors.name = 'Please enter your name.';
    if (!brCompany.trim()) errors.company = 'Please enter your company.';
    if (!emailRegex.test(brEmail.trim())) errors.email = 'Please enter a valid email.';

    if (Object.keys(errors).length > 0) {
      setBrErrors(errors);
      return;
    }

    setBrErrors({});
    setBrSuccess(true);
  };

  return (
    <>
      {/* Brochure Modal */}
      <div
        className={`modal ${brochureOpen ? 'active' : ''}`}
        id="brochureModal"
        aria-hidden={!brochureOpen}
        role="dialog"
        aria-labelledby="brochureModalTitle"
        style={{ display: brochureOpen ? 'flex' : 'none' }}
      >
        <div className="modal-backdrop" id="brochureBackdrop" onClick={onCloseBrochure}></div>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title" id="brochureModalTitle">Download Solutions Brochure</h3>
              <button
                type="button"
                className="modal-close-btn"
                id="closeBrochureModal"
                onClick={onCloseBrochure}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Download our comprehensive technical overview for aluminium extrusion plant solutions, machinery sourcing, and tool room die coordination.</p>
              
              {!brSuccess ? (
                <form id="brochureForm" className="modal-form" onSubmit={handleBrochureSubmit} noValidate>
                  <div className="form-group">
                    <label htmlFor="brName">Your Name *</label>
                    <input
                      type="text"
                      id="brName"
                      value={brName}
                      onChange={(e) => setBrName(e.target.value)}
                      placeholder="Rajesh Sharma"
                      required
                    />
                    {brErrors.name && <div className="field-error visible">{brErrors.name}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="brCompany">Company Name *</label>
                    <input
                      type="text"
                      id="brCompany"
                      value={brCompany}
                      onChange={(e) => setBrCompany(e.target.value)}
                      placeholder="Apex Extrusions"
                      required
                    />
                    {brErrors.company && <div className="field-error visible">{brErrors.company}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="brEmail">Corporate Email *</label>
                    <input
                      type="email"
                      id="brEmail"
                      value={brEmail}
                      onChange={(e) => setBrEmail(e.target.value)}
                      placeholder="rajesh@apex.com"
                      required
                    />
                    {brErrors.email && <div className="field-error visible">{brErrors.email}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    <span>Download PDF Overview</span>
                  </button>
                </form>
              ) : (
                <div className="form-alert success" id="brochureAlert" style={{ marginTop: '16px' }}>
                  <strong>Brochure Request Prepared!</strong><br />
                  Thank you, {brName}. In production, the technical PDF download is initiated and a copy sent to <em>{brEmail}</em>.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <div
        className={`modal ${privacyOpen ? 'active' : ''}`}
        id="privacyModal"
        aria-hidden={!privacyOpen}
        role="dialog"
        aria-labelledby="privacyModalTitle"
        style={{ display: privacyOpen ? 'flex' : 'none' }}
      >
        <div className="modal-backdrop" id="privacyBackdrop" onClick={onClosePrivacy}></div>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title" id="privacyModalTitle">Privacy Policy</h3>
              <button
                type="button"
                className="modal-close-btn"
                id="closePrivacyModal"
                onClick={onClosePrivacy}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body legal-content">
              <h4>1. Introduction</h4>
              <p>VSS Alutech Solutions is committed to respecting your privacy. This policy outlines how information gathered through consultation forms and technical inquiries is handled.</p>
              <h4>2. Information Collection</h4>
              <p>We collect business contact information (Name, Company, Email, Phone, Project Technical Requirements) solely to provide machinery sourcing, plant consultancy, and die coordination services.</p>
              <h4>3. Confidentiality</h4>
              <p>Proprietary profile drawings, CAD geometries, and factory production metrics are treated with strict confidentiality under commercial non-disclosure principles.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <div
        className={`modal ${termsOpen ? 'active' : ''}`}
        id="termsModal"
        aria-hidden={!termsOpen}
        role="dialog"
        aria-labelledby="termsModalTitle"
        style={{ display: termsOpen ? 'flex' : 'none' }}
      >
        <div className="modal-backdrop" id="termsBackdrop" onClick={onCloseTerms}></div>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title" id="termsModalTitle">Terms &amp; Conditions</h3>
              <button
                type="button"
                className="modal-close-btn"
                id="closeTermsModal"
                onClick={onCloseTerms}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body legal-content">
              <h4>1. Advisory &amp; Sourcing Scope</h4>
              <p>VSS Alutech Solutions provides technical consultancy, machinery evaluation, and sourcing coordination. We do not manufacture extrusion presses or dies directly unless specified by explicit contract.</p>
              <h4>2. Sourcing of Extrusion Dies</h4>
              <p>Extrusion dies are manufactured by independent accredited tool rooms. VSS Alutech Solutions coordinates specifications, commercial quotes, and quality verification as an engineering liaison.</p>
              <h4>3. Manpower Provision</h4>
              <p>Industrial manpower supply is subject to candidate availability, candidate screening, statutory compliance, and specific contractual agreements.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
