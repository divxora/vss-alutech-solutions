import React, { useState } from 'react';

const FAQS = [
  {
    id: 1,
    question: 'How does VSS Alutech coordinate with independent tool rooms for die manufacturing?',
    answer:
      'Clients share 2D DWG/DXF drawings, 3D STEP files, alloy requirements, and press specifications with us. We match the profile geometry with vetted, independent certified tool rooms across India that possess specialized wire EDM, CNC machining centers, and vacuum nitriding capabilities. VSS manages the design land calculations, commercial quotations, schedule expediting, and trial inspection reports — ensuring high-accuracy tooling without client trial-and-error.',
  },
  {
    id: 2,
    question: 'What extrusion press tonnage is recommended for new architectural versus solar profile lines?',
    answer:
      'For standard architectural profiles (doors, windows, curtain wall trims) using 6063 alloy, a 5-inch (127 mm) billet press rated at 1,100 UST or 7-inch (178 mm) press rated at 1,800 UST is typically ideal. Solar mounting rails and heavier structural channels frequently utilize 7-inch to 8-inch billet presses (1,800 UST to 2,500 UST) to allow multi-cavity extrusion with high recovery rates. Use our interactive Press Sizing Estimator above or consult our team for tonnage calculations based on your product mix.',
  },
  {
    id: 3,
    question: 'What is the typical operational scope of Plant Troubleshooting?',
    answer:
      'Our plant troubleshooting covers both mechanical and metallurgical challenges: hydraulic pressure fluctuations, container misalignment, profile surface tearing, die lines, extrusion blisters, grain boundary sensitization, and quench table warping. We conduct on-site diagnostics, review log heating and ageing oven temperature profiles, and establish standard operating procedures (SOPs) to reduce scrap rates and boost recovery.',
  },
  {
    id: 4,
    question: 'How are technical manpower and machine operators arranged?',
    answer:
      'Industrial manpower is arranged on contract, project, or shift basis according to customer specifications and geographical location. Candidates undergo practical verification of their extrusion plant background (e.g. experience operating 1,100–3,000 UST presses, hot log shears, or ageing ovens). Placement is subject to local availability, candidate onboarding, and mutually agreed statutory compliance terms.',
  },
  {
    id: 5,
    question: 'Does VSS Alutech manufacture equipment or dies in-house?',
    answer:
      'We are an engineering consultancy, sourcing coordinator, and technical services provider. We work strictly in an advisory and liaison capacity, connecting clients with certified machinery manufacturers and independent tool rooms. This unbiased model ensures we recommend the optimal equipment and tooling for your exact budget and metallurgical goals rather than promoting proprietary equipment.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section bg-light-alt" id="faq">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">COMMON INQUIRIES</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Clear technical insights on our machinery consultancy, die sourcing workflow, plant troubleshooting, and manpower placement.
          </p>
        </div>

        <div className="faq-accordion" id="faqAccordion">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? 'active' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  id={`faqBtn${faq.id}`}
                  aria-controls={`faqAns${faq.id}`}
                >
                  <span>{faq.question}</span>
                  <span className="faq-chevron">{isOpen ? '−' : '+'}</span>
                </button>
                <div
                  className="faq-answer"
                  id={`faqAns${faq.id}`}
                  aria-labelledby={`faqBtn${faq.id}`}
                  style={{ display: isOpen ? 'block' : 'none' }}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
