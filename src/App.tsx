import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { SectorsPage } from './pages/SectorsPage';
import { ContactPage } from './pages/ContactPage';
import { Modals } from './components/Modals';
import { BackToTop } from './components/BackToTop';
import { Toast } from './components/Toast';
import { ToastMessage } from './types';
import { PageRoute } from './types/navigation';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { supabase, isSupabaseConfigured } from './utils/supabase';

function parseRoute(): { page: PageRoute; section?: string } {
  const hash = window.location.hash.replace(/^#/, '');
  const path = window.location.pathname.replace(/^\//, '');

  const identifier = hash || path;

  if (identifier.startsWith('about')) return { page: 'about' };
  if (identifier.startsWith('solutions')) return { page: 'solutions' };
  if (identifier.startsWith('sectors') || identifier.startsWith('industries') || identifier.startsWith('projects')) {
    return { page: 'sectors' };
  }
  if (identifier.startsWith('contact') || identifier.startsWith('consultation')) {
    return { page: 'contact' };
  }
  if (identifier.startsWith('press') || identifier.startsWith('furnace') || identifier.startsWith('trouble') || identifier.startsWith('toolroom') || identifier.startsWith('manpower')) {
    return { page: 'solutions', section: identifier };
  }

  return { page: 'home' };
}

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>(() => parseRoute().page);
  const [targetSection, setTargetSection] = useState<string | undefined>(() => parseRoute().section);

  const [brochureOpen, setBrochureOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // Admin Dashboard State
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedService, setSelectedService] = useState<string>('Aluminium extrusion press solutions');
  const [estimatedRequirement] = useState<string>('');

  const addToast = useCallback((title: string, message: string, isSuccess = true) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, isSuccess }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync document title and canonical URL per page for technical SEO
  useEffect(() => {
    const titles: Record<PageRoute, string> = {
      home: 'VSS Alutech Solutions | Complete Aluminium Extrusion Plant Solutions',
      about: 'About VSS Alutech Solutions | Premier Extrusion Engineering Consultancy',
      solutions: 'Extrusion Plant Machinery, Furnaces & Toolroom Solutions | VSS Alutech',
      sectors: 'Industries We Serve — Architectural, Solar, Automotive & EV | VSS Alutech',
      contact: 'Contact & Request Consultation | VSS Alutech Solutions — Tamkuhiraj, India',
    };

    document.title = titles[currentPage] || titles.home;
  }, [currentPage]);

  // Handle route change
  const handleNavigate = (page: PageRoute, section?: string) => {
    setCurrentPage(page);
    setTargetSection(section);

    if (page === 'contact' && section) {
      setSelectedService(section);
    }

    const routeUrl = page === 'home' ? '/' : `/${page}`;
    try {
      window.history.pushState({ page, section }, '', routeUrl);
    } catch {
      window.location.hash = page === 'home' ? '' : `#${page}`;
    }

    // Smooth scroll to top or target section
    if (!section) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    }
  };

  // Listen to browser Back/Forward (popstate) and hashchange
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRoute();
      setCurrentPage(parsed.page);
      setTargetSection(parsed.section);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Listen for Supabase Auth state change
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setAdminEmail(session.user.email);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setAdminEmail(session.user.email);
        } else {
          setAdminEmail('');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Listen for Admin Portal triggers
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        if (adminEmail) {
          setAdminDashboardOpen(true);
        } else {
          setAdminLoginOpen(true);
        }
      } else if (hash === '#admin-login') {
        setAdminLoginOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [adminEmail]);

  const handleOpenAdmin = () => {
    if (adminEmail) {
      setAdminDashboardOpen(true);
    } else {
      setAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    setAdminLoginOpen(false);
    setAdminDashboardOpen(true);
    addToast('Admin Authenticated', `Welcome, ${email}. Executive portal active.`);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setAdminEmail('');
    setAdminDashboardOpen(false);
    addToast('Logged Out', 'Admin session terminated.');
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  // If Admin Dashboard is active, render executive portal
  if (adminDashboardOpen) {
    return (
      <div className="site-wrapper admin-active-wrapper">
        <AdminDashboard
          adminEmail={adminEmail || 'admin@vssalutech.com'}
          onLogout={handleLogout}
          onClose={() => {
            setAdminDashboardOpen(false);
            if (window.location.hash === '#admin') {
              window.location.hash = '';
            }
          }}
          onNotify={addToast}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="site-wrapper">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenBrochure={() => setBrochureOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Multi-Page Routed View */}
      <main id="main-content" tabIndex={-1}>
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}
        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'solutions' && (
          <SolutionsPage
            initialSection={targetSection}
            onNavigate={handleNavigate}
            onNotify={addToast}
          />
        )}
        {currentPage === 'sectors' && (
          <SectorsPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'contact' && (
          <ContactPage
            selectedService={selectedService}
            estimatedRequirement={estimatedRequirement}
            onNotify={addToast}
          />
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenBrochure={() => setBrochureOpen(true)}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      <Modals
        brochureOpen={brochureOpen}
        privacyOpen={privacyOpen}
        termsOpen={termsOpen}
        onCloseBrochure={() => setBrochureOpen(false)}
        onClosePrivacy={() => setPrivacyOpen(false)}
        onCloseTerms={() => setTermsOpen(false)}
      />

      {adminLoginOpen && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onClose={() => {
            setAdminLoginOpen(false);
            if (window.location.hash === '#admin-login' || window.location.hash === '#admin') {
              window.location.hash = '';
            }
          }}
        />
      )}

      <BackToTop />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
