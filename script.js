/* ================================================================
   ANG KANDILA NA HINDI NATUTUPOK
   Interactive 3D Birthday Photo Book — Para kay Sis. Mayet
   script.js — Full implementation
================================================================ */

'use strict';

/* ----------------------------------------------------------------
   PAGE DATA
   Each entry defines one physical page (front face).
   type: 'cover' | 'text' | 'spread' | 'birthday'
   spread pages: image + poem together, layout alternates L/R
---------------------------------------------------------------- */
const PAGES = [
  /* 0 — Cover (hardcover front) */
  {
    type: 'cover',
    title: 'Ang Kandila Na Hindi Natutupok',
    subtitle: 'Isang Aklat ng Pasasalamat',
    recipient: 'Para kay',
    name: 'Sis. Mayet',
    tag: 'Happy Birthday',
  },

  /* 1 — Intro / Welcome Text */
  {
    type: 'text',
    chapter: 'Paunang Salita',
    heading: 'Ang Liwanag na Nanatili',
    poem: [
      'May mga taong dumadaan sa buhay ko',
      'na hindi ko inaasahan —',
      'ngunit ang kanilang pagdaan',
      'ay nagbabago ng lahat.',
      'Isa ka sa mga iyon.',
    ],
  },

  /* 2 — Photo 1 + Poem Part 2 */
  {
    type: 'spread',
    layout: 'normal',   /* image left, poem right */
    chapter: 'Kabanata I',
    photo: '1.png',
    caption: 'Sa mga pasilyo ng simbahan…',
    poem: [
      'Sa mga pasilyo ng simbahan,',
      'sa bawat salitang iyong ibinuhos —',
      'hindi mo alam na itinanim mo',
      'ang isang bagay na tumubo sa loob ko.',
    ],
  },

  /* 3 — Photo 2 + Poem Part 3 */
  {
    type: 'spread',
    layout: 'reverse',  /* poem left, image right */
    chapter: 'Kabanata II',
    photo: '2.png',
    caption: 'Walang hinihingi, walang hinahanap…',
    poem: [
      'Hindi mo hiningi ang pagpapahalaga,',
      'hindi mo hinanap ang papuri —',
      'ibinuhos mo lang ang iyong buhay',
      'para sa iba,',
      'nang buong katahimikan.',
    ],
  },

  /* 4 — Photo 3 + Poem Part 4 */
  {
    type: 'spread',
    layout: 'normal',
    chapter: 'Kabanata III',
    photo: '3.png',
    caption: 'Ang unang aral…',
    poem: [
      'Iyon ang unang aral mo sa akin —',
      'ang pagmamahal na walang ingay,',
      'ang paglilingkod na hindi naghahanap',
      'ng anumang kapalit.',
    ],
  },

  /* 5 — Photo 4 + Poem Part 5 */
  {
    type: 'spread',
    layout: 'reverse',
    chapter: 'Kabanata IV',
    photo: '4.png',
    caption: 'Ang bakas ng iyong pamumuhay…',
    poem: [
      'Ngayon,',
      'nakatingin ako sa kung sino na ako —',
      'at nakikita ko ang bakas ng iyong pamumuhay',
      'sa paraan ng aking panalangin,',
      'sa paraan ng aking pakikinig sa iba.',
    ],
  },

  /* 6 — Photo 5 + Poem Part 6 */
  {
    type: 'spread',
    layout: 'normal',
    chapter: 'Kabanata V',
    photo: '5.png',
    caption: 'Ang larawan ng bokasyon…',
    poem: [
      'Ikaw ang larawan ng bokasyon',
      'na hindi ko lubos na maipaliwanag —',
      'ang pagpili ng isang bagay na mas dakila',
      'at ang pagiging bukas-palad dito.',
    ],
  },

  /* 7 — Photo 6 + Final Poem */
  {
    type: 'spread',
    layout: 'reverse',
    chapter: 'Pagtatapos',
    photo: '6.png',
    caption: '…at hindi mo ito nalaman kundi ngayon.',
    poem: [
      'Salamat —',
      'hindi dahil kailangan mong marinig ito,',
      'kundi dahil kailangan kong sabihin —',
      '',
      'Na ang buhay mo',
      'ay nagsilbing liwanag',
      'sa isang batang naghahanap ng direksiyon,',
      'at hindi mo ito nalaman',
      'kundi ngayon.',
    ],
  },

  /* 8 — Birthday Message */
  {
    type: 'birthday',
    heading: 'Maligayang Kaarawan,',
    name: 'Sis. Mayet.',
    message: [
      'Maraming salamat sa pagiging isang ilaw na tahimik ngunit patuloy na nagbibigay-liwanag sa buhay ng iba.',
      'Nawa\'y pagpalain ka pa ng Panginoon ng masaganang biyaya, mabuting kalusugan, at walang hanggang kagalakan.',
    ],
    credits: '✦ Ginawa nang may pasasalamat at pagmamahal ✦',
  },
];

