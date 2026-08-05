const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('.motion-frame').forEach(frame => {
  const video = frame.querySelector('video');
  const soundBtn = frame.querySelector('.motion-sound');
  if (!video || !soundBtn) return;

  soundBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    soundBtn.textContent = video.muted ? 'Sound off' : 'Sound on';
  });
});

document.querySelectorAll('.gallery-scroll').forEach(gallery => {
  const thumbs = Array.from(gallery.querySelectorAll('.gallery-item img'));
  if (!thumbs.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close gallery">&times;</button>
    <button class="lightbox-prev" aria-label="Previous image">&lsaquo;</button>
    <button class="lightbox-next" aria-label="Next image">&rsaquo;</button>
    <div class="lightbox-scroll"></div>
    <p class="lightbox-counter"></p>
  `;
  document.body.appendChild(lightbox);

  const track = lightbox.querySelector('.lightbox-scroll');
  const counter = lightbox.querySelector('.lightbox-counter');

  thumbs.forEach(thumb => {
    const full = document.createElement('img');
    full.src = thumb.currentSrc || thumb.src;
    full.alt = thumb.alt;
    track.appendChild(full);
  });

  const slides = Array.from(track.children);

  function currentIndex() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs((slide.offsetLeft + slide.offsetWidth / 2) - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    return closest;
  }

  function updateCounter() {
    counter.textContent = `${currentIndex() + 1} / ${slides.length}`;
  }

  function goTo(index, behavior) {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    slides[clamped].scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
  }

  function open(index) {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    goTo(index, 'auto');
    updateCounter();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  thumbs.forEach((thumb, i) => {
    thumb.closest('.gallery-item').addEventListener('click', () => open(i));
  });

  const items = Array.from(gallery.children);
  const galleryWrap = gallery.closest('.gallery-wrap');

  function leadingIndex() {
    let idx = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].offsetLeft <= gallery.scrollLeft + 1) idx = i; else break;
    }
    return idx;
  }

  function nextIndex() {
    const visibleRight = gallery.scrollLeft + gallery.clientWidth;
    for (let i = 0; i < items.length; i++) {
      const itemRight = items[i].offsetLeft + items[i].offsetWidth;
      if (itemRight > visibleRight + 1) return i;
    }
    return items.length - 1;
  }

  function prevIndex() {
    const targetLeft = Math.max(0, items[leadingIndex()].offsetLeft - gallery.clientWidth);
    let idx = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].offsetLeft <= targetLeft + 1) idx = i; else break;
    }
    return idx;
  }

  function scrollItemTo(index) {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    gallery.scrollTo({ left: items[clamped].offsetLeft, behavior: 'smooth' });
  }

  if (galleryWrap) {
    const prevBtn = galleryWrap.querySelector('.gallery-prev');
    const nextBtn = galleryWrap.querySelector('.gallery-next');
    if (prevBtn) prevBtn.addEventListener('click', () => scrollItemTo(prevIndex()));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollItemTo(nextIndex()));

    function updateArrowVisibility() {
      const hasOverflow = gallery.scrollWidth > gallery.clientWidth + 1;
      galleryWrap.classList.toggle('no-overflow', !hasOverflow);
    }

    updateArrowVisibility();
    window.addEventListener('resize', updateArrowVisibility);
    thumbs.forEach(thumb => {
      if (!thumb.complete) thumb.addEventListener('load', updateArrowVisibility);
    });
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => goTo(currentIndex() - 1, 'smooth'));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => goTo(currentIndex() + 1, 'smooth'));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === track) close();
  });

  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateCounter, 100);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') goTo(currentIndex() + 1, 'smooth');
    if (e.key === 'ArrowLeft') goTo(currentIndex() - 1, 'smooth');
  });
});
