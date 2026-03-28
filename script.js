/* ============================================================
   FURNI FIX — script.js
   Navbar scroll | Scroll reveal | WhatsApp form | Counter anim
   ============================================================ */

'use strict';

/* ── HELPERS ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── YEAR ─────────────────────────────────────────────────── */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── PROGRESS BAR ─────────────────────────────────────────── */
const progressBar = $('#progress-bar');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}

/* ── NAVBAR SCROLL STATE ──────────────────────────────────── */
const navbar = $('#navbar');
function updateNavbar() {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* ── SCROLL TO TOP ────────────────────────────────────────── */
const scrollTopBtn = $('#scroll-top');
function updateScrollTop() {
  if (!scrollTopBtn) return;
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
}
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── SCROLL EVENT (throttled) ─────────────────────────────── */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateNavbar();
      updateScrollTop();
      updateProgress();
      revealOnScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// Run on load
updateNavbar();
updateScrollTop();
updateProgress();

/* ── MOBILE MENU ──────────────────────────────────────────── */
const hamburger = $('#hamburger');
const mobileMenu = $('#mobile-menu');
const mobileClose = $('#mobile-close');
const mobileLinks = $$('.mobile-link');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

/* ── SMOOTH SCROLL ────────────────────────────────────────── */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '#!') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH = navbar ? navbar.offsetHeight : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── SCROLL REVEAL ────────────────────────────────────────── */
const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];
const revealEls = $$(revealClasses.join(','));

function revealOnScroll() {
  const vh = window.innerHeight;
  revealEls.forEach((el, i) => {
    if (el.classList.contains('visible')) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < vh - 80) {
      // staggered delay via CSS custom property or data attribute
      const delay = parseFloat(el.style.getPropertyValue('--delay') || el.getAttribute('data-delay') || 0);
      setTimeout(() => el.classList.add('visible'), delay * 1000);
    }
  });
}

// Initial reveal (elements already in view on load)
window.addEventListener('load', () => {
  revealOnScroll();
});
// Also run on DOMContentLoaded in case images haven't loaded
revealOnScroll();

/* ── ANIMATED STAT COUNTERS ───────────────────────────────── */
const statNums = $$('.stat-num');
let countersStarted = false;

function animateCounter(el) {
  const raw = el.textContent.trim();
  const suffix = raw.replace(/[\d.]/g, '');
  const target = parseFloat(raw);
  if (isNaN(target)) return;

  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out quad
    const ease = 1 - (1 - progress) * (1 - progress);
    const current = Math.round(ease * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = raw; // ensure final value exact
  }
  requestAnimationFrame(step);
}

function tryStartCounters() {
  if (countersStarted) return;
  const aboutSection = $('#about');
  if (!aboutSection) return;
  const rect = aboutSection.getBoundingClientRect();
  if (rect.top < window.innerHeight - 100) {
    countersStarted = true;
    statNums.forEach(el => animateCounter(el));
  }
}

window.addEventListener('scroll', tryStartCounters, { passive: true });
window.addEventListener('load', tryStartCounters);

/* ── SERVICE CARD STAGGER ─────────────────────────────────── */
// Apply incremental animation delays to each service card
$$('.service-card').forEach((card, i) => {
  card.style.setProperty('--delay', (i * 0.1) + 's');
  card.style.transitionDelay = (i * 0.08) + 's';
});
$$('.why-card').forEach((card, i) => {
  card.style.setProperty('--delay', (i * 0.08) + 's');
});
$$('.test-card').forEach((card, i) => {
  card.style.setProperty('--delay', (i * 0.12) + 's');
});

/* ── CONTACT FORM + WHATSAPP ──────────────────────────────── */
const form = $('#contact-form');
const fields = {
  name: { el: $('#name'), error: $('#name-error'), validate: v => v.trim().length >= 2 },
  phone: { el: $('#phone'), error: $('#phone-error'), validate: v => v.trim().length >= 8 },
  furniture: { el: $('#furniture'), error: $('#furniture-error'), validate: v => v.trim().length >= 2 },
  problem: { el: $('#problem'), error: $('#problem-error'), validate: v => v.trim().length >= 10 }
};

function showError(field) {
  field.el.classList.add('error');
  field.error.classList.add('show');
}
function clearError(field) {
  field.el.classList.remove('error');
  field.error.classList.remove('show');
}

// Live validation on blur
Object.values(fields).forEach(field => {
  if (!field.el) return;
  field.el.addEventListener('blur', () => {
    if (!field.validate(field.el.value)) {
      showError(field);
    } else {
      clearError(field);
    }
  });
  field.el.addEventListener('input', () => {
    if (field.validate(field.el.value)) {
      clearError(field);
    }
  });
});

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;
    Object.values(fields).forEach(field => {
      if (!field.el) return;
      if (!field.validate(field.el.value)) {
        showError(field);
        valid = false;
      } else {
        clearError(field);
      }
    });

    if (!valid) return;

    const name      = fields.name.el.value.trim();
    const phone     = fields.phone.el.value.trim();
    const furniture = fields.furniture.el.value.trim();
    const problem   = fields.problem.el.value.trim();

    const message =
      `Hello Furni Fix! 🛠️\n` +
      `My name is *${name}*.\n` +
      `Phone: ${phone}\n` +
      `Furniture: ${furniture}\n` +
      `Problem: ${problem}`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/8801717722535?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    form.reset();

    // Brief success flash on button
    const btn = $('#submit-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Opening WhatsApp…`;
      btn.style.background = '#128C7E';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
      }, 3000);
    }
  });
}

/* ── HERO PARALLAX ────────────────────────────────────────── */
const heroBgImg = $('.hero-bg img');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBgImg.style.transform = `translateY(${y * 0.25}px)`;
  }, { passive: true });
}