/* ----------------------------------------------------------------
   STATE
---------------------------------------------------------------- */
let currentPage = 0;           // index into PAGES visible right now
let isFlipping   = false;
let isMusicOn    = false;
let isFullscreen = false;
const audio = document.getElementById('bg-music');

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  initParticles();
  buildBook();
  updateUI();
});

/* ----------------------------------------------------------------
   THEME
---------------------------------------------------------------- */
function applyStoredTheme () {
  const saved = localStorage.getItem('mayet-theme') || 'light';
  document.getElementById('app').className = saved === 'dark' ? 'dark-mode' : 'light-mode';
  updateThemeIcon();
}

function toggleTheme () {
  const app = document.getElementById('app');
  const isDark = app.classList.contains('dark-mode');
  app.className = isDark ? 'light-mode' : 'dark-mode';
  localStorage.setItem('mayet-theme', isDark ? 'light' : 'dark');
  updateThemeIcon();
}

function updateThemeIcon () {
  const isDark = document.getElementById('app').classList.contains('dark-mode');
  document.getElementById('theme-icon').textContent = isDark ? '☾' : '☀';
}

/* ----------------------------------------------------------------
   MUSIC
---------------------------------------------------------------- */
function toggleMusic () {
  isMusicOn = !isMusicOn;
  const icon = document.getElementById('music-icon');
  if (isMusicOn) {
    audio.volume = 0;
    audio.play().catch(() => {});
    fadeAudio(0, 0.35, 2000);
    icon.textContent = '♫';
  } else {
    fadeAudio(audio.volume, 0, 1200, () => { audio.pause(); });
    icon.textContent = '♪';
  }
}

function fadeAudio (from, to, ms, cb) {
  const step = (to - from) / (ms / 50);
  let v = from;
  const id = setInterval(() => {
    v += step;
    if ((step > 0 && v >= to) || (step < 0 && v <= to)) {
      audio.volume = Math.max(0, Math.min(1, to));
      clearInterval(id);
      if (cb) cb();
    } else {
      audio.volume = Math.max(0, Math.min(1, v));
    }
  }, 50);
}

/* ----------------------------------------------------------------
   FULLSCREEN
---------------------------------------------------------------- */
function toggleFullscreen () {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    isFullscreen = true;
  } else {
    document.exitFullscreen().catch(() => {});
    isFullscreen = false;
  }
}

/* ----------------------------------------------------------------
   FLOW — Welcome → Intro → Book
---------------------------------------------------------------- */
function startIntro () {
  const welcome = document.getElementById('welcome-overlay');
  const intro   = document.getElementById('intro-screen');

  welcome.classList.remove('active');
  setTimeout(() => {
    intro.setAttribute('aria-hidden', 'false');
    intro.classList.add('active');
    /* Trigger text animations */
    setTimeout(() => {
      intro.querySelector('.intro-content').classList.add('animate');
    }, 80);
  }, 600);
}

function openBook () {
  const intro = document.getElementById('intro-screen');
  const stage = document.getElementById('book-stage');

  intro.classList.remove('active');
  setTimeout(() => {
    intro.setAttribute('aria-hidden', 'true');
    stage.classList.remove('hidden');
    stage.setAttribute('aria-hidden', 'false');
    goToPage(0, false);
  }, 700);
}

function goHome () {
  const stage   = document.getElementById('book-stage');
  const overlay = document.getElementById('welcome-overlay');

  stage.classList.add('hidden');

  /* Reset book to page 0 */
  currentPage = 0;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('flipped', 'animating', 'is-current'));
  document.querySelector('.page')?.classList.add('is-current');
  updateUI();

  setTimeout(() => {
    overlay.classList.add('active');
  }, 500);
}

