/* =====================================================================
   PORTAL LABG — el menú «Apps» como constelación
   ---------------------------------------------------------------------
   SigmaPro, la app insignia, va al centro; las demás apps de la suite se
   reparten a su alrededor, en uno o dos anillos, y una rama curva y delgada
   une cada una con el centro: la suite se lee como un ecosistema. Es la
   misma lista de siempre (data/apps.js) y cada nodo lleva a la misma
   página que el menú anterior: la ficha de la app, apps/<id>/.

   Dónde se edita
     · Las apps: data/apps.js (window.LABG_APPS). Una app nueva aparece sola
       al añadir su bloque. Su lugar alrededor del centro sigue el orden de
       las categorías (window.LABG_CATEGORIAS) y, dentro de cada una, el del
       archivo, así que las apps del mismo campo quedan juntas.
     · La app del centro, los anillos, el alto y la curva de las ramas:
       CONFIG, aquí abajo.
     · Los colores, las letras y los tiempos de la animación: las variables
       --orb-* al principio de assets/css/orbita.css.

   Cómo se ve
     · Escritorio y tableta (más de 860 px): el panel desplegable de «Apps».
       Las posiciones se calculan con trigonometría a partir del ancho del
       panel, y se revisa que ninguna etiqueta tape a otra: si chocan, el
       panel crece y, al final, las letras se achican (versión compacta).
     · Teléfono: en el menú a pantalla completa, «Apps» despliega un árbol
       vertical, con SigmaPro arriba y las demás apps colgando de un tronco.

   Abrir y cerrar —cursor con su pequeño retraso, clic o toque, Esc, clic
   fuera— lo maneja nav.js, igual que el panel «Análisis»; este archivo
   dibuja el contenido, lo acomoda y lo anima. Código propio, sin
   bibliotecas.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- configuración ---------- */
  const CONFIG = {
    centro: 'SigmaPro',     // id (en data/apps.js) de la app que va al centro
    dosAnillosDesde: 13,    // con 13 apps o más alrededor se usan dos anillos intercalados
    alto: 500,              // alto inicial de la constelación, en px (sin la línea de abajo)
    altoMax: 660,           // hasta dónde puede crecer para que nada se encime
    margen: 22,             // aire entre las etiquetas y la orilla del panel, en px
    anilloInterior: 0.56,   // radio del anillo interior, como fracción del exterior
    curva: 0.15,            // cuánto se curva cada rama (0 = recta)
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = window.LABG_I18N || null;                     /* el motor bilingüe del portal */
  const t = (s) => (L ? L.t(s) : s);
  const NS = 'http://www.w3.org/2000/svg';
  /* la misma dirección que tenían los nodos del menú anterior (nav.js) */
  const ficha = (a) => `apps/${a.id.toLowerCase()}/`;
  const arte = (a) => `assets/ilustraciones/${(window.LABG_ARTE || {})[a.id] || 'agave'}.svg`;
  /* el centro lleva la σ del logo de SigmaPro; si fuera otra app, su inicial */
  const glifo = (a) => (a.id === 'SigmaPro' ? 'σ' : a.nombre.charAt(0));

  /* ---------- los datos: el centro y las demás, por categoría ---------- */
  function datos() {
    const APPS = window.LABG_APPS || [], CATS = window.LABG_CATEGORIAS || {};
    const centro = APPS.find((a) => a.id === CONFIG.centro) || APPS[0];
    const orden = Object.keys(CATS);
    const resto = APPS.filter((a) => a !== centro).map((a, k) => ({ a, k }))
      .sort((p, q) => (orden.indexOf(p.a.categoria) - orden.indexOf(q.a.categoria)) || (p.k - q.k))
      .map((p) => p.a);
    return { centro, resto, CATS };
  }

  /* =====================================================================
     1. Escritorio y tableta: la constelación del panel
     ===================================================================== */
  let panel = null, caja = null, D = null;

  function construir() {
    panel = $('#megaApps');
    caja = panel && $('.orbita', panel);
    if (!caja || !window.LABG_APPS) return false;
    D = datos();
    const { centro, resto } = D;
    caja.innerHTML =
      '<svg class="orbita-ramas" aria-hidden="true" focusable="false"></svg>' +
      `<a class="orbita-centro" href="${ficha(centro)}" data-id="${esc(centro.id)}">` +
        '<span class="oc-halo" aria-hidden="true"></span>' +
        `<span class="oc-disco" aria-hidden="true"><span class="oc-glifo">${esc(glifo(centro))}</span><span class="oc-nombre">${esc(centro.nombre)}</span></span>` +
        `<span class="sr-only">${esc(centro.nombre)}</span> <span class="sr-only">${esc(centro.lema)}</span>` +
      '</a>' +
      '<ul class="orbita-nodos" aria-label="Apps de la suite">' +
        resto.map((a, i) =>
          `<li><a class="orbita-nodo" href="${ficha(a)}" data-id="${esc(a.id)}" style="--i:${i}">` +
            '<span class="on-punto" aria-hidden="true"></span>' +
            `<span class="on-nombre">${esc(a.nombre)}</span> <span class="sr-only">${esc(a.lema)}</span>` +
            (a.estado === 'enlinea' ? '' : ' <span class="on-pronto">Pronto</span>') +
          '</a></li>').join('') +
      '</ul>' +
      '<div class="orbita-pie">' +
        '<p class="orbita-info" aria-hidden="true"></p>' +
        '<a class="link-arrow orbita-todas" href="aplicaciones.html">Ver el catálogo completo →</a>' +
      '</div>';
    info(null);
    return true;
  }

  /* la línea de abajo: qué es la app que tiene el cursor o el foco (nombre, campo y para qué sirve) */
  function info(a) {
    const p = $('.orbita-info', caja);
    if (!p) return;
    if (!a) {
      p.innerHTML = `<b>${esc(D.centro.nombre)}</b> <span>${esc(t('al centro; alrededor, las apps de la suite. Pasa el cursor por una para ver para qué sirve.'))}</span>`;
      return;
    }
    const cat = (D.CATS[a.categoria] || {}).corto;
    p.innerHTML = `<img src="${esc(arte(a))}" alt="" width="26" height="26">` +
      `<b>${esc(a.nombre)}</b>` + (cat ? ` <span class="oi-cat">${esc(t(cat))}</span>` : '') +
      ` <span class="oi-lema">${esc(t(a.lema))}</span>`;
  }

  /* ---------- acomodar: posiciones, choques y ramas ---------- */
  function disponer() {
    if (!caja || !caja.isConnected) return;
    const W = caja.clientWidth;
    if (!W) return;                       /* el panel no se ve (teléfono): nada que medir */
    const nodos = $$('.orbita-nodo', caja);
    /* nunca más alto que la ventana: el panel cuelga de la barra */
    const tope = Math.max(360, Math.min(CONFIG.altoMax, innerHeight - 48 - 64 - 24));
    let H = Math.min(CONFIG.alto, tope), compacta = false;
    caja.classList.remove('compacta');
    for (let intento = 0; intento < 14; intento++) {
      colocar(nodos, W, H);
      if (!choques(nodos)) break;
      if (H + 30 <= tope) H += 30;
      else if (!compacta) { compacta = true; caja.classList.add('compacta'); H = Math.min(CONFIG.alto, tope); }
      else break;                         /* lo mejor posible con este tamaño */
    }
    ramas(nodos, W, H);
  }

  /* cada app en su anillo: ángulo parejo desde arriba, en el sentido del reloj; con dos anillos, una sí y una no */
  function colocar(nodos, W, H) {
    const n = nodos.length, dos = n >= CONFIG.dosAnillosDesde;
    const anchoEtq = Math.max(0, ...nodos.map((a) => $('.on-nombre', a).offsetWidth));
    const cx = W / 2, cy = H / 2;
    /* las etiquetas no pasan del margen lateral de la página (el mismo del logotipo) */
    const orilla = Math.max(CONFIG.margen, parseFloat(getComputedStyle(caja).paddingLeft) || 0);
    const rxE = Math.max(150, cx - anchoEtq - 16 - orilla), ryE = cy - 36;
    const rxI = rxE * CONFIG.anilloInterior, ryI = ryE * CONFIG.anilloInterior;
    caja.style.setProperty('--orb-alto', H + 'px');
    const centro = $('.orbita-centro', caja);
    centro.style.left = cx + 'px'; centro.style.top = cy + 'px';
    nodos.forEach((a, i) => {
      const th = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const fuera = !dos || i % 2 === 1;
      const x = cx + (fuera ? rxE : rxI) * Math.cos(th), y = cy + (fuera ? ryE : ryI) * Math.sin(th);
      const c = Math.cos(th);
      /* la etiqueta va hacia afuera: a la derecha, a la izquierda, arriba o abajo del punto */
      a.dataset.lado = c > 0.26 ? 'der' : c < -0.26 ? 'izq' : Math.sin(th) < 0 ? 'arr' : 'aba';
      a.style.left = x.toFixed(1) + 'px'; a.style.top = y.toFixed(1) + 'px';
      /* para la entrada: cada nodo llega desde un poco más cerca del centro */
      const d = Math.hypot(x - cx, y - cy) || 1;
      a.style.setProperty('--orb-dx', (((cx - x) / d) * 14).toFixed(1) + 'px');
      a.style.setProperty('--orb-dy', (((cy - y) / d) * 14).toFixed(1) + 'px');
      a._xy = [x, y];
      a._lejos = dos && fuera;            /* rama larga: cruza entre dos nodos del anillo interior */
    });
    caja._c = [cx, cy];
  }

  /* ¿alguna etiqueta toca otra, un punto ajeno, el centro o la orilla? */
  function choques(nodos) {
    const R = caja.getBoundingClientRect();
    const dentro = (r) => ({ l: r.left - R.left, t: r.top - R.top, r: r.right - R.left, b: r.bottom - R.top });
    const se = (p, q, h = 3) => p.l < q.r + h && q.l < p.r + h && p.t < q.b + h && q.t < p.b + h;
    const etq = nodos.map((a) => dentro($('.on-nombre', a).getBoundingClientRect()));
    const pun = nodos.map((a) => dentro($('.on-punto', a).getBoundingClientRect()));
    const cen = dentro($('.oc-halo', caja).getBoundingClientRect());
    for (let i = 0; i < etq.length; i++) {
      const e = etq[i];
      if (e.l < 4 || e.t < 4 || e.r > R.width - 4 || e.b > R.height - 4) return true;
      if (se(e, cen, 6)) return true;
      for (let j = 0; j < etq.length; j++) {
        if (j === i) continue;
        if (j > i && se(e, etq[j])) return true;
        if (se(e, pun[j], 2)) return true;
      }
    }
    return false;
  }

  /* una rama por app: curva de Bézier desde el halo del centro hasta el punto, todas con el mismo giro.
     Las del anillo interior hacen una «C» suave. Las del exterior salen con el mismo giro y luego se
     enderezan (una «S» apenas marcada): así, a media rama, pasan justo por la mitad del hueco entre
     sus dos vecinos del anillo interior, en lugar de rozar uno de sus puntos. */
  function ramas(nodos, W, H) {
    const svg = $('.orbita-ramas', caja), [cx, cy] = caja._c;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const r0 = $('.oc-halo', caja).offsetWidth / 2 + 2;
    svg.innerHTML = nodos.map((a, i) => {
      const [x, y] = a._xy, dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const sx = cx + ux * r0, sy = cy + uy * r0, ex = x - ux * 6, ey = y - uy * 6;
      const k = CONFIG.curva * d, nx = -uy * k, ny = ux * k;
      /* [posición a lo largo de la rama, desvío] de los dos puntos de control */
      const [p1, m1, p2, m2] = a._lejos ? [0.3, 0.8, 0.7, -0.6] : [0.38, 1, 0.72, 0.55];
      const c1x = sx + (ex - sx) * p1 + nx * m1, c1y = sy + (ey - sy) * p1 + ny * m1;
      const c2x = sx + (ex - sx) * p2 + nx * m2, c2y = sy + (ey - sy) * p2 + ny * m2;
      const f = (v) => v.toFixed(1);
      return `<path class="orbita-rama" data-id="${esc(a.dataset.id)}" style="--i:${i}" d="M${f(sx)} ${f(sy)} C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(ex)} ${f(ey)}"/>`;
    }).join('');
    /* el largo de cada rama, para «dibujarla» desde el centro al abrir */
    $$('.orbita-rama', svg).forEach((p) => p.style.setProperty('--orb-largo', Math.ceil(p.getTotalLength()) + 1));
  }

  /* ---------- resaltar: la rama, el nodo y su descripción; lo demás se atenúa ---------- */
  function activar(id) {
    $$('.orbita-nodo.activo, .orbita-rama.activa', caja).forEach((n) => n.classList.remove('activo', 'activa'));
    caja.classList.remove('enfoque', 'en-centro');
    if (!id) { info(null); return; }
    if (id === D.centro.id) {             /* el centro: todas sus ramas a la vez */
      caja.classList.add('en-centro');
      info(D.centro);
      return;
    }
    const a = D.resto.find((x) => x.id === id);
    if (!a) return;
    caja.classList.add('enfoque');
    $$(`[data-id="${CSS.escape(id)}"]`, caja).forEach((n) => n.classList.add(n.tagName === 'path' ? 'activa' : 'activo'));
    info(a);
  }

  function enlazar() {
    const sobre = (e) => { const n = e.target.closest && e.target.closest('.orbita-nodo, .orbita-centro'); activar(n ? n.dataset.id : null); };
    caja.addEventListener('pointerover', sobre);
    caja.addEventListener('pointerleave', () => { if (!caja.contains(document.activeElement)) activar(null); });
    caja.addEventListener('focusin', sobre);
    caja.addEventListener('focusout', (e) => { if (!caja.contains(e.relatedTarget)) activar(null); });
    /* cada vez que se abre: acomodar de nuevo (el ancho pudo cambiar) y repetir la entrada */
    new MutationObserver(() => {
      if (panel.classList.contains('open')) { caja.classList.remove('quieto'); disponer(); }
      else { activar(null); }
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    let espera = 0;
    addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => { caja.classList.add('quieto'); disponer(); }, 120); });
    /* las letras del sitio cambian el ancho de las etiquetas: acomodar cuando lleguen */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(disponer);
  }

  /* =====================================================================
     2. Teléfono: el árbol vertical del menú a pantalla completa
     ===================================================================== */
  function construirArbol() {
    const enlace = $('#mobileMenu a[data-arbol]');
    if (!enlace || !window.LABG_APPS) return;
    const { centro, resto } = D || datos();
    const li = enlace.closest('li');
    /* el enlace al catálogo se vuelve un botón que despliega el árbol (sin JavaScript sigue siendo el enlace) */
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mm-apps'; b.textContent = enlace.textContent;
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'mmArbol');
    enlace.replaceWith(b);
    const arbol = document.createElement('div');
    arbol.className = 'arbol'; arbol.id = 'mmArbol'; arbol.hidden = true;
    arbol.innerHTML =
      `<a class="arbol-centro" href="${ficha(centro)}"><span class="oc-disco" aria-hidden="true"><span class="oc-glifo">${esc(glifo(centro))}</span></span>` +
        `<span class="ar-txt"><b>${esc(centro.nombre)}</b><small>${esc(centro.lema)}</small></span></a>` +
      '<ul class="arbol-ramas" aria-label="Apps de la suite">' +
        resto.map((a, i) => `<li style="--i:${i}"><a href="${ficha(a)}"><span class="ar-punto" aria-hidden="true"></span>` +
          `<span class="ar-txt"><b>${esc(a.nombre)}</b><small>${esc(a.lema)}</small></span></a></li>`).join('') +
      '</ul>' +
      '<a class="link-arrow arbol-todas" href="aplicaciones.html">Ver el catálogo completo →</a>';
    li.appendChild(arbol);
    b.addEventListener('click', () => {
      const abre = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(abre));
      arbol.hidden = !abre;
      if (abre) { arbol.classList.remove('crece'); void arbol.offsetWidth; arbol.classList.add('crece'); }
    });
    /* al cerrar el menú, el árbol vuelve a plegarse */
    const menu = $('#mobileMenu');
    new MutationObserver(() => { if (menu.hidden) { b.setAttribute('aria-expanded', 'false'); arbol.hidden = true; } })
      .observe(menu, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------- arranque ---------- */
  function start() {
    if (construir()) { disponer(); enlazar(); }
    construirArbol();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
