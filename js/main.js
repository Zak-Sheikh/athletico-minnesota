/* ===== js/main.js — Athletico Minnesota ===== */

/* Small helpers */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  initHeaderHeightVar();
  initMobileNav();
  initSmoothAnchors();
  initScrollProgress();
  initRevealOnScroll();
  initSectionSpy();
  initTeamsTabMemory();
});

/* -- Set a CSS var for the sticky header height so we can offset scrolls -- */
function initHeaderHeightVar() {
  const header = $('header');
  const set = () => {
    const h = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };
  set();
  window.addEventListener('resize', set, { passive: true });
}

/* -- Smooth anchor scrolling with sticky-header offset -- */
function initSmoothAnchors() {
  const header = $('header');
  const headerH = () =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || (header?.offsetHeight ?? 0);

  const go = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const y    = el.getBoundingClientRect().top + window.pageYOffset;
    const offY = Math.max(0, y - headerH() - 12); // small margin
    window.scrollTo({ top: offY, behavior: 'smooth' });
  };

  // Intercept local anchor clicks
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      e.preventDefault();
      go(id);
      // Update URL hash without jump
      history.pushState(null, '', `#${id}`);
    });
  });

  // If page loads with a hash, adjust position
  if (location.hash) {
    const id = location.hash.slice(1);
    setTimeout(() => go(id), 0);
  }
}

/* -- Top scroll progress bar (Schedules already has .scroll-indicator) -- */
function initScrollProgress() {
  const bar = $('.scroll-indicator'); // present on schedules page
  if (!bar) return;

  const update = () => {
    const sh = document.documentElement.scrollHeight - window.innerHeight;
    const p  = sh > 0 ? (window.scrollY / sh) * 100 : 0;
    bar.style.width = `${p}%`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

/* -- Reveal on scroll for cards/sections -- */
function initRevealOnScroll() {
  const targets = $$(
    '.card, .feature, .training-card, .fixtures-table, .loc-card, .policy-card, .cta-banner, .panel-media, .panel-copy'
  );
  if (!targets.length) return;

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach(t => {
    t.classList.add('pre-reveal');
    io.observe(t);
  });
}

/* -- Section spy (highlights quick-nav pills on Policies while scrolling) -- */
function initSectionSpy() {
  const nav = $('.quick-nav'); // wrapper for the quick nav pills (Policies page)
  if (!nav) return;
  const links = $$('a[href^="#"]', nav);
  const ids   = links.map(a => a.getAttribute('href').slice(1));
  const secs  = ids
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const mark = (id) => {
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  };

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) mark(e.target.id);
      });
    },
    { rootMargin: `-${(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80) + 24}px 0px -60% 0px`, threshold: 0.01 }
  );

  secs.forEach(s => io.observe(s));
}

/* -- Teams: remember which age tab was selected (CSS radios) -- */
function initTeamsTabMemory() {
  // radios exist on /teams.html
  const radios = $$('.age-tab-radio');
  if (!radios.length) return;

  const KEY = 'am_age_tab';
  const saved = localStorage.getItem(KEY);
  if (saved) {
    const r = $(`#${saved}`);
    if (r) r.checked = true;
  }

  radios.forEach(r =>
    r.addEventListener('change', () => {
      if (r.checked) localStorage.setItem(KEY, r.id);
    })
  );
}

/* ===== Optional: enhance <details> accordions if present ===== */
(() => {
  const dets = $$('details');
  if (!dets.length) return;
  dets.forEach(d => {
    d.addEventListener('toggle', () => {
      // Close siblings if you want single-open behavior (uncomment next lines)
      // if (d.open) {
      //   $$('details').forEach(o => { if (o !== d) o.open = false; });
      // }
    });
  });
})();

function initMobileNav() {
  const btn     = document.querySelector('.hamburger');
  const navWrap = document.querySelector('#site-nav');
  const wrapper = document.querySelector('.nav-and-cta'); // NEW
  if (!btn || !navWrap || !wrapper) return;

  const closeNav = () => {
    btn.setAttribute('aria-expanded', 'false');
    navWrap.classList.remove('is-open');
    wrapper.classList.remove('is-open');                 // NEW
    document.body.classList.remove('no-scroll');
  };

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    navWrap.classList.toggle('is-open', !open);
    wrapper.classList.toggle('is-open', !open);          // NEW
    document.body.classList.toggle('no-scroll', !open);
  });

  document.querySelectorAll('#site-nav a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
}