function replayBook () {
  const cel   = document.getElementById('celebration-overlay');
  const stage = document.getElementById('book-stage');

  cel.classList.remove('active');
  cel.setAttribute('aria-hidden', 'true');

  setTimeout(() => {
    currentPage = 0;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('flipped', 'animating', 'is-current'));
    stage.classList.remove('hidden');
    goToPage(0, false);
  }, 600);
}

/* ----------------------------------------------------------------
   BUILD BOOK — Inject pages into DOM
---------------------------------------------------------------- */
function buildBook () {
  const container = document.getElementById('pages-container');
  container.innerHTML = '';

  PAGES.forEach((data, idx) => {
    const page = document.createElement('div');
    page.className = 'page' + (data.type === 'cover' ? ' cover-page' : '');
    if (data.layout === 'reverse') page.classList.add('reverse');
    if (data.type === 'spread') page.classList.add('spread-page');
    if (data.type === 'text')   page.classList.add('text-page');
    if (data.type === 'birthday') page.classList.add('birthday-page');
    page.dataset.index = idx;

    /* Front face */
    const front = document.createElement('div');
    front.className = 'page-front';
    front.appendChild(buildPageContent(data, idx));

    /* Back face (decorative — shows reverse of next page's spine) */
    const back = document.createElement('div');
    back.className = 'page-back';
    back.appendChild(buildBackContent(idx));

    page.appendChild(front);
    page.appendChild(back);
    container.appendChild(page);

    /* Lazy-load images */
    const img = page.querySelector('img[data-src]');
    if (img) observeImage(img);
  });

  /* Build progress dots */
  buildDots();
}

function buildPageContent (data, idx) {
  const inner = document.createElement('div');
  inner.className = 'page-inner';

  switch (data.type) {

    case 'cover': {
      inner.innerHTML = `
        <div class="cover-border"  aria-hidden="true"></div>
        <div class="cover-border-inner" aria-hidden="true"></div>
        <div class="cover-inner text-content">
          <div class="cover-floral" aria-hidden="true">✿ ✦ ✿</div>
          <h1 class="cover-title">${escHtml(data.title)}</h1>
          <div class="page-deco" aria-hidden="true">— ✦ —</div>
          <p class="cover-recipient">${escHtml(data.recipient)}</p>
          <p class="cover-name">${escHtml(data.name)}</p>
          <p class="cover-bday">${escHtml(data.tag)}</p>
        </div>`;
      break;
    }

    case 'text': {
      const lines = data.poem.map(l => `<p>${escHtml(l) || '&nbsp;'}</p>`).join('');
      inner.innerHTML = `
        <div class="text-content" style="width:100%;max-width:420px;">
          <div class="page-chapter" aria-label="${escHtml(data.chapter)}">${escHtml(data.chapter)}</div>
          <h2 class="page-title-large">${escHtml(data.heading)}</h2>
          <div class="page-deco" aria-hidden="true">— ✦ —</div>
          <div class="page-poem" lang="tl">${lines}</div>
        </div>`;
      break;
    }

    case 'spread': {
      const lines = data.poem.map(l => `<p>${escHtml(l) || '&nbsp;'}</p>`).join('');
      inner.innerHTML = `
        <div class="photo-col">
          <div class="photo-frame">
            <img
              data-src="${escHtml(data.photo)}"
              alt="${escHtml(data.caption)}"
              loading="lazy"
              width="380"
              height="300"
            />
          </div>
          <p class="photo-caption">${escHtml(data.caption)}</p>
        </div>
        <div class="poem-col">
          <div class="page-chapter" aria-label="${escHtml(data.chapter)}">${escHtml(data.chapter)}</div>
          <div class="page-poem" lang="tl">${lines}</div>
        </div>`;
      break;
    }

    case 'birthday': {
      const msg = data.message.map(m => `<p>${escHtml(m)}</p>`).join('');
      inner.innerHTML = `
        <div class="text-content" style="width:100%;text-align:center;">
          <div class="bday-icon" aria-hidden="true">🕯️</div>
          <h2 class="bday-heading">${escHtml(data.heading)}</h2>
          <p class="bday-name">${escHtml(data.name)}</p>
          <div class="page-deco" aria-hidden="true">✦ ✦ ✦</div>
          <div class="bday-message" lang="tl">${msg}</div>
          <p class="bday-credits">${escHtml(data.credits)}</p>
        </div>`;
      break;
    }
  }

  return inner;
}

