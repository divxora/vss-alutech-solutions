/**
 * VSS Alutech Solutions - Main JavaScript Bundle
 * High-performance, vanilla JavaScript for industrial B2B website
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. DYNAMIC COPYRIGHT YEAR
  // =========================================================================
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // =========================================================================
  // 2. STICKY HEADER SCROLL EFFECT
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    
    // Header shadow on scroll
    if (siteHeader) {
      if (scrollPos > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollPos > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  // Smooth scroll to top
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // =========================================================================
  // 3. MOBILE NAVIGATION DRAWER
  // =========================================================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileBackdrop = document.getElementById('mobileBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    if (!mobileDrawer || !mobileBackdrop) return;
    mobileDrawer.classList.add('open');
    mobileBackdrop.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer || !mobileBackdrop) return;
    mobileDrawer.classList.remove('open');
    mobileBackdrop.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // =========================================================================
  // 4. INTERSECTION OBSERVER FOR ACTIVE NAV HIGHLIGHTING
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          desktopNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${activeId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -65% 0px'
    });

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  // =========================================================================
  // 5. SERVICE BUTTON PRE-FILL CONSULTATION FORM
  // =========================================================================
  const serviceCtaButtons = document.querySelectorAll('[data-service]');
  const serviceSelect = document.getElementById('serviceRequired');

  serviceCtaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetService = btn.getAttribute('data-service');
      if (serviceSelect && targetService) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].value === targetService) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      }
    });
  });

  // =========================================================================
  // 6. VALIDATION UTILITIES
  // =========================================================================
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  const phoneRegex = /^[+]?[\d\s\-()]{7,18}$/;

  function setFieldError(inputEl, errorEl, message) {
    inputEl.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearFieldError(inputEl, errorEl) {
    inputEl.classList.remove('is-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  // =========================================================================
  // 7. CONSULTATION FORM VALIDATION & HANDLING
  // =========================================================================
  const consultationForm = document.getElementById('consultationForm');
  const formAlert = document.getElementById('formAlert');

  if (consultationForm) {
    const fields = {
      fullName: {
        input: document.getElementById('fullName'),
        error: document.getElementById('fullNameError'),
        validate: (v) => v.trim().length >= 2 ? null : 'Please enter your full name (minimum 2 characters).'
      },
      companyName: {
        input: document.getElementById('companyName'),
        error: document.getElementById('companyNameError'),
        validate: (v) => v.trim().length >= 2 ? null : 'Please enter your company or business name.'
      },
      phoneNumber: {
        input: document.getElementById('phoneNumber'),
        error: document.getElementById('phoneNumberError'),
        validate: (v) => phoneRegex.test(v.trim()) ? null : 'Please enter a valid phone number (7-15 digits).'
      },
      emailAddress: {
        input: document.getElementById('emailAddress'),
        error: document.getElementById('emailAddressError'),
        validate: (v) => emailRegex.test(v.trim()) ? null : 'Please enter a valid business email address.'
      },
      serviceRequired: {
        input: document.getElementById('serviceRequired'),
        error: document.getElementById('serviceRequiredError'),
        validate: (v) => v !== '' ? null : 'Please select the required service category.'
      },
      message: {
        input: document.getElementById('message'),
        error: document.getElementById('messageError'),
        validate: (v) => v.trim().length >= 10 ? null : 'Please provide details about your inquiry (minimum 10 characters).'
      }
    };

    // Live validation cleanup on typing
    Object.keys(fields).forEach(k => {
      const field = fields[k];
      if (field.input) {
        field.input.addEventListener('input', () => {
          if (field.input.classList.contains('is-invalid')) {
            const err = field.validate(field.input.value);
            if (!err) clearFieldError(field.input, field.error);
          }
        });
      }
    });

    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let hasError = false;

      Object.keys(fields).forEach(k => {
        const field = fields[k];
        if (field.input) {
          const err = field.validate(field.input.value);
          if (err) {
            setFieldError(field.input, field.error, err);
            hasError = true;
          } else {
            clearFieldError(field.input, field.error);
          }
        }
      });

      if (hasError) {
        if (formAlert) {
          formAlert.className = 'form-alert error';
          formAlert.textContent = 'Please review and correct the highlighted fields above.';
          formAlert.classList.remove('hidden');
        }
        return;
      }

      // Gather form data for logging/integration
      const formData = {
        fullName: fields.fullName.input.value.trim(),
        companyName: fields.companyName.input.value.trim(),
        phoneNumber: fields.phoneNumber.input.value.trim(),
        emailAddress: fields.emailAddress.input.value.trim(),
        serviceRequired: fields.serviceRequired.input.value,
        projectStage: document.getElementById('projectStage')?.value || 'N/A',
        estimatedRequirement: document.getElementById('estimatedRequirement')?.value.trim() || 'N/A',
        message: fields.message.input.value.trim(),
        submittedAt: new Date().toISOString()
      };

      console.info('Consultation Form Inquiry Captured (Ready for Backend Integration):', formData);

      // Save locally in localStorage for demonstration persistence
      try {
        const existingInquiries = JSON.parse(localStorage.getItem('vss_inquiries') || '[]');
        existingInquiries.push(formData);
        localStorage.setItem('vss_inquiries', JSON.stringify(existingInquiries));
      } catch (err) {
        console.warn('LocalStorage unavailable:', err);
      }

      // Clear form inputs
      consultationForm.reset();

      // Show clear confirmation note without false claims
      if (formAlert) {
        formAlert.className = 'form-alert success';
        formAlert.innerHTML = `
          <strong>Inquiry Form Validated &amp; Logged!</strong><br>
          Thank you, <em>${formData.fullName}</em> (${formData.companyName}). Your inquiry for <strong>${formData.serviceRequired}</strong> has been structured and recorded.<br>
          <small style="display:inline-block; margin-top:6px; color:#064E3B;">
            *Prototype Notice: Frontend validation passed. In production, this form will forward directly to the VSS Alutech email gateway via Formspree, EmailJS, or your internal CRM.
          </small>
        `;
        formAlert.classList.remove('hidden');
      }
    });
  }

  // =========================================================================
  // 8. MANPOWER ENQUIRY FORM VALIDATION
  // =========================================================================
  const manpowerForm = document.getElementById('manpowerEnquiryForm');
  const mpFormAlert = document.getElementById('mpFormAlert');

  if (manpowerForm) {
    const mpFields = {
      designation: {
        input: document.getElementById('mpDesignation'),
        error: document.getElementById('mpDesignationError'),
        validate: (v) => v !== '' ? null : 'Please choose a primary designation.'
      },
      workersCount: {
        input: document.getElementById('mpWorkersCount'),
        error: document.getElementById('mpWorkersCountError'),
        validate: (v) => Number(v) > 0 ? null : 'Please enter a valid worker count (min 1).'
      },
      skillLevel: {
        input: document.getElementById('mpSkillLevel'),
        error: document.getElementById('mpSkillLevelError'),
        validate: (v) => v !== '' ? null : 'Please select required skill level.'
      },
      location: {
        input: document.getElementById('mpLocation'),
        error: document.getElementById('mpLocationError'),
        validate: (v) => v.trim().length >= 2 ? null : 'Please enter plant location.'
      },
      phone: {
        input: document.getElementById('mpPhone'),
        error: document.getElementById('mpPhoneError'),
        validate: (v) => phoneRegex.test(v.trim()) ? null : 'Please enter a valid phone number.'
      },
      email: {
        input: document.getElementById('mpEmail'),
        error: document.getElementById('mpEmailError'),
        validate: (v) => emailRegex.test(v.trim()) ? null : 'Please enter a valid email address.'
      }
    };

    // Live validation cleanup
    Object.keys(mpFields).forEach(k => {
      const field = mpFields[k];
      if (field.input) {
        field.input.addEventListener('input', () => {
          if (field.input.classList.contains('is-invalid')) {
            const err = field.validate(field.input.value);
            if (!err) clearFieldError(field.input, field.error);
          }
        });
      }
    });

    manpowerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let hasError = false;

      Object.keys(mpFields).forEach(k => {
        const field = mpFields[k];
        if (field.input) {
          const err = field.validate(field.input.value);
          if (err) {
            setFieldError(field.input, field.error, err);
            hasError = true;
          } else {
            clearFieldError(field.input, field.error);
          }
        }
      });

      if (hasError) {
        if (mpFormAlert) {
          mpFormAlert.className = 'form-alert error';
          mpFormAlert.textContent = 'Please fill all required manpower specification fields.';
          mpFormAlert.classList.remove('hidden');
        }
        return;
      }

      const mpData = {
        designation: mpFields.designation.input.value,
        workersCount: mpFields.workersCount.input.value,
        skillLevel: mpFields.skillLevel.input.value,
        shift: document.getElementById('mpShift')?.value || 'General Shift',
        duration: document.getElementById('mpDuration')?.value || 'Contract',
        location: mpFields.location.input.value.trim(),
        phone: mpFields.phone.input.value.trim(),
        email: mpFields.email.input.value.trim(),
        requestedAt: new Date().toISOString()
      };

      console.info('Manpower Staffing Inquiry Captured:', mpData);

      manpowerForm.reset();

      if (mpFormAlert) {
        mpFormAlert.className = 'form-alert success';
        mpFormAlert.innerHTML = `
          <strong>Staffing Request Received!</strong><br>
          We have logged your request for <strong>${mpData.workersCount}x ${mpData.designation}</strong> in <em>${mpData.location}</em>.<br>
          <small>*Candidate profiles will be matched based on availability and contractual terms.</small>
        `;
        mpFormAlert.classList.remove('hidden');
      }
    });
  }

  // =========================================================================
  // 9. MODALS (BROCHURE, PRIVACY, TERMS)
  // =========================================================================
  function initModal(modalId, triggerIds, closeId, backdropId) {
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeId);
    const backdrop = document.getElementById(backdropId);
    if (!modal) return;

    function openModal() {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    triggerIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  initModal('brochureModal', ['openBrochureBtn', 'footerBrochureBtn'], 'closeBrochureModal', 'brochureBackdrop');
  initModal('privacyModal', ['openPrivacyModal'], 'closePrivacyModal', 'privacyBackdrop');
  initModal('termsModal', ['openTermsModal'], 'closeTermsModal', 'termsBackdrop');

  // Brochure form download simulation
  const brochureForm = document.getElementById('brochureForm');
  const brochureAlert = document.getElementById('brochureAlert');

  if (brochureForm) {
    brochureForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const brName = document.getElementById('brName');
      const brCompany = document.getElementById('brCompany');
      const brEmail = document.getElementById('brEmail');

      let valid = true;
      if (!brName.value.trim()) {
        document.getElementById('brNameError').textContent = 'Please enter your name.';
        document.getElementById('brNameError').classList.add('visible');
        valid = false;
      }
      if (!brCompany.value.trim()) {
        document.getElementById('brCompanyError').textContent = 'Please enter your company.';
        document.getElementById('brCompanyError').classList.add('visible');
        valid = false;
      }
      if (!emailRegex.test(brEmail.value.trim())) {
        document.getElementById('brEmailError').textContent = 'Please enter a valid email.';
        document.getElementById('brEmailError').classList.add('visible');
        valid = false;
      }

      if (!valid) return;

      if (brochureAlert) {
        brochureAlert.className = 'form-alert success';
        brochureAlert.innerHTML = `
          <strong>Brochure Request Prepared!</strong><br>
          Thank you, ${brName.value}. In production, the technical PDF download is initiated and a copy sent to <em>${brEmail.value}</em>.
        `;
        brochureAlert.classList.remove('hidden');
        brochureForm.reset();
      }
    });
  }

  // =========================================================================
  // 11. TOAST NOTIFICATION HELPER
  // =========================================================================
  const toastContainer = document.getElementById('toastContainer');

  function showToast(title, message, isSuccess = true) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? 'toast-success' : ''}`;
    toast.innerHTML = `
      <div>
        <strong>${title}</strong>
        <div style="font-size:0.8rem; margin-top:2px;">${message}</div>
      </div>
      <button style="color:#FFF; font-size:1.2rem; margin-left:8px;" aria-label="Close">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // =========================================================================
  // 12. PRESS SIZING & TONNAGE ESTIMATOR LOGIC
  // =========================================================================
  const calcBilletSize = document.getElementById('calcBilletSize');
  const calcAlloy = document.getElementById('calcAlloy');
  const calcRecommendedPress = document.getElementById('calcRecommendedPress');
  const calcContainerDia = document.getElementById('calcContainerDia');
  const calcMonthlyOutput = document.getElementById('calcMonthlyOutput');
  const calcMaxCCD = document.getElementById('calcMaxCCD');
  const applyCalcEstimateBtn = document.getElementById('applyCalcEstimateBtn');

  const tonnageRules = {
    '4': {
      press: '660 UST (5.8 MN)',
      container: 'Ø 108 mm (4.25")',
      output: '120 - 180 MT / mo',
      ccd: 'Up to 90 mm profile'
    },
    '5': {
      press: '1,100 UST (9.8 MN)',
      container: 'Ø 133 mm (5.25")',
      output: '250 - 320 MT / mo',
      ccd: 'Up to 150 mm profile'
    },
    '7': {
      press: '1,800 UST (16.0 MN)',
      container: 'Ø 185 mm (7.28")',
      output: '450 - 600 MT / mo',
      ccd: 'Up to 220 mm profile'
    },
    '8': {
      press: '2,500 UST (22.2 MN)',
      container: 'Ø 210 mm (8.27")',
      output: '650 - 850 MT / mo',
      ccd: 'Up to 280 mm profile'
    },
    '10': {
      press: '3,600 UST (32.0 MN)',
      container: 'Ø 262 mm (10.3")',
      output: '950 - 1,250 MT / mo',
      ccd: 'Up to 360 mm profile'
    },
    '12': {
      press: '5,000 UST (44.5 MN)',
      container: 'Ø 315 mm (12.4")',
      output: '1,400 - 1,900 MT / mo',
      ccd: 'Up to 450 mm profile'
    }
  };

  function updatePressCalculator() {
    if (!calcBilletSize || !calcRecommendedPress) return;
    const bSize = calcBilletSize.value;
    const alloy = calcAlloy ? calcAlloy.value : '6063';
    const rule = tonnageRules[bSize] || tonnageRules['5'];

    let pressText = rule.press;
    if (alloy === '6061') {
      pressText += ' (Recommended +15% pressure)';
    } else if (alloy === 'hard') {
      pressText += ' (High Specific Pressure)';
    }

    calcRecommendedPress.textContent = pressText;
    if (calcContainerDia) calcContainerDia.textContent = rule.container;
    if (calcMonthlyOutput) calcMonthlyOutput.textContent = rule.output;
    if (calcMaxCCD) calcMaxCCD.textContent = rule.ccd;
  }

  if (calcBilletSize) calcBilletSize.addEventListener('change', updatePressCalculator);
  if (calcAlloy) calcAlloy.addEventListener('change', updatePressCalculator);

  if (applyCalcEstimateBtn) {
    applyCalcEstimateBtn.addEventListener('click', () => {
      const bSize = calcBilletSize ? calcBilletSize.value : '5';
      const alloy = calcAlloy ? calcAlloy.options[calcAlloy.selectedIndex].text : '6063';
      const rule = tonnageRules[bSize] || tonnageRules['5'];
      const summaryText = `Billet: ${bSize}" | Alloy: ${alloy} | Estimated Press: ${rule.press}`;

      const estInput = document.getElementById('estimatedRequirement');
      const sSelect = document.getElementById('serviceRequired');

      if (estInput) estInput.value = summaryText;
      if (sSelect) {
        for (let i = 0; i < sSelect.options.length; i++) {
          if (sSelect.options[i].value === 'Press Solutions') {
            sSelect.selectedIndex = i;
            break;
          }
        }
      }

      showToast('Calculator Sizing Applied', 'Transferred parameters to Consultation Form below.');

      const consultSec = document.getElementById('consultation');
      if (consultSec) {
        consultSec.scrollIntoView({ behavior: 'smooth' });
        if (estInput) {
          setTimeout(() => estInput.focus(), 600);
        }
      }
    });
  }

  // =========================================================================
  // 13. MANPOWER INTERACTIVE FILTER TABS
  // =========================================================================
  const mpTabBtns = document.querySelectorAll('.mp-tab-btn');
  const mpCards = document.querySelectorAll('.manpower-card[data-category]');

  mpTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mpTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      mpCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('is-hidden');
          card.style.opacity = '1';
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });

  // =========================================================================
  // 14. FAQ ACCORDION LOGIC
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close other items for accordion behavior
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // =========================================================================
  // 15. DRAWING ATTACHMENT SIMULATOR
  // =========================================================================
  const drawingInput = document.getElementById('drawingAttachment');
  const fileUploadText = document.getElementById('fileUploadText');

  if (drawingInput && fileUploadText) {
    drawingInput.addEventListener('change', () => {
      if (drawingInput.files && drawingInput.files.length > 0) {
        const file = drawingInput.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileUploadText.textContent = `Attached: ${file.name} (${fileSizeMB} MB)`;
        showToast('File Attached', `${file.name} ready to submit.`);
      } else {
        fileUploadText.textContent = 'Upload 2D/3D Drawings (.dwg, .dxf, .step, .pdf)';
      }
    });
  }

  // =========================================================================
  // 16. GLOBAL ESCAPE KEY HANDLER FOR DRAWER
  // =========================================================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeDrawer();
      }
    }
  });

  console.info('VSS Alutech Solutions scripts initialized successfully with advanced calculator and FAQ interactions.');
});
