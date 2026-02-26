/* Brandon Costa — Modal System */

(function () {

  const modal       = document.getElementById('project-modal');
  const modalBg     = document.getElementById('modal-bg');
  const modalClose  = document.getElementById('modal-close');
  const modalThumbs = document.getElementById('modal-thumbs');
  const modalPrev   = document.getElementById('modal-prev');
  const modalNext   = document.getElementById('modal-next');
  const modalCounter= document.getElementById('modal-counter');
  const modalCat    = document.getElementById('modal-cat');
  const modalTitle  = document.getElementById('modal-title');
  const modalYear   = document.getElementById('modal-year');
  const modalRole   = document.getElementById('modal-role');
  const modalDesc   = document.getElementById('modal-desc');
  const modalTags   = document.getElementById('modal-tags');

  let currentImages = [];
  let currentIndex  = 0;
  let isAnimating   = false;

  function getStage() {
    return document.getElementById('modal-img-stage');
  }

  function makeSlide(src) {
    const img = document.createElement('img');
    img.className = 'modal-slide';
    img.src = src;
    img.alt = '';
    return img;
  }

  function showImage(index, direction) {
    if (!currentImages.length) return;
    const next = (index + currentImages.length) % currentImages.length;
    const stage = getStage();

    // First load — no animation
    if (direction === undefined || stage.children.length === 0 || next === currentIndex) {
      currentIndex = next;
      stage.classList.add('no-transition');
      stage.innerHTML = '';
      stage.appendChild(makeSlide(currentImages[currentIndex]));
      stage.style.transform = 'translateX(0)';
      stage.getBoundingClientRect();
      stage.classList.remove('no-transition');
      updateCounter();
      updateThumbs();
      return;
    }

    if (isAnimating) return;
    isAnimating = true;
    currentIndex = next;

    const incoming = makeSlide(currentImages[currentIndex]);

    if (direction === 'next') {
      // Place new slide to the right, then slide left
      stage.appendChild(incoming);
      stage.classList.add('no-transition');
      stage.style.transform = 'translateX(0)';
      stage.getBoundingClientRect();
      stage.classList.remove('no-transition');
      stage.style.transform = 'translateX(-100%)';
    } else {
      // Place new slide to the left, then slide right
      stage.insertBefore(incoming, stage.firstChild);
      stage.classList.add('no-transition');
      stage.style.transform = 'translateX(-100%)';
      stage.getBoundingClientRect();
      stage.classList.remove('no-transition');
      stage.style.transform = 'translateX(0)';
    }

    stage.addEventListener('transitionend', function cleanup() {
      stage.removeEventListener('transitionend', cleanup);
      const slides = stage.querySelectorAll('.modal-slide');
      if (direction === 'next') slides[0].remove();
      else slides[slides.length - 1].remove();
      stage.classList.add('no-transition');
      stage.style.transform = 'translateX(0)';
      stage.getBoundingClientRect();
      stage.classList.remove('no-transition');
      isAnimating = false;
    }, { once: true });

    updateCounter();
    updateThumbs();
  }

  function updateCounter() {
    if (!currentImages.length) { modalCounter.textContent = ''; return; }
    modalCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
  }

  function updateThumbs() {
    document.querySelectorAll('.modal-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === currentIndex);
    });
  }

  function buildThumbs() {
    modalThumbs.innerHTML = '';
    const showNav = currentImages.length > 1;
    modalPrev.style.display = showNav ? '' : 'none';
    modalNext.style.display = showNav ? '' : 'none';

    if (!showNav) { modalThumbs.style.display = 'none'; return; }
    modalThumbs.style.display = '';

    currentImages.forEach((src, i) => {
      const btn = document.createElement('button');
      btn.className = 'modal-thumb' + (i === 0 ? ' active' : '');
      btn.style.backgroundImage = `url(${src})`;
      btn.setAttribute('aria-label', `View image ${i + 1}`);
      btn.addEventListener('click', () => {
        const dir = i > currentIndex ? 'next' : 'prev';
        showImage(i, dir);
      });
      modalThumbs.appendChild(btn);
    });
  }

  function openModal(projectKey) {
    const project = PROJECTS[projectKey];
    if (!project) return;

    currentImages = project.images || [];
    currentIndex  = 0;
    isAnimating   = false;

    modalCat.textContent   = project.category;
    modalTitle.textContent = project.title;
    modalYear.textContent  = project.year;
    modalRole.textContent  = project.role;
    modalDesc.textContent  = project.description;

    modalTags.innerHTML = (project.tags || [])
      .map(t => `<span class="modal-tag">${t}</span>`)
      .join('');

    getStage().innerHTML = '';
    showImage(0);
    buildThumbs();

    modal.classList.add('open');
    document.body.classList.add('modal-open');
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.warp-cell').forEach(cell => {
    cell.addEventListener('click', e => {
      e.preventDefault();
      const key = cell.dataset.project;
      if (key) openModal(key);
    });
  });

  modalBg.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  modalNext.addEventListener('click', () => showImage(currentIndex + 1, 'next'));
  modalPrev.addEventListener('click', () => showImage(currentIndex - 1, 'prev'));

  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowRight') showImage(currentIndex + 1, 'next');
    if (e.key === 'ArrowLeft')  showImage(currentIndex - 1, 'prev');
  });

  let touchStartX = 0;
  document.getElementById('modal-img-wrap').addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  document.getElementById('modal-img-wrap').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) showImage(currentIndex + (dx < 0 ? 1 : -1), dx < 0 ? 'next' : 'prev');
  }, { passive: true });

})();
