import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServiceOverview } from './components/ServiceOverview';
import { StatsPanel } from './components/StatsPanel';
import { PressSolutions } from './components/PressSolutions';
import { FurnaceSolutions } from './components/FurnaceSolutions';
import { Troubleshooting } from './components/Troubleshooting';
import { ToolRoomDies } from './components/ToolRoomDies';
import { ManpowerSupplier } from './components/ManpowerSupplier';
import { AlloyGrades } from './components/AlloyGrades';
import { ProcessRoadmap } from './components/ProcessRoadmap';
import { IndustriesServed } from './components/IndustriesServed';
import { FeaturedProjects } from './components/FeaturedProjects';
import { FaqSection } from './components/FaqSection';
import { ConsultationSection } from './components/ConsultationSection';
import { Footer } from './components/Footer';
import { Modals } from './components/Modals';
import { BackToTop } from './components/BackToTop';
import { Toast } from './components/Toast';
import { ToastMessage } from './types';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [estimatedRequirement, setEstimatedRequirement] = useState<string>('');

  const addToast = useCallback((title: string, message: string, isSuccess = true) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, isSuccess }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // IntersectionObserver to sync active nav link
  useEffect(() => {
    const sectionIds = [
      'press-solutions',
      'furnace-solutions',
      'plant-troubleshooting',
      'toolroom-dies',
      'manpower-supplier',
      'alloy-grades',
      'process',
      'industries',
      'projects',
      'faq',
      'consultation',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
    const el = document.getElementById('consultation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyEstimate = (estimate: string) => {
    setSelectedService('Press Solutions');
    setEstimatedRequirement(estimate);
    addToast('Calculator Sizing Applied', 'Transferred parameters to Consultation Form below.');
    const el = document.getElementById('consultation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = document.getElementById('estimatedRequirement');
        if (input) input.focus();
      }, 600);
    }
  };

  const handleSelectAlloy = (alloyDescription: string) => {
    setSelectedService('Aluminium Alloy Consultation');
    setEstimatedRequirement(`Inquiry for: ${alloyDescription}`);
    addToast('Alloy Grade Selected', `${alloyDescription} added to Consultation Form.`);
    const el = document.getElementById('consultation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = document.getElementById('estimatedRequirement');
        if (input) input.focus();
      }, 600);
    }
  };

  return (
    <div className="site-wrapper">
      <Header
        onOpenBrochure={() => setBrochureOpen(true)}
        activeSection={activeSection}
      />

      <main>
        <Hero />
        <ServiceOverview />
        <StatsPanel />
        <PressSolutions
          onSelectService={handleSelectService}
          onApplyEstimate={handleApplyEstimate}
        />
        <FurnaceSolutions onSelectService={handleSelectService} />
        <Troubleshooting onSelectService={handleSelectService} />
        <ToolRoomDies onSelectService={handleSelectService} />
        <ManpowerSupplier onNotify={addToast} />
        <AlloyGrades onSelectAlloy={handleSelectAlloy} />
        <ProcessRoadmap />
        <IndustriesServed />
        <FeaturedProjects />
        <FaqSection />
        <ConsultationSection
          selectedService={selectedService}
          estimatedRequirement={estimatedRequirement}
          onNotify={addToast}
        />
      </main>

      <Footer
        onOpenBrochure={() => setBrochureOpen(true)}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
      />

      <Modals
        brochureOpen={brochureOpen}
        privacyOpen={privacyOpen}
        termsOpen={termsOpen}
        onCloseBrochure={() => setBrochureOpen(false)}
        onClosePrivacy={() => setPrivacyOpen(false)}
        onCloseTerms={() => setTermsOpen(false)}
      />

      <BackToTop />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
