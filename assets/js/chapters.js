/* LABG — motor de los capítulos guiados por scroll (sin bibliotecas).
   Cada capítulo fijado es una sección alta (--len alturas de pantalla) con un bloque «sticky» dentro;
   aquí solo se mide cuánto se ha recorrido y se publica como --p (0 → 1) en la sección.
   El CSS convierte --p en movimiento del texto; hero-scene.js lee window.LABG_STORY.s para mover la escena:
     s = 0 → 1   la entrada se va            s = k + p   capítulo k (1 Datos, 2 Análisis, 3 Modelos, 4 Decisión)
   Longitud de cada capítulo: el atributo style="--len:…" de su sección en index.html. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ids = ['hero', 'datos', 'analisis', 'modelos', 'decision', 'apps'];
  const story = window.LABG_STORY = { s: 0, fade: 0, rows: [], plot: null };

  let hero, secs = [], apps, stage, gal = null, M = { vh: innerHeight, tops: [], hs: [] };

  /* posición de un elemento dentro de un antecesor posicionado, sin contar transformaciones */
  function offsetIn(el, anc) {
    let x = 0, y = 0;
    while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x, y };
  }

  function measure() {
    M.vh = innerHeight;
    const docTop = (el) => el.getBoundingClientRect().top + scrollY;
    M.tops = secs.map(docTop); M.hs = secs.map((s) => s.offsetHeight);
    M.heroTop = docTop(hero);
    M.appsTop = docTop(apps); M.appsH = apps.offsetHeight;
    /* anclas de las filas de la tabla y del marco de la figura, en la pantalla, con su capítulo fijado */
    const pin1 = $('.ch-pin', secs[0]), pr = pin1.getBoundingClientRect();
    story.rows = $$('.data-table tbody tr', secs[0]).map((tr) => {
      const o = offsetIn(tr, pin1), sc = $('.table-scroll', secs[0]);
      return { x: pr.left + o.x - (sc ? sc.scrollLeft : 0) + Math.min(tr.offsetWidth, sc ? sc.clientWidth : tr.offsetWidth) / 2, y: o.y + tr.offsetHeight / 2 };
    });
    const pin4 = $('.ch-pin', secs[3]), plot = $('#figPlot'), p4 = pin4.getBoundingClientRect(), o4 = offsetIn(plot, pin4);
    story.plot = { x: p4.left + o4.x, y: o4.y, w: plot.offsetWidth, h: plot.offsetHeight };
    galleryMeasure();
  }

  /* ---------- galería: fijada y de lado en escritorio; carrusel con el dedo en lo demás ---------- */
  function galleryMeasure() {
    const vp = $('#galViewport'), track = $('#galTrack');
    if (!vp || !track) return;
    const pin = !reduce && innerWidth > 860 && track.children.length > 2;
    root.classList.toggle('pin-gal', pin);
    if (pin) {
      const dist = Math.max(0, track.scrollWidth - vp.clientWidth);
      gal = { dist };
      apps.style.setProperty('--dist', dist);
      apps.style.setProperty('--gal-h', (M.vh + dist * 1.1) + 'px');   /* 1.1 px de scroll por px de avance */
      M.appsH = M.vh + dist * 1.1;
    } else { gal = null; apps.style.removeProperty('--gal-h'); }
  }

  let raf = 0, lastActive = '';
  function update() {
    raf = 0;
    const y = scrollY, vh = M.vh;
    /* entrada: de 0 a 1 mientras el héroe sube hasta que el primer capítulo se fija */
    let s = clamp01((y - M.heroTop) / Math.max(1, M.tops[0] - M.heroTop));
    secs.forEach((sec, i) => {
      const run = Math.max(1, M.hs[i] - vh), p = clamp01((y - M.tops[i]) / run);
      sec.style.setProperty('--p', p.toFixed(4));
      sec.style.setProperty('--q', clamp01((y - M.tops[i] + vh) / vh).toFixed(4));   /* entrada de la sección */
      if (y >= M.tops[i]) s = i + 1 + p;
    });
    story.s = s;
    /* el escenario 3D se desvanece mientras sale la figura final */
    const end4 = M.tops[3] + M.hs[3] - vh;
    story.fade = clamp01((y - end4) / (vh * 0.6));
    stage.style.setProperty('--stage-o', (1 - story.fade).toFixed(3));
    stage.style.visibility = story.fade >= 1 ? 'hidden' : '';
    /* galería */
    if (gal) {
      const p = clamp01((y - M.appsTop) / Math.max(1, M.appsH - vh));
      apps.style.setProperty('--p', p.toFixed(4));
      apps.style.setProperty('--g', p.toFixed(4));
    }
    /* la cifra del análisis sube con el scroll hasta su valor real */
    if (root.classList.contains('scrolly')) {
      const p2 = +secs[1].style.getPropertyValue('--p') || 0;
      const k = clamp01((p2 - 0.42) / 0.35), v = (VAR * (1 - Math.pow(1 - k, 3))).toFixed(1);
      if (varOut.textContent !== v) varOut.textContent = v;
      secs[3].classList.toggle('framed', (+secs[3].style.getPropertyValue('--p') || 0) > 0.5);
    }
    /* capítulo activo en la sub-barra */
    const probe = y + vh * 0.45;
    let act = 'hero';
    [[M.tops[0], 'datos'], [M.tops[1], 'analisis'], [M.tops[2], 'modelos'], [M.tops[3], 'decision'], [M.appsTop, 'apps']].forEach(([t, id]) => { if (probe >= t) act = id; });
    if (probe > M.appsTop + M.appsH) act = '';
    if (act !== lastActive) {
      lastActive = act;
      $$('.subnav-links a').forEach((a) => (a.dataset.go === act ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
      const sel = $('#subnavSelect'); if (sel && act) sel.value = act;
    }
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

  /* saltar a un capítulo: con la narrativa fijada, al punto donde ya se ve completo */
  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const i = secs.indexOf(el);
    const bars = 48 + 44;
    let top = el.getBoundingClientRect().top + scrollY;
    if (root.classList.contains('scrolly') && i >= 0) top += (el.offsetHeight - M.vh) * 0.72;
    else if (id === 'apps' && gal) top += 0;
    else if (id !== 'hero') top -= bars;
    scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id);
  }

  let VAR = 0, varOut;
  function start() {
    hero = $('#hero'); apps = $('#apps'); stage = $('#stage');
    secs = ['datos', 'analisis', 'modelos', 'decision'].map((id) => document.getElementById(id));
    varOut = $('#varOut');
    const E = window.LABG_EJEMPLO;
    if (E) { VAR = E.varianza[0] + E.varianza[1]; varOut.textContent = VAR.toFixed(1); }

    $$('.subnav-links a, .scroll-cue, .subnav-brand').forEach((a) => a.addEventListener('click', (e) => {
      const id = (a.getAttribute('href') || '').slice(1);
      if (!ids.includes(id)) return;
      e.preventDefault(); goTo(id);
    }));
    const sel = $('#subnavSelect'); if (sel) sel.addEventListener('change', () => goTo(sel.value));

    /* carrusel sin fijar: la barra de progreso sigue al desplazamiento lateral */
    const vp = $('#galViewport');
    vp.addEventListener('scroll', () => { if (!gal) apps.style.setProperty('--g', (vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth)).toFixed(4)); }, { passive: true });
    vp.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault();
      const d = e.key === 'ArrowRight' ? 1 : -1, w = ($('.card', vp) || {}).offsetWidth || 300;
      if (gal) scrollBy({ top: d * w * 1.1, behavior: reduce ? 'auto' : 'smooth' });
      else vp.scrollBy({ left: d * w, behavior: reduce ? 'auto' : 'smooth' });
    });

    /* exportar la figura: la escena la compone; sin escena, se descarga la imagen fija */
    $('#figExport').addEventListener('click', () => {
      if (window.LABG_SCENE && window.LABG_SCENE.exportFigure) { window.LABG_SCENE.exportFigure(); return; }
      const a = document.createElement('a'); a.href = 'assets/capitulos/decision.webp'; a.download = 'labg-figura-ejemplo.webp'; a.click();
    });

    measure(); update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', () => { measure(); schedule(); });
    /* al volverse narrativa (la escena arrancó), las alturas cambian: medir de nuevo */
    let wasScrolly = root.classList.contains('scrolly');
    new MutationObserver(() => {
      const now = root.classList.contains('scrolly');
      if (now !== wasScrolly) { wasScrolly = now; measure(); schedule(); }
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('labg:gallery', () => { measure(); schedule(); });
    addEventListener('load', () => { measure(); schedule(); });
    if (document.fonts) document.fonts.ready.then(() => { measure(); schedule(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