function buildBackContent (idx) {
  const inner = document.createElement('div');
  inner.className = 'page-inner';
  inner.style.justifyContent = 'center';
  inner.style.alignItems = 'center';
  inner.innerHTML = `
    <div style="opacity:0.12;color:var(--gold);font-size:1.5rem;letter-spacing:0.5em;">✦</div>`;
  return inner;
}

/* ----------------------------------------------------------------
   LAZY IMAGE LOADING
---------------------------------------------------------------- */
const imageObserver = window.IntersectionObserver
  ? new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          loadImg(e.target);
          imageObserver.unobserve(e.target);
        }
      });
    }, { rootMargin: '200px' })
  : null;

function observeImage (img) {
  if (imageObserver) {
    imageObserver.observe(img);
  } else {
    loadImg(img);
  }
}

function loadImg (img) {
  const src = img.dataset.src;
  if (!src) return;
  const tmp = new Image();
  tmp.onload  = () => { img.src = src; img.classList.add('loaded'); };
  tmp.onerror = () => {
    /* Placeholder on error */
    img.style.background = 'var(--paper-alt)';
    img.style.minHeight  = '140px';
    img.classList.add('loaded');
  };
  tmp.src = src;
}

/* ----------------------------------------------------------------
   PAGE NAVIGATION
---------------------------------------------------------------- */
function nextPage () {
  if (isFlipping || currentPage >= PAGES.length - 1) return;
  goToPage(currentPage + 1);
}

function prevPage () {
  if (isFlipping || currentPage <= 0) return;
  goToPage(currentPage - 1);
}

function goToPage (idx, animate = true) {
  if (idx === currentPage && animate) return;
  const pages = document.querySelectorAll('.page');

  /* Trigger flipping animation for skipped pages */
  const direction = idx > currentPage ? 'forward' : 'backward';

  if (animate) {
    animateFlip(currentPage, idx, direction, pages);
  } else {
    /* Instant reset — flip all pages before idx */
    pages.forEach((p, i) => {
      p.classList.remove('is-current', 'animating');
      if (i < idx) {
        p.classList.add('flipped');
      } else {
        p.classList.remove('flipped');
      }
    });
    currentPage = idx;
    markCurrent(pages, idx);
    updateUI();
  }
}

function animateFlip (from, to, direction, pages) {
  isFlipping = true;

  const step  = direction === 'forward' ? 1 : -1;
  const steps = [];

  if (direction === 'forward') {
    for (let i = from; i < to; i++) steps.push(i);
  } else {
    for (let i = from - 1; i >= to; i--) steps.push(i);
  }

  let delay = 0;
  const STEP_MS = steps.length > 1 ? 160 : 0;

  steps.forEach((pageIdx, si) => {
    const page = pages[pageIdx];
    if (!page) return;
    setTimeout(() => {
      page.classList.add('animating');
      if (direction === 'forward') {
        page.classList.add('flipped');
      } else {
        page.classList.remove('flipped');
      }
    }, delay + si * STEP_MS);
  });

  const totalTime = delay + steps.length * STEP_MS + parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--flip-duration')
      .replace('s','') * 1000
  );

  setTimeout(() => {
    pages.forEach(p => p.classList.remove('animating'));
    currentPage = to;
    markCurrent(pages, to);
    updateUI();
    isFlipping = false;

    /* Show celebration on last page */
    if (currentPage === PAGES.length - 1) {
      setTimeout(showCelebration, 800);
    }
  }, totalTime + 50);
}

function markCurrent (pages, idx) {
  pages.forEach(p => p.classList.remove('is-current'));
  if (pages[idx]) pages[idx].classList.add('is-current');

  /* Pre-load next/prev images */
  [-1, 0, 1, 2].forEach(offset => {
    const target = pages[idx + offset];
    if (!target) return;
    const img = target.querySelector('img[data-src]');
    if (img) loadImg(img);
  });
}

