/* LABG — portada: galería de apps, cifras reales que cuentan al entrar e ilustraciones del héroe.
   La navegación vive en nav.js, los capítulos en chapters.js y la escena 3D en hero-scene.js. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const CATS = window.LABG_CATEGORIAS || {};
  const ARTE = window.LABG_ARTE || {};

  /* ---------- galería: todas las apps en línea, las destacadas primero ---------- */
  function gallery() {
    const track = $('#galTrack');
    const apps = window.LABG_APPS || [];
    const online = apps.filter((a) => a.estado === 'enlinea');
    const n = $('#nOnline'); if (n && online.length) { n.dataset.count = online.length; n.textContent = online.length; }
    const lic = [...new Set(online.map((a) => a.licencia).filter(Boolean))];
    const l = $('#licencia'); if (l && lic.length === 1) l.textContent = lic[0];
    const all = $('#allApps'); if (all && online.length) all.textContent = `Ver las ${online.length} apps →`;
    if (!track || !online.length) return;
    const pick = online.filter((a) => a.destacada).concat(online.filter((a) => !a.destacada));
    track.innerHTML = pick.map((a) => `
      <li><a class="card" href="apps/${esc(a.id.toLowerCase())}/">
        <img class="card-art" src="assets/ilustraciones/${ARTE[a.id] || 'agave'}.svg" alt="" width="120" height="120" loading="lazy">
        <img class="card-iso" src="assets/marca/svg/labg-isotipo.svg" alt="" width="26" height="26" loading="lazy">
        <h3>${esc(a.nombre)}</h3>
        <p>${esc(a.lema)}</p>
        <span class="card-cat">${esc((CATS[a.categoria] || {}).corto || '')}</span>
        <span class="card-go">Abrir <i aria-hidden="true">→</i></span>
      </a></li>`).join('');
    if (finePointer && !reduce) $$('.card', track).forEach(tilt);
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

  /* ---------- cifras: cuentan de 0 a su valor al entrar en pantalla ---------- */
  function figures() {
    const nums = $$('[data-count]');
    const grid = $('.figures-grid');
    if (!grid) return;
    $$('.figures-grid > div, .closing h2, .closing .btn').forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i % 4) * 90 + 'ms'; });
    const show = () => {
      $$('.reveal').forEach((el) => el.classList.add('in'));
      if (reduce) return;
      nums.forEach((b) => {
        const to = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now(), dur = 1400;
        if (!to) return;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
          b.textContent = Math.round(to * e) + suf;
          if (k < 1) requestAnimationFrame(step);
        };
        b.textContent = '0' + suf;
        requestAnimationFrame(step);
      });
    };
    if (reduce || !('IntersectionObserver' in window)) { $$('.reveal').forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); show(); } }, { threshold: 0.35 });
    io.observe(grid);
    const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } }), { threshold: 0.2 });
    $$('.closing .reveal').forEach((el) => io2.observe(el));
  }

  /* ilustraciones del héroe: se descargan después de la carga y se desplazan un poco con el ratón */
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
      if (scrollY > innerHeight) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        box.style.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        box.style.setProperty('--py', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
      });
    }, { passive: true });
  }

  function start() {
    flora();
    gallery();
    figures();
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    document.dispatchEvent(new Event('labg:gallery'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
