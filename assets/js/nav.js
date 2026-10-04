/* LABG — navegación de la portada: barra global con paneles (Apps y Análisis), búsqueda en la barra,
   menú a pantalla completa en teléfonos, sub-barra de capítulos y progreso de lectura.
   Los datos salen de data/apps.js; sin JavaScript, los enlaces llevan a las páginas del catálogo. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = document.documentElement;
  const APPS = window.LABG_APPS || [], CATS = window.LABG_CATEGORIAS || {}, C = window.LABG_CONFIG || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ilustración de cada app: la de la portada de su manual (assets/ilustraciones/) */
  const ARTE = window.LABG_ARTE = {
    PCAPro: 'pasiflora', AgriDesign: 'planta-jitomate', PhenologyPro: 'manzano', EconomicsPro: 'aguacate',
    BreedingPro: 'chile', BioModellingPro: 'pinonero', ClusteringPro: 'orquidea', PopGeneticsPro: 'uva',
    PollinationPro: 'flor-calabaza', SciMetricsPro: 'chayote-2', GermplasmPro: 'maiz', LeafPro: 'cafe', FloralPro: 'loto',
    AnalizaR: 'jitomate', PhylogenyPro: 'papilio', CladisticsPro: 'dalia',
  };
  const art = (a) => `assets/ilustraciones/${ARTE[a.id] || 'agave'}.svg`;
  const ficha = (a) => `apps/${a.id.toLowerCase()}/`;
  const tag = (a) => (a.estado === 'enlinea' ? '' : '<span class="tag">Pronto</span>');

  /* ---------- paneles: por área y por tipo de análisis ---------- */
  const ANALISIS = [
    ['Explorar y probar', { AnalizaR: 'Pruebas, ANOVA y regresión, sin código' }],
    ['Multivariado', { PCAPro: 'ACP, AC, ACM, AFDM y AFM', ClusteringPro: 'Agrupamientos y su validación' }],
    ['Experimentos y campo', { AgriDesign: 'Diseños, ANOVA y comparación de medias', PhenologyPro: 'Grados-día, ETo y balance hídrico' }],
    ['Genética', { BreedingPro: 'Cruzas, heredabilidad y selección', PopGeneticsPro: 'Diversidad, F_ST, AMOVA y estructura', GermplasmPro: 'Vacíos de colecta y colección núcleo' }],
    ['Espacio y evolución', { BioModellingPro: 'Distribución de especies y clima', PollinationPro: 'Flor y polinizador en el mapa', PhylogenyPro: 'Alineamiento, árboles y fechado', CladisticsPro: 'Parsimonia con caracteres morfológicos' }],
    ['Decisión y literatura', { EconomicsPro: 'VAN, TIR y riesgo', SciMetricsPro: 'Bibliometría y redes de autores' }],
  ];
  const item = (a, line) => `<li><a href="${ficha(a)}"><img src="${art(a)}" alt="" width="34" height="34" loading="lazy"><b>${esc(a.nombre)}${tag(a)}</b><span>${esc(line)}</span></a></li>`;
  function fillMegas() {
    const byArea = Object.keys(CATS).map((k, i) => {
      const list = APPS.filter((a) => a.categoria === k);
      return list.length ? `<div class="mega-col" style="--i:${i}"><h3>${esc(CATS[k].corto)}</h3><ul>${list.map((a) => item(a, a.lema)).join('')}</ul></div>` : '';
    }).join('');
    const byId = Object.fromEntries(APPS.map((a) => [a.id, a]));
    const byTipo = ANALISIS.map(([t, m], i) => `<div class="mega-col" style="--i:${i}"><h3>${esc(t)}</h3><ul>${Object.entries(m).filter(([id]) => byId[id]).map(([id, l]) => item(byId[id], l)).join('')}</ul></div>`).join('');
    const all = (n) => `<p class="mega-all" style="--i:${n}"><a class="link-arrow" href="aplicaciones.html">Ver el catálogo completo →</a></p>`;
    $('#megaApps .mega-grid').innerHTML = byArea + all(7);
    $('#megaAnalisis .mega-grid').innerHTML = byTipo + all(7);
  }

  const nav = $('#nav'), dim = $('#navDim');
  let openPanel = null, openTimer = 0, closeTimer = 0;
  function setOpen(btn, open, focusFirst) {
    const panel = $('#' + btn.getAttribute('aria-controls'));
    if (open && openPanel && openPanel !== btn) setOpen(openPanel, false);
    btn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('open', open);
    openPanel = open ? btn : (openPanel === btn ? null : openPanel);
    dim.classList.toggle('on', !!openPanel);
    if (open && focusFirst) { const f = $('a', panel); if (f) setTimeout(() => f.focus(), 60); }
  }
  function closeAll() { if (openPanel) setOpen(openPanel, false); }

  function upgradeTriggers() {
    /* cada enlace con data-mega se vuelve un botón que abre su panel */
    $$('a[data-mega]').forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = a.textContent;
      b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', a.dataset.mega);
      a.replaceWith(b);
      const panel = $('#' + a.dataset.mega);
      b.addEventListener('click', () => setOpen(b, b.getAttribute('aria-expanded') !== 'true'));
      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(b, true, true); }
        if (e.key === 'Escape') { setOpen(b, false); }
      });
      /* al pasar el cursor: abre tras 150 ms y cierra con un respiro al salir */
      const enter = () => { clearTimeout(closeTimer); clearTimeout(openTimer); openTimer = setTimeout(() => setOpen(b, true), openPanel ? 0 : 150); };
      const leave = () => { clearTimeout(openTimer); closeTimer = setTimeout(() => { if (openPanel === b) setOpen(b, false); }, 220); };
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') enter(); });
      b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') leave(); });
      panel.addEventListener('pointerenter', () => clearTimeout(closeTimer));
      panel.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') leave(); });
      /* flechas dentro del panel; Esc vuelve al botón */
      panel.addEventListener('keydown', (e) => {
        const links = $$('a', panel), i = links.indexOf(document.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); setOpen(b, false); b.focus(); }
        else if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); links[(i + 1) % links.length].focus(); }
        else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); if (i <= 0) b.focus(); else links[i - 1].focus(); }
      });
      panel.addEventListener('focusout', (e) => { if (!panel.contains(e.relatedTarget) && e.relatedTarget !== b) setOpen(b, false); });
    });
    dim.addEventListener('click', closeAll);
  }

  /* ---------- búsqueda en la barra: sugiere apps y manuales ---------- */
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function searchIndex() {
    const out = [];
    APPS.forEach((a) => {
      out.push({ t: a.nombre, s: a.lema, href: ficha(a), img: art(a), k: norm([a.nombre, a.lema, a.descripcion, (CATS[a.categoria] || {}).nombre, (a.puntos || []).join(' ')].join(' ')) });
      if (a.estado === 'enlinea' && a.manualPdf) out.push({ t: 'Manual de ' + a.nombre, s: `PDF · ${a.manualMb} MB`, href: `${C.base || ''}/${a.id}/manual/${encodeURIComponent(a.manualPdf)}`, img: 'assets/marca/svg/labg-isotipo.svg', k: norm('manual guia ' + a.nombre + ' ' + a.lema) });
    });
    return out;
  }
  function setupSearch() {
    const btn = $('#searchBtn'), form = $('#navSearch'), input = $('#searchInput'), list = $('#searchList');
    const idx = searchIndex();
    let sel = -1, shown = [];
    const open = () => { closeAll(); root.classList.add('searching'); nav.classList.add('searching'); btn.setAttribute('aria-expanded', 'true'); setTimeout(() => input.focus(), 30); };
    const close = (back) => { nav.classList.remove('searching'); root.classList.remove('searching'); btn.setAttribute('aria-expanded', 'false'); list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); input.value = ''; if (back) btn.focus(); };
    function draw() {
      const q = norm(input.value.trim());
      if (!q) { list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
      const words = q.split(/\s+/);
      shown = idx.filter((r) => words.every((w) => r.k.includes(w))).slice(0, 8);
      sel = -1;
      list.innerHTML = shown.length
        ? shown.map((r, i) => `<li role="presentation"><a id="sr${i}" role="option" aria-selected="false" href="${esc(r.href)}"><img src="${esc(r.img)}" alt="" width="34" height="34"><b>${esc(r.t)}</b><span>${esc(r.s)}</span></a></li>`).join('')
        : `<li class="empty" role="presentation">Sin coincidencias. Pulsa Intro para buscar en el catálogo.</li>`;
      input.setAttribute('aria-expanded', 'true');
    }
    function move(d) {
      if (!shown.length) return;
      sel = (sel + d + shown.length) % shown.length;
      $$('a', list).forEach((a, i) => a.setAttribute('aria-selected', String(i === sel)));
      input.setAttribute('aria-activedescendant', 'sr' + sel);
    }
    btn.addEventListener('click', () => (nav.classList.contains('searching') ? close(true) : open()));
    input.addEventListener('input', draw);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = shown[sel].href; }
    });
    form.addEventListener('focusout', (e) => { if (!form.contains(e.relatedTarget) && e.relatedTarget !== btn) setTimeout(() => { if (!form.contains(document.activeElement)) close(false); }, 120); });
    document.addEventListener('keydown', (e) => {
      const typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || '');
      if (((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        if (getComputedStyle(btn).display === 'none') return;
        e.preventDefault(); open();
      }
      if (e.key === 'Escape') closeAll();
    });
  }

  /* ---------- menú a pantalla completa (teléfonos) ---------- */
  function setupMobile() {
    const t = $('#navToggle'), m = $('#mobileMenu'), x = $('#menuClose');
    const open = () => { m.hidden = false; t.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; setTimeout(() => x.focus(), 30); };
    const close = () => { m.hidden = true; t.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; t.focus(); };
    t.addEventListener('click', open);
    x.addEventListener('click', close);
    m.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {   /* el foco no sale del menú mientras está abierto */
        const f = $$('a, button, input', m), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$('a', m).forEach((a) => a.addEventListener('click', () => { document.body.style.overflow = ''; }));
  }

  /* ---------- barra que se oculta al bajar, sub-barra y progreso de lectura ---------- */
  function setupScroll() {
    const hero = $('#hero'), sub = $('#subnav'), bar = $('#readBar');
    let lastY = scrollY, raf = 0;
    const tick = () => {
      raf = 0;
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--read', max > 0 ? (y / max).toFixed(4) : 0);
      const pastHero = y > hero.offsetHeight - 60;
      sub.classList.toggle('show', pastHero);
      sub.inert = !pastHero;
      const busy = openPanel || nav.classList.contains('searching');
      if (!busy && Math.abs(y - lastY) > 6) {
        root.classList.toggle('nav-hidden', y > lastY && y > 160);
        lastY = y;
      }
      if (y < 20) root.classList.remove('nav-hidden');
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(tick); });
    nav.addEventListener('focusin', () => root.classList.remove('nav-hidden'));
    tick();
  }

  /* ---------- cursor que se ilumina sobre lo interactivo ---------- */
  function setupCursor() {
    const g = $('#cursorGlow');
    if (!g || reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = -100, y = -100, cx = x, cy = y, s = 0.6, ts = 0.6, raf = 0;
    const step = () => {
      cx += (x - cx) * 0.3; cy += (y - cy) * 0.3; s += (ts - s) * 0.2;
      g.style.setProperty('--cx', cx.toFixed(1) + 'px'); g.style.setProperty('--cy', cy.toFixed(1) + 'px'); g.style.setProperty('--cs', s.toFixed(3));
      raf = Math.abs(x - cx) + Math.abs(y - cy) + Math.abs(ts - s) > 0.3 ? requestAnimationFrame(step) : 0;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      const hot = e.target.closest && e.target.closest('a, button, select, input, [role="button"]');
      g.classList.toggle('on', !!hot); ts = hot ? 1.3 : 0.6;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
    document.addEventListener('pointerleave', () => g.classList.remove('on'));
  }

  function start() {
    fillMegas();
    upgradeTriggers();
    setupSearch();
    setupMobile();
    setupScroll();
    setupCursor();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