/* ----------------------------------------------------------------
   UI UPDATE (buttons, dots, indicator)
---------------------------------------------------------------- */
function updateUI () {
  const total = PAGES.length;

  document.getElementById('cur-page').textContent   = currentPage + 1;
  document.getElementById('total-pages').textContent = total;

  document.getElementById('btn-prev').disabled = currentPage === 0;
  document.getElementById('btn-next').disabled = currentPage === total - 1;

  /* Dots */
  document.querySelectorAll('.prog-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentPage);
    dot.setAttribute('aria-current', i === currentPage ? 'page' : 'false');
  });
}

function buildDots () {
  const container = document.getElementById('progress-dots');
  container.innerHTML = '';
  PAGES.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className   = 'prog-dot' + (i === 0 ? ' active' : '');
    btn.title       = `Pahina ${i + 1}`;
    btn.setAttribute('aria-label', `Pumunta sa pahina ${i + 1}`);
    btn.onclick     = () => goToPage(i);
    container.appendChild(btn);
  });
}

/* ----------------------------------------------------------------
   CELEBRATION OVERLAY
---------------------------------------------------------------- */
function showCelebration () {
  const overlay = document.getElementById('celebration-overlay');
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  startCelebrationParticles();
}

function startCelebrationParticles () {
  const canvas  = document.getElementById('celebration-canvas');
  const ctx     = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth  || 400;
  canvas.height = canvas.offsetHeight || 600;

  const particles = Array.from({ length: 80 }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height - canvas.height,
    r:    Math.random() * 4 + 1.5,
    vx:   (Math.random() - 0.5) * 0.8,
    vy:   Math.random() * 1.2 + 0.5,
    color: pickCelebColor(),
    alpha: Math.random() * 0.6 + 0.4,
    spin:  (Math.random() - 0.5) * 0.08,
    angle: Math.random() * Math.PI * 2,
  }));

  let animId;
  function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      /* Draw small diamond */
      ctx.moveTo(0, -p.r);
      ctx.lineTo(p.r * 0.6, 0);
      ctx.lineTo(0, p.r);
      ctx.lineTo(-p.r * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;
      p.alpha -= 0.0012;

      if (p.y > canvas.height || p.alpha <= 0) {
        p.x     = Math.random() * canvas.width;
        p.y     = -10;
        p.alpha = Math.random() * 0.6 + 0.4;
        p.color = pickCelebColor();
      }
    });
    animId = requestAnimationFrame(draw);
  }
  draw();

  /* Stop after overlay is dismissed */
  document.getElementById('celebration-overlay').addEventListener('transitionend', () => {
    cancelAnimationFrame(animId);
  }, { once: true });
}

function pickCelebColor () {
  const colors = ['#c9a84c', '#e8d08a', '#f5efe6', '#d4a843', '#fff8dc', '#f0c040'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* ----------------------------------------------------------------
   PARTICLES BACKGROUND
---------------------------------------------------------------- */
function initParticles () {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');

  function resize () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const pts = Array.from({ length: 38 }, () => makeParticle());

  function makeParticle () {
    return {
      x:    Math.random() * (canvas.width  || window.innerWidth),
      y:    Math.random() * (canvas.height || window.innerHeight),
      r:    Math.random() * 2.2 + 0.5,
      vx:   (Math.random() - 0.5) * 0.18,
      vy:   (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.22 + 0.06,
    };
  }

  function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.getElementById('app').classList.contains('dark-mode');
    const color  = isDark ? '201,168,76' : '180,140,80';

    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${p.alpha})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = canvas.width  + 10;
      if (p.x > canvas.width  + 10) p.x  = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y  = -10;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ----------------------------------------------------------------
   KEYBOARD NAVIGATION
---------------------------------------------------------------- */
document.addEventListener('keydown', e => {
  const stage = document.getElementById('book-stage');
  if (stage.classList.contains('hidden')) return;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    nextPage();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    prevPage();
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  } else if (e.key === 'm' || e.key === 'M') {
    toggleMusic();
  }
});

/* ----------------------------------------------------------------
   TOUCH SWIPE SUPPORT
---------------------------------------------------------------- */
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('book-scene').addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.getElementById('book-scene').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    if (dx < 0) nextPage(); else prevPage();
  }
}, { passive: true });

/* ----------------------------------------------------------------
   UTILITY
---------------------------------------------------------------- */
function escHtml (str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
