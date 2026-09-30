/* LABG — portada: barra, apps destacadas, cifras reales y movimiento de la página.
   La escena 3D del héroe vive aparte, en hero-scene.js. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- barra: translúcida al bajar; menú en pantallas chicas ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const toggle = $('#navToggle'), links = $('#navLinks');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open);
    links.classList.toggle('open', open);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  });

  /* ---------- ícono de trazo por área (cada tarjeta lleva el de su app) ---------- */
  const ICON = {
    estadistica: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    agronomia: '<path d="M12 21v-9M12 12c0-4 3-7 8-7 0 5-3 8-8 7zM12 14c0-3-2.5-5.5-7-5.5 0 4 2.5 6.5 7 5.5z"/>',
    genetica: '<path d="M7 3c0 6 10 6 10 12s-10 3-10 6M17 3c0 6-10 6-10 12s10 3 10 6M8.5 7h7M8.5 17h7"/>',
    biogeografia: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    botanica: '<path d="M5 19c9 0 14-5 14-14-9 0-14 5-14 14zM5 19l8-8"/>',
    ciencia: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
  };
  const CATS = window.LABG_CATEGORIAS || {};
  /* cada tarjeta lleva la ilustración del manual de su app (assets/ilustraciones/) */
  const ART = {
    PCAPro: 'pasiflora', AgriDesign: 'planta-jitomate', PhenologyPro: 'manzano', EconomicsPro: 'aguacate',
    BreedingPro: 'chile', BioModellingPro: 'pinonero', ClusteringPro: 'orquidea', PopGeneticsPro: 'uva',
    PollinationPro: 'flor-calabaza', SciMetricsPro: 'chayote-2', GermplasmPro: 'maiz', LeafPro: 'cafe', FloralPro: 'loto',
  };

  function cards() {
    const box = $('#cards');
    const apps = window.LABG_APPS || [];
    const online = apps.filter((a) => a.estado === 'enlinea');
    const n = $('#nOnline'); if (n && online.length) n.textContent = online.length;
    const all = $('#allApps'); if (all && online.length) all.textContent = `Ver las ${online.length} apps →`;
    if (!box || !online.length) return;
    const pick = online.filter((a) => a.destacada).concat(online.filter((a) => !a.destacada)).slice(0, 6);
    box.innerHTML = pick.map((a) => `
      <a class="card reveal${ART[a.id] ? ' has-art' : ''}" href="apps/${esc(a.id.toLowerCase())}/">
        <span class="card-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${ICON[a.categoria] || ICON.ciencia}</svg></span>
        ${ART[a.id] ? `<img class="card-art" src="assets/ilustraciones/${ART[a.id]}.svg" alt="" width="92" height="92" loading="lazy">` : ''}
        <h3>${esc(a.nombre)}</h3>
        <p>${esc(a.lema)}</p>
        <span class="card-cat">${esc((CATS[a.categoria] || {}).corto || '')}</span>
        <span class="card-go">Abrir <i aria-hidden="true">→</i></span>
      </a>`).join('');
    if (finePointer && !reduce) $$('.card', box).forEach(tilt);
  }

  /* inclinación 3D suave y brillo que sigue al cursor */
  function tilt(card) {
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        card.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
      });
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  }

  /* ---------- revelado al bajar ---------- */
  function reveal() {
    const items = $$('.idea, .apps-head, .figures-grid > div, #ideasTitle, .ideas .kicker');
    items.forEach((el) => el.classList.add('reveal'));
    const all = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { all.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    all.forEach((el, i) => { el.style.transitionDelay = (el.classList.contains('card') || el.parentElement.classList.contains('figures-grid') ? (i % 3) * 80 : 0) + 'ms'; io.observe(el); });
  }

  /* ilustraciones del héroe: aparecen al cargar y se desplazan un poco con el ratón (cada una a su profundidad) */
  function flora() {
    const box = $('#flora');
    if (!box) return;
    /* se descargan después de la carga: el logotipo del héroe no comparte la red con ellas */
    const show = () => {
      const imgs = $$('img[data-src]', box);
      imgs.forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
      Promise.all(imgs.map((im) => (im.decode ? im.decode().catch(() => {}) : null)))
        .then(() => requestAnimationFrame(() => box.classList.add('in')));
    };
    if (document.readyState === 'complete') show(); else addEventListener('load', show, { once: true });
    if (reduce || !finePointer) return;
    let raf = 0;
    addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        box.style.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        box.style.setProperty('--py', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
      });
    }, { passive: true });
  }

  function start() {
    flora();
    cards();
    reveal();
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
