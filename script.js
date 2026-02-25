/* Brandon Costa — Temple Coffee Roasters */

/* ─── CURSOR ───────────────────────────────────── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
});

(function lerpRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(lerpRing);
})();

document.querySelectorAll('a, button, .warp-cell').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
});
document.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-text'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-text'));
});

/* ─── NAV ──────────────────────────────────────── */
const nav      = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 240) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ─── SCROLL REVEAL ────────────────────────────── */
const revObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('on'); obs.unobserve(en.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ─── WARP GRID ────────────────────────────────── */
/*
  True dock-style warp: instead of scaling cell contents,
  we dynamically rewrite grid-template-columns and
  grid-template-rows on every animation frame so the
  actual grid tracks grow and shrink — cells nearest the
  cursor expand, distant cells compress to compensate,
  keeping total grid size constant.

  COLS: 4 tracks  (indices 0–3)
  ROWS: 3 tracks  (indices 0–2)
  Base track size = 1fr each (equal division)
*/

const warpGrid  = document.querySelector('.warp-grid');
const COLS      = 4;
const ROWS      = 3;
const FRICTION  = 0.13;
const RADIUS    = 1.8;   // influence in cell-widths
const MAX_BOOST = 1.6;   // how much the closest track grows (multiplier on base)

let colWeights = Array(COLS).fill(1);
let rowWeights = Array(ROWS).fill(1);
let colTargets = Array(COLS).fill(1);
let rowTargets = Array(ROWS).fill(1);

let warpActive = false;
let warpMX = 0, warpMY = 0;
let warpRaf = null;

function lerp(a, b, t) { return a + (b - a) * t; }

function easeOut(t) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); }

function computeTrackTargets() {
  const gr = warpGrid.getBoundingClientRect();

  if (!warpActive) {
    colTargets = Array(COLS).fill(1);
    rowTargets = Array(ROWS).fill(1);
    return;
  }

  const cellW = gr.width  / COLS;
  const cellH = gr.height / ROWS;

  // Column targets: based on horizontal distance from cursor to each col center
  colTargets = Array.from({ length: COLS }, (_, ci) => {
    const colCenterX = gr.left + cellW * ci + cellW * 0.5;
    const dx = warpMX - colCenterX;
    const normDist = Math.abs(dx) / (cellW * RADIUS);
    if (normDist >= 1) return 1;
    return 1 + (MAX_BOOST - 1) * easeOut(1 - normDist);
  });

  // Row targets: based on vertical distance from cursor to each row center
  rowTargets = Array.from({ length: ROWS }, (_, ri) => {
    const rowCenterY = gr.top + cellH * ri + cellH * 0.5;
    const dy = warpMY - rowCenterY;
    const normDist = Math.abs(dy) / (cellH * RADIUS);
    if (normDist >= 1) return 1;
    return 1 + (MAX_BOOST - 1) * easeOut(1 - normDist);
  });
}

function applyTrackSizes() {
  const colStr = colWeights.map(w => `${w.toFixed(4)}fr`).join(' ');
  const rowStr = rowWeights.map(w => `${w.toFixed(4)}fr`).join(' ');
  warpGrid.style.gridTemplateColumns = colStr;
  warpGrid.style.gridTemplateRows    = rowStr;
}

function animateWarp() {
  computeTrackTargets();

  let stillMoving = false;

  for (let i = 0; i < COLS; i++) {
    colWeights[i] = lerp(colWeights[i], colTargets[i], FRICTION);
    if (Math.abs(colWeights[i] - colTargets[i]) > 0.001) stillMoving = true;
  }
  for (let i = 0; i < ROWS; i++) {
    rowWeights[i] = lerp(rowWeights[i], rowTargets[i], FRICTION);
    if (Math.abs(rowWeights[i] - rowTargets[i]) > 0.001) stillMoving = true;
  }

  applyTrackSizes();

  if (!warpActive && !stillMoving) {
    warpRaf = null;
    return;
  }
  warpRaf = requestAnimationFrame(animateWarp);
}

function startWarp() {
  if (!warpRaf) warpRaf = requestAnimationFrame(animateWarp);
}

warpGrid.addEventListener('mouseenter', () => {
  warpActive = true;
  startWarp();
});

warpGrid.addEventListener('mousemove', e => {
  warpMX = e.clientX;
  warpMY = e.clientY;
  warpActive = true;
  startWarp();
});

warpGrid.addEventListener('mouseleave', () => {
  warpActive = false;
  startWarp();
});

/* ─── FILTER BAR ───────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const allCells   = document.querySelectorAll('.warp-cell');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    allCells.forEach(cell => {
      cell.classList.toggle('hidden', !(cat === 'all' || cell.dataset.cat === cat));
    });
    // Reset grid track sizes after filter changes the layout
    colWeights = Array(COLS).fill(1);
    rowWeights = Array(ROWS).fill(1);
    applyTrackSizes();
  });
});

/* ─── CONTACT FORM ─────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn   = contactForm.querySelector('.btn-send');
    const label = btn.querySelector('span:first-child');
    const orig  = label.textContent;
    label.textContent = 'Sent ✓';
    btn.disabled = true;
    setTimeout(() => {
      label.textContent = orig;
      btn.disabled = false;
      contactForm.reset();
    }, 3500);
  });
}

/* ─── TICKER ───────────────────────────────────── */
const tickerTrack = document.getElementById('tickerTrack');
if (tickerTrack) {
  tickerTrack.addEventListener('mouseenter', () => tickerTrack.style.animationPlayState = 'paused');
  tickerTrack.addEventListener('mouseleave', () => tickerTrack.style.animationPlayState = 'running');
}
