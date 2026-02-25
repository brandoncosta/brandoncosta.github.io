/* ─────────────────────────────────────────
   PORTFOLIO — script.js
───────────────────────────────────────── */

/* ─── CUSTOM CURSOR ──────────────────────── */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');

let cx = 0, cy = 0;
let rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  cx = e.clientX;
  cy = e.clientY;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
});

function animateRing() {
  rx += (cx - rx) * 0.11;
  ry += (cy - ry) * 0.11;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Grow cursor on interactive elements
document.querySelectorAll('a, button, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
});

/* ─── NAV — SHRINK ON SCROLL ─────────────── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  highlightActiveNav();
}, { passive: true });

/* ─── NAV — ACTIVE LINK HIGHLIGHT ───────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightActiveNav() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 220) {
      current = s.getAttribute('id');
    }
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ─── SCROLL REVEAL ──────────────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revealObserver.observe(el));

/* ─── CONTACT FORM ───────────────────────── */
// To use with Formspree:
// 1. Sign up at formspree.io and create a form
// 2. Set your form's action attribute to: https://formspree.io/f/YOUR_FORM_ID
// 3. Remove the e.preventDefault() line below so the form submits normally
// 4. Formspree will handle sending the email to you

const form = document.getElementById('contactForm');

form.addEventListener('submit', e => {
  e.preventDefault(); // <-- Remove this line once you add a real form action

  const btn       = form.querySelector('.btn-submit');
  const btnText   = btn.querySelector('span:first-child');
  const original  = btnText.textContent;

  btnText.textContent = 'Sent ✓';
  btn.style.background = 'var(--c-olive)';
  btn.disabled = true;

  setTimeout(() => {
    btnText.textContent = original;
    btn.style.background = '';
    btn.disabled = false;
    form.reset();
  }, 3500);
});

/* ─── MARQUEE — PAUSE ON HOVER ───────────── */
const marqueeTrack = document.getElementById('marqueeTrack');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

/* ─── SMOOTH ANCHOR SCROLL (fallback) ────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
