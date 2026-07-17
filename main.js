/* ==========================================================================
   KITOKO HEARTH — MAIN JAVASCRIPT
   Handles: sticky header state, mobile navigation, scroll-reveal animations,
   ember-thread draw-in, testimonial carousel, back-to-top button, project
   modals, and form validation/submission for the registration & contact forms.
   All code is vanilla JS, organized into small, focused functions.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCurrentYear();
  initStickyHeader();
  initMobileNav();
  initScrollReveal();
  initEmberThread();
  initTestimonialCarousel();
  initBackToTop();
  initProjectModals();
  initRegistrationForm();
  initContactForm();
});

/* ---------- Footer year ---------- */
function initCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ---------- Sticky header shadow on scroll ---------- */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const updateHeaderState = () => {
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

/* ---------- Mobile navigation toggle ---------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close the menu whenever a nav link is chosen (mobile only)
  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close the menu on Escape for keyboard users
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

/* ---------- Scroll-triggered reveal animations ---------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!revealEls.length) return;

  // Respect users who prefer reduced motion: reveal everything immediately.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Small stagger so grouped cards feel choreographed, not simultaneous.
          const delay = Math.min(index * 60, 240);
          setTimeout(() => entry.target.classList.add('is-revealed'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- Hero "ember thread" line-draw animation ---------- */
function initEmberThread() {
  const path = document.getElementById('emberPath');
  if (!path) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    path.style.strokeDashoffset = '0';
    return;
  }

  // Trigger the draw-in shortly after load for a deliberate, orchestrated feel.
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      path.style.strokeDashoffset = '0';
    }, 300);
  });
}

/* ---------- Testimonial carousel ---------- */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('testimonial-dots');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.querySelectorAll('.testimonial-slide'));
  if (!slides.length) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex === -1) activeIndex = 0;

  let autoplayTimer = null;

  // Build the dot indicators dynamically based on the number of slides.
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonial-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function updateActiveSlide() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
      dot.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
    });
  }

  function goToSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    updateActiveSlide();
    restartAutoplay();
  }

  function nextSlide() { goToSlide(activeIndex + 1); }
  function prevSlide() { goToSlide(activeIndex - 1); }

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, 7000);
  }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Pause autoplay while a user is interacting with the carousel via keyboard/mouse.
  track.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  track.addEventListener('mouseleave', restartAutoplay);

  updateActiveSlide();
  restartAutoplay();
}

/* ---------- Back-to-top button ---------- */
function initBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  const toggleVisibility = () => {
    button.classList.toggle('is-visible', window.scrollY > 480);
  };

  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Project detail modals ---------- */
function initProjectModals() {
  const triggers = document.querySelectorAll('[data-modal-trigger]');
  if (!triggers.length) return;

  let lastFocusedElement = null;

  const openModal = (modal, trigger) => {
    lastFocusedElement = trigger;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('[data-modal-close]');
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = (modal) => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  };

  triggers.forEach((trigger) => {
    const modalId = trigger.getAttribute('data-modal-trigger');
    const modal = document.getElementById(modalId);
    if (!modal) return;

    trigger.addEventListener('click', () => openModal(modal, trigger));

    modal.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => closeModal(modal));
    });

    // Clicking the dark overlay (outside the modal box) also closes it.
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  // Escape key closes any open modal.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.is-open').forEach(closeModal);
  });
}

/* ---------- Shared form-validation helpers ---------- */

/**
 * Validates a single required field and displays/clears its error message.
 * Returns true if the field is valid.
 */
function validateField(field) {
  const errorEl = document.getElementById(`${field.id}-error`);
  let isValid = true;
  let message = '';

  if (field.hasAttribute('required')) {
    if (field.type === 'checkbox' && !field.checked) {
      isValid = false;
      message = 'This needs to be checked to continue.';
    } else if (field.type !== 'checkbox' && !field.value.trim()) {
      isValid = false;
      message = 'This field is required.';
    }
  }

  if (isValid && field.type === 'email' && field.value.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(field.value.trim())) {
      isValid = false;
      message = 'Enter a valid email address.';
    }
  }

  if (isValid && field.type === 'number' && field.value.trim()) {
    const value = Number(field.value);
    const min = field.min ? Number(field.min) : null;
    const max = field.max ? Number(field.max) : null;
    if ((min !== null && value < min) || (max !== null && value > max)) {
      isValid = false;
      message = `Enter a value between ${field.min} and ${field.max}.`;
    }
  }

  field.classList.toggle('is-invalid', !isValid);
  if (errorEl) errorEl.textContent = isValid ? '' : message;

  return isValid;
}

function attachLiveValidation(form) {
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });
}

/* ---------- Registration form (join.html) ---------- */
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  const statusEl = document.getElementById('registration-status');
  if (!form) return;

  attachLiveValidation(form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      if (statusEl) {
        statusEl.textContent = 'Please fix the highlighted fields before submitting.';
        statusEl.style.color = '#B3261E';
      }
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (statusEl) {
      statusEl.textContent = 'Submitting your application...';
      statusEl.style.color = '';
    }

    // NOTE: In production, replace this simulated delay with an actual fetch()
    // call to Kitoko Hearth's registration endpoint. On success, redirect to
    // confirmation.html as shown below.
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    setTimeout(() => {
      window.location.href = 'confirmation.html';
    }, 700);
  });
}

/* ---------- Contact form (contact.html) ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('contact-status');
  if (!form) return;

  attachLiveValidation(form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      if (statusEl) {
        statusEl.textContent = 'Please fix the highlighted fields before sending.';
        statusEl.style.color = '#B3261E';
      }
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // NOTE: In production, replace this with a real fetch() call to your
    // contact/email endpoint.
    if (statusEl) {
      statusEl.textContent = 'Thanks — your message has been sent. We\u2019ll reply soon.';
      statusEl.style.color = '';
    }
    form.reset();
  });
}
