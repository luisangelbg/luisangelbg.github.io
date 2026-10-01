/* LABG — lógica del portal. Cada página tiene <body data-page="...">.
   No necesitas editar este archivo para agregar apps, entradas o publicaciones:
   eso se hace en la carpeta data/. */
(function () {
  "use strict";
  const C = window.LABG_CONFIG || {};
  const APPS = window.LABG_APPS || [];
  const CATS = window.LABG_CATEGORIAS || {};
  const PUBS = window.LABG_PUBLICACIONES || [];
  const POSTS = (window.LABG_BLOG || []).slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  /* ---------- Enlaces de cada app ---------- */
  const U = {
    app: (a) => `${C.base}/${a.id}/`,
    repo: (a) => `${C.github}/${a.id}`,
    zip: (a) => `${C.github}/${a.id}/archive/refs/heads/main.zip`,
    pdf: (a) => a.manualPdf ? `${C.base}/${a.id}/manual/${encodeURIComponent(a.manualPdf)}` : "",
    html: (a) => a.manualHtml ? `${C.base}/${a.id}/manual/es/manual-completo.html` : "",
    doi: (d) => `https://doi.org/${d}`,
    ficha: (a) => `apps/${a.id.toLowerCase()}/`,
    post: (p) => `blog/${p.slug}/`,
    shot: (a) => `assets/apps/${a.id}.webp`
  };
  const online = (a) => a.estado === "enlinea";

  /* ---------- Iconos (SVG en línea) ---------- */
  const I = {
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    doc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    down: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14"/></svg>',
    code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 17-5-5 5-5m8 0 5 5-5 5"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    moon: '<svg class="i-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg class="i-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
    grid: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
    list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    quote: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
  };

  /* ---------- Tema claro / oscuro ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  const saved = store("labg-tema");
  if (saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
  const curTheme = () => document.documentElement.getAttribute("data-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function paintTheme() {
    const b = $("#themeBtn"); if (!b) return;
    const dark = curTheme() === "dark";
    const tip = dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro";
    b.setAttribute("aria-label", tip); b.title = tip; b.setAttribute("aria-pressed", dark);
  }
  function toggleTheme() {
    const next = curTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store("labg-tema", next);
    paintTheme();
  }

  /* ---------- Aviso breve ---------- */
  let toastT;
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function copy(text, done) {
    const ok = () => toast(done || "Copiado");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, () => fallback());
    } else fallback();
    function fallback() {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { toast("Selecciona el texto y cópialo manualmente"); }
      ta.remove();
    }
  }


  /* ---------- Buscador global (apps, publicaciones y blog) ---------- */
  function buildIndex() {
    const ix = [];
    APPS.forEach((a) => ix.push({ k: "app", t: a.nombre, s: a.lema, x: norm([a.nombre, a.id, a.lema, a.descripcion, a.puntos.join(" "), (CATS[a.categoria] || {}).nombre].join(" ")), h: U.ficha(a), on: online(a) }));
    PUBS.forEach((p) => ix.push({ k: "pub", t: p.titulo, s: `${p.revista}, ${p.anio}`, x: norm([p.titulo, p.autores, p.revista, p.tema, p.anio].join(" ")), h: p.doi ? U.doi(p.doi) : (p.url || "publicaciones.html"), ext: true }));
    POSTS.forEach((p) => ix.push({ k: "post", t: p.titulo, s: p.resumen, x: norm([p.titulo, p.resumen, p.etiquetas.join(" ")].join(" ")), h: U.post(p) }));
    return ix;
  }
  /* Ventana nativa (<dialog> con showModal): retiene el foco, deja inerte el
     resto de la página y se cierra con Esc. El campo sigue el patrón de
     cuadro combinado: las flechas mueven la opción activa sin sacar el foco. */
  let INDEX = null, sdlg = null;
  function openSearch() {
    if (!sdlg) {
      INDEX = buildIndex();
      sdlg = document.createElement("dialog");
      sdlg.className = "sdlg"; sdlg.setAttribute("aria-label", "Buscar en el sitio");
      sdlg.innerHTML = `<div class="sbox">
        <div class="search sinput">${I.search}<input id="sq" type="search" placeholder="Buscar apps, publicaciones y entradas…" autocomplete="off"
          role="combobox" aria-expanded="true" aria-controls="sres" aria-autocomplete="list" aria-label="Buscar en el sitio">
          <button type="button" class="icon-btn sclose" aria-label="Cerrar el buscador">${I.close}</button></div>
        <div class="sres" id="sres" role="listbox" aria-label="Resultados"></div>
        <p class="sempty" id="sempty" hidden></p>
        <p class="sr-only" id="scount" aria-live="polite"></p>
        <div class="shint"><span><kbd>↑</kbd><kbd>↓</kbd> moverse</span><span><kbd>↵</kbd> abrir</span><span><kbd>Esc</kbd> cerrar</span><span><kbd>Ctrl</kbd>+<kbd>K</kbd> o <kbd>/</kbd> abrir el buscador</span></div>
      </div>`;
      document.body.appendChild(sdlg);
      const inp = $("#sq", sdlg), res = $("#sres", sdlg), empty = $("#sempty", sdlg), count = $("#scount", sdlg);
      const KIND = { app: "Aplicación", pub: "Publicación", post: "Blog" };
      let sel = 0;
      function draw() {
        const q = norm(inp.value.trim());
        const words = q.split(/\s+/).filter(Boolean);
        let list = words.length ? INDEX.filter((r) => words.every((w) => r.x.includes(w))) : INDEX.filter((r) => r.k === "app").slice(0, 8);
        list = list.sort((a, b) => ({ app: 0, post: 1, pub: 2 }[a.k] - { app: 0, post: 1, pub: 2 }[b.k])).slice(0, 12);
        sel = 0;
        res.innerHTML = list.map((r, i) => `<a class="sitem" id="sopt${i}" role="option" tabindex="-1" href="${r.h}"${r.ext ? ' target="_blank" rel="noopener"' : ""}>
          <span class="skind skind-${r.k}">${KIND[r.k]}</span><span class="stext"><b>${esc(r.t)}</b><small>${esc(r.s)}</small></span>${r.k === "app" && r.on === false ? '<span class="chip chip-soon">Próximamente</span>' : ""}</a>`).join("");
        res.hidden = !list.length;
        empty.hidden = !!list.length;
        empty.innerHTML = list.length ? "" : `Nada coincide con «${esc(inp.value)}». Prueba con otra palabra o <a href="aplicaciones.html">recorre el catálogo</a>.`;
        count.textContent = words.length ? (list.length ? `${list.length} resultado${list.length === 1 ? "" : "s"}` : "Sin resultados") : "";
        mark();
      }
      function mark() {
        const items = res.querySelectorAll(".sitem");
        items.forEach((el, i) => el.setAttribute("aria-selected", i === sel));
        if (items[sel]) { inp.setAttribute("aria-activedescendant", items[sel].id); items[sel].scrollIntoView({ block: "nearest" }); }
        else inp.removeAttribute("aria-activedescendant");
      }
      inp.addEventListener("input", draw);
      inp.addEventListener("keydown", (e) => {
        const items = res.querySelectorAll(".sitem");
        if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); mark(); }
        if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); }
        if (e.key === "Home" && e.ctrlKey) { e.preventDefault(); sel = 0; mark(); }
        if (e.key === "Enter" && items[sel]) { e.preventDefault(); items[sel].click(); }
      });
      $(".sclose", sdlg).addEventListener("click", () => sdlg.close());
      sdlg.addEventListener("click", (e) => { if (e.target === sdlg) sdlg.close(); });
      /* al cerrar, el navegador devuelve el foco a donde estaba */
      sdlg.addEventListener("close", () => document.documentElement.classList.remove("no-scroll"));
    }
    if (sdlg.open) return;
    const inp = $("#sq", sdlg); inp.value = ""; inp.dispatchEvent(new Event("input"));
    sdlg.showModal(); document.documentElement.classList.add("no-scroll");
    inp.focus();
  }

  /* ---------- Cabecera y pie ---------- */
  const NAV = [
    ["index.html", "Inicio", "inicio"],
    ["aplicaciones.html", "Aplicaciones", "aplicaciones"],
    ["descargas.html", "Descargas", "descargas"],
    ["publicaciones.html", "Publicaciones", "publicaciones"],
    ["blog.html", "Blog", "blog"],
    ["acerca.html", "Acerca de", "acerca"]
  ];
  function header(page) {
    const cur = page === "app" ? "aplicaciones" : page;
    const h = document.createElement("header");
    h.className = "top";
    h.innerHTML = `<div class="wrap">
      <a class="brand" href="index.html">
        <img class="brand-mark" src="assets/marca/svg/labg-isotipo.svg" alt="" width="35" height="40">
        <span class="brand-text"><b>${esc(C.sitio)} Suite</b><span>${esc(C.subtitulo)}</span></span><span class="sr-only"> (inicio)</span>
      </a>
      <nav class="nav" id="nav" aria-label="Principal">
        ${NAV.map(([href, label, key]) => `<a href="${href}"${key === cur ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <div class="top-tools">
        <button class="icon-btn search-btn" type="button" id="searchBtn" aria-label="Buscar en el sitio" aria-keyshortcuts="Control+K /" title="Buscar (Ctrl+K)">${I.search}<span class="search-label">Buscar</span><kbd class="search-kbd" aria-hidden="true"></kbd></button>
        <button class="icon-btn theme-btn" type="button" id="themeBtn">${I.moon}${I.sun}</button>
        <button class="icon-btn menu-btn" type="button" id="menuBtn" aria-label="Abrir el menú" aria-controls="nav" aria-expanded="false">${I.menu}</button>
      </div></div>`;
    const ph = $("#hdr"); if (ph) ph.replaceWith(h); else document.body.prepend(h);
    $("#themeBtn").addEventListener("click", toggleTheme);
    paintTheme();
    $("#searchBtn").addEventListener("click", openSearch);
    addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      const typing = /input|textarea|select/i.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); }
    });
    /* menú del celular: se abre con el botón y se cierra con Esc, al tocar fuera o al elegir */
    const nav = $("#nav"), mb = $("#menuBtn");
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      mb.setAttribute("aria-expanded", open);
      mb.setAttribute("aria-label", open ? "Cerrar el menú" : "Abrir el menú");
    };
    mb.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); mb.focus(); } });
    document.addEventListener("click", (e) => { if (nav.classList.contains("open") && !h.contains(e.target)) setMenu(false); });
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  }
  function footer() {
    const f = document.createElement("footer");
    f.className = "foot";
    const year = new Date().getFullYear();
    const ext = (href, label) => `<li><a href="${href}" target="_blank" rel="noopener">${label}<span class="sr-only"> (abre otra pestaña)</span><svg class="ext" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a></li>`;
    const areas = Object.entries(CATS).map(([k, c]) => `<li><a href="aplicaciones.html#${k}">${esc(c.corto)}</a></li>`).join("");
    f.innerHTML = `<div class="wrap">
      <div class="foot-grid">
        <div class="foot-about">
          <p class="foot-name">${esc(C.sitio)} Suite</p>
          <p class="foot-desc">Aplicaciones científicas libres para la investigación y la docencia en ciencias agrícolas y biológicas. Corren en el navegador y tus datos no salen de tu computadora.</p>
          <p class="foot-count">${APPS.length} aplicaciones · ${APPS.filter(online).length} en línea · ${APPS.filter((a) => a.doi).length} con DOI</p>
        </div>
        <nav aria-labelledby="ft-sitio"><h2 class="foot-h" id="ft-sitio">Sitio</h2><ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></nav>
        <nav aria-labelledby="ft-areas"><h2 class="foot-h" id="ft-areas">Áreas</h2><ul>${areas}</ul></nav>
        <div><h2 class="foot-h">Identificadores</h2><ul>
          ${ext(esc(C.github), "Código (GitHub)")}
          ${ext(`https://orcid.org/${esc(C.orcid)}`, "ORCID")}
          ${C.researchgate ? ext(esc(C.researchgate), "ResearchGate") : ""}
          ${ext(`https://zenodo.org/search?q=${encodeURIComponent('"' + C.autor + '"')}`, "Versiones con DOI (Zenodo)")}
        </ul></div>
      </div>
      <div class="foot-bottom">
        <span>© ${year} ${esc(C.autor)} · Las aplicaciones se distribuyen como software libre (GPL/AGPL).</span>
        <span>Sin anuncios, sin cuentas y sin rastreo</span>
        <a class="foot-top" href="#main">Volver arriba ↑</a>
      </div>
    </div>`;
    document.body.appendChild(f);
    /* «Volver arriba» funciona igual con la etiqueta base de las fichas */
    f.querySelector(".foot-top").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); const m = document.querySelector("main"); if (m) { if (!m.hasAttribute("tabindex")) m.tabIndex = -1; m.focus({ preventScroll: true }); } });
  }

  /* ---------- Piezas reutilizables ---------- */
  function statusChip(a) {
    return online(a)
      ? '<span class="chip chip-ok"><span class="dot"></span>En línea</span>'
      : '<span class="chip chip-soon"><span class="dot"></span>Próximamente</span>';
  }
  function card(a) {
    const meta = [
      a.version ? `<span>v<b>${esc(a.version)}</b></span>` : "",
      `<span><b>${esc(a.licencia)}</b></span>`,
      a.doi ? `<span>DOI <b>${esc(a.doi.replace("10.5281/zenodo.", "zenodo."))}</b></span>` : ""
    ].join("");
    const extra = [
      online(a) && a.manualPdf ? `<a class="icon-btn" href="${U.pdf(a)}" target="_blank" rel="noopener" aria-label="Manual de ${esc(a.nombre)} en PDF (${a.manualMb} MB, abre otra pestaña)" title="Manual PDF · ${a.manualMb} MB">${I.doc}</a>` : "",
      `<button class="icon-btn" type="button" data-cite-id="${esc(a.id)}" aria-label="Copiar la cita de ${esc(a.nombre)}" title="Copiar la cita">${I.quote}</button>`
    ].join("");
    return `<article class="card" data-cat="${esc(a.categoria)}">
      <a class="card-img" href="${U.ficha(a)}" tabindex="-1" aria-hidden="true">
        <img src="${U.shot(a)}" alt="" loading="lazy" width="1200" height="750">${statusChip(a)}
      </a>
      <div class="card-body">
        <span class="eyebrow">${esc((CATS[a.categoria] || {}).corto || "")}</span>
        <h3><a href="${U.ficha(a)}">${esc(a.nombre)}<span class="sr-only"> (${online(a) ? "en línea" : "próximamente"})</span></a></h3>
        <p class="card-lema">${esc(a.lema)}</p>
        <div class="label">${meta}</div>
      </div>
      <div class="card-actions">
        ${online(a)
          ? `<a class="btn btn-primary btn-sm" href="${U.app(a)}" target="_blank" rel="noopener">Abrir app ${I.arrow}<span class="sr-only"> ${esc(a.nombre)} (abre otra pestaña)</span></a>`
          : `<span class="btn btn-ghost btn-sm" aria-disabled="true">Próximamente</span>`}
        <a class="btn btn-ghost btn-sm" href="${U.ficha(a)}">Ficha<span class="sr-only"> de ${esc(a.nombre)}</span></a>
        <span class="card-extra">${extra}</span>
      </div>
    </article>`;
  }
  /* «Copiar la cita» funciona en cualquier tarjeta, dondequiera que se dibuje */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cite-id]"); if (!b) return;
    const a = APPS.find((x) => x.id === b.dataset.citeId);
    if (a) copy(citation(a), `Cita de ${a.nombre} copiada`);
  });
  /* Año de la cita: el campo «anio» de la app en data/apps.js; si falta, el
     año de publicación de la suite (C.anioCita, 2026 por omisión). */
  const yearOf = (a) => a.anio || C.anioCita || 2026;
  function citation(a) {
    const v = a.version ? ` (Versión ${a.version})` : "";
    const where = a.doi ? `Zenodo. ${U.doi(a.doi)}` : `${U.repo(a)}`;
    return `${C.autorCita} (${yearOf(a)}). ${a.nombre}: ${a.lema}${v} [Software]. ${where}`;
  }
  function bibtex(a) {
    const key = norm(C.autor.split(" ").slice(-1)[0]).replace(/[^a-z]/g, "") + yearOf(a) + norm(a.id).replace(/[^a-z0-9]/g, "");
    const tex = (s) => String(s).replace(/([&%$#_{}])/g, "\\$1");
    const f = [
      ["author", `{${C.autor.split(" ").slice(-1)[0]}}, ${C.autor.split(" ").slice(0, -1).join(" ")}`],
      ["title", `{${tex(a.nombre)}}: ${tex(a.lema)}`],
      ["year", yearOf(a)],
      a.version ? ["version", a.version] : null,
      a.doi ? ["publisher", "Zenodo"] : null,
      a.doi ? ["doi", a.doi] : null,
      ["url", a.doi ? U.doi(a.doi) : U.repo(a)],
      ["license", a.licencia]
    ].filter(Boolean);
    return `@software{${key},\n${f.map(([k, v]) => `  ${k.padEnd(9)} = {${v}}`).join(",\n")}\n}`;
  }


  /* ---------- Movimiento: entradas al hacer scroll, contadores, parallax ---------- */
  document.documentElement.classList.add("js");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = ("IntersectionObserver" in window) && !reduced
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;
  function reveal(root = document) {
    const sel = ".card, .area, .post-card, .principle, .pub-year, .puntos li, .cite-box, .ficha, .section-head, .numbers, .table-wrap, .contact-card, .about-grid > div, .lead";
    root.querySelectorAll(sel).forEach((el) => {
      if (el.classList.contains("reveal") || el.closest(".hero")) return;
      el.classList.add("reveal");
      const sib = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--d", `${Math.min(sib.indexOf(el), 8) * 80}ms`);
      if (io) io.observe(el); else el.classList.add("in");
    });
  }
  function countUp(el) {
    const end = +el.dataset.n; if (!end || reduced) { el.textContent = end || el.textContent; return; }
    const t0 = performance.now(), dur = 1100;
    (function tick(t) { const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3))); el.textContent = v; if (k < 1) requestAnimationFrame(tick); })(t0);
  }
  function setNumber(id, n) {
    const el = $(id); if (!el) return; el.dataset.n = n; el.textContent = n;
    if (io) { el.textContent = "0"; const o = new IntersectionObserver((es) => { if (es[0].isIntersecting) { countUp(el); o.disconnect(); } }); o.observe(el); }
  }
  function parallax() {
    const st = $("#stack"); if (!st || reduced || matchMedia("(max-width: 1000px)").matches) return;
    const shots = st.querySelectorAll(".shot"); let raf = 0;
    addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const y = Math.min(scrollY, 600); shots.forEach((s, i) => s.style.setProperty("--py", `${y * (0.05 + i * 0.04)}px`)); }); }, { passive: true });
    st.style.setProperty("--pp", "1");
  }

  /* ---------- Páginas ---------- */
  const pages = {
    inicio() {
      const feat = APPS.filter((a) => a.destacada);
      const on = APPS.filter(online).length;
      setNumber("#nApps", APPS.length);
      setNumber("#nOnline", on);
      setNumber("#nDoi", APPS.filter((a) => a.doi).length);
      setNumber("#nPubs", PUBS.length);
      $("#featured").innerHTML = feat.slice(0, 6).map(card).join("");
      const stackApps = ["PCAPro", "BioModellingPro", "AgriDesign"].map((id) => APPS.find((a) => a.id === id)).filter(Boolean);
      $("#stack").innerHTML = stackApps.map((a) => `<div class="shot"><div class="bar"><i></i><i></i><i></i><b>luisangelbg.github.io/${esc(a.id)}</b></div><img src="${U.shot(a)}" alt="Portada de ${esc(a.nombre)}" width="1200" height="750"></div>`).join("");
      $("#areas").innerHTML = Object.entries(CATS).map(([k, c]) => {
        const list = APPS.filter((a) => a.categoria === k);
        return `<a class="area" href="aplicaciones.html#${k}"><span class="eyebrow">${list.length} ${list.length === 1 ? "app" : "apps"}</span><h3>${esc(c.nombre)}</h3><p>${list.map((a) => esc(a.nombre)).join(" · ")}</p></a>`;
      }).join("");
      $("#latest").innerHTML = POSTS.slice(0, 3).map(postCard).join("");
      parallax();
    },

    aplicaciones() {
      const grid = $("#grid"), q = $("#q"), pills = $("#pills"), cnt = $("#count"), st = $("#estado"), ord = $("#orden"), views = $("#vista");
      /* el estado del catálogo vive en la dirección: se puede compartir y el botón «atrás» lo respeta */
      const P = new URLSearchParams(location.search);
      let cat = CATS[location.hash.slice(1)] ? location.hash.slice(1) : "todas";
      q.value = P.get("q") || "";
      if (["enlinea", "proximamente"].includes(P.get("estado"))) st.value = P.get("estado");
      if ([...ord.options].some((o) => o.value === P.get("orden"))) ord.value = P.get("orden");
      let view = P.get("vista") || store("labg-vista") || "tarjetas";
      if (view !== "lista") view = "tarjetas";

      pills.innerHTML = [["todas", "Todas"]].concat(Object.entries(CATS).map(([k, c]) => [k, c.corto]))
        .map(([k, l]) => `<button class="pill" type="button" data-k="${k}" aria-pressed="${k === cat}">${l} <span class="pill-n">${k === "todas" ? APPS.length : APPS.filter((a) => a.categoria === k).length}</span></button>`).join("");
      pills.addEventListener("click", (e) => {
        const b = e.target.closest(".pill"); if (!b) return;
        cat = b.dataset.k;
        pills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", p === b));
        draw();
      });
      views.addEventListener("click", (e) => {
        const b = e.target.closest("[data-view]"); if (!b) return;
        view = b.dataset.view; store("labg-vista", view); draw();
      });
      let tq; q.addEventListener("input", () => { clearTimeout(tq); tq = setTimeout(draw, 120); });
      st.addEventListener("change", draw);
      ord.addEventListener("change", draw);
      grid.addEventListener("click", (e) => { if (e.target.closest("#clearFilters")) { q.value = ""; st.value = "todas"; cat = "todas"; pills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", p.dataset.k === "todas")); draw(); q.focus(); } });
      addEventListener("hashchange", () => { const k = location.hash.slice(1); if (CATS[k] && k !== cat) { cat = k; pills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", p.dataset.k === cat)); draw(); } });

      const ver = (v) => String(v || "0").split(".").map((n) => +n || 0);
      const cmpVer = (a, b) => { const x = ver(a), y = ver(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (y[i] || 0) - (x[i] || 0); return 0; };
      const byName = (a, b) => a.nombre.localeCompare(b.nombre, "es");
      const SORT = {
        recomendado: (a, b) => (b.destacada ? 1 : 0) - (a.destacada ? 1 : 0) || (online(b) ? 1 : 0) - (online(a) ? 1 : 0) || byName(a, b),
        nombre: byName,
        area: (a, b) => Object.keys(CATS).indexOf(a.categoria) - Object.keys(CATS).indexOf(b.categoria) || byName(a, b),
        version: (a, b) => (online(b) ? 1 : 0) - (online(a) ? 1 : 0) || cmpVer(a.version, b.version) || byName(a, b)
      };
      function sync() {
        const p = new URLSearchParams();
        if (q.value.trim()) p.set("q", q.value.trim());
        if (st.value !== "todas") p.set("estado", st.value);
        if (ord.value !== "recomendado") p.set("orden", ord.value);
        if (view === "lista") p.set("vista", "lista");
        const url = location.pathname + (p.toString() ? "?" + p : "") + (cat !== "todas" ? "#" + cat : "");
        if (url !== location.pathname + location.search + location.hash) history.replaceState(null, "", url);
      }
      function draw() {
        const t = norm(q.value).split(/\s+/).filter(Boolean);
        const list = APPS.filter((a) =>
          (cat === "todas" || a.categoria === cat) &&
          (st.value === "todas" || a.estado === st.value) &&
          (!t.length || t.every((w) => norm([a.nombre, a.id, a.lema, a.descripcion, a.puntos.join(" "), (CATS[a.categoria] || {}).nombre].join(" ")).includes(w))))
          .sort(SORT[ord.value] || SORT.recomendado);
        grid.classList.toggle("as-list", view === "lista");
        views.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === view));
        grid.innerHTML = list.length ? list.map(card).join("")
          : `<div class="empty" style="grid-column:1/-1"><p><b>Ninguna aplicación coincide.</b></p><p>Prueba con otra palabra, otra área o «Todas» en disponibilidad.</p><p style="margin-top:14px"><button class="btn btn-ghost btn-sm" type="button" id="clearFilters">Quitar los filtros</button></p></div>`;
        grid.classList.remove("fade-swap"); void grid.offsetWidth; grid.classList.add("fade-swap");
        cnt.textContent = `${list.length} de ${APPS.length} aplicaciones`;
        sync();
      }
      draw();
    },

    app() {
      const id = document.body.dataset.id || decodeURIComponent(location.hash.slice(1));
      const a = APPS.find((x) => x.id === id);
      if (!a) { location.replace("aplicaciones.html" + (id ? "?q=" + encodeURIComponent(id) : "")); return; }
      if (!document.body.dataset.id) { location.replace(U.ficha(a)); return; }
      document.title = `${a.nombre} · ${C.sitio} Suite`;
      const cat = CATS[a.categoria] || {};
      const rows = [
        ["Versión", a.version || "—"],
        ["Licencia", a.licencia],
        ["DOI", a.doi ? `<a href="${U.doi(a.doi)}" target="_blank" rel="noopener">${esc(a.doi)}</a>` : "En trámite"],
        ["Estado", online(a) ? "Publicada" : "Próximamente"],
        ["Requiere", "Un navegador de escritorio actualizado"],
        ["Instalación", "Ninguna"]
      ];
      const NEW = ' <span class="sr-only">(abre otra pestaña)</span>';
      const toc = [["que-hace", "Qué hace"], ["citar", "Cómo citar"], ["ficha-tecnica", "Ficha técnica"]]
        .concat(online(a) ? [["descargas", "Descargas"]] : [], [["relacionadas", "Relacionadas"]]);
      $("#detail").innerHTML = `
      <section class="detail-hero"><div class="wrap">
        <nav class="crumbs" aria-label="Migas de pan"><ol>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="aplicaciones.html">Aplicaciones</a></li>
          <li><a href="aplicaciones.html#${a.categoria}">${esc(cat.corto || "")}</a></li>
          <li><span aria-current="page">${esc(a.nombre)}</span></li>
        </ol></nav>
        <div class="detail-grid">
          <div class="detail-copy">
            <div class="chips">${statusChip(a)}<span class="chip chip-cat">${esc(cat.nombre || "")}</span></div>
            <h1>${esc(a.nombre)}</h1>
            <p class="lead detail-lema">${esc(a.lema)}</p>
            <p>${esc(a.descripcion)}</p>
            <div class="hero-actions">
              ${online(a) ? `<a class="btn btn-primary" href="${U.app(a)}" target="_blank" rel="noopener">Abrir ${esc(a.nombre)} ${I.arrow}${NEW}</a>` : `<span class="btn btn-ghost" aria-disabled="true">Disponible próximamente</span>`}
              ${online(a) && a.manualPdf ? `<a class="btn btn-ghost" href="${U.pdf(a)}" target="_blank" rel="noopener">${I.doc} Manual PDF${NEW}</a>` : ""}
              <a class="btn btn-ghost" href="${U.ficha(a)}#citar">${I.quote} Citar</a>
              ${online(a) ? `<a class="btn btn-ghost" href="${U.repo(a)}" target="_blank" rel="noopener">${I.code} Código${NEW}</a>` : ""}
            </div>
          </div>
          <div class="detail-shot"><img src="${U.shot(a)}" alt="Portada de ${esc(a.nombre)}" width="1200" height="750" fetchpriority="high"></div>
        </div>
      </div></section>
      <section class="section"><div class="wrap detail-layout">
        <nav class="toc" aria-label="En esta página">
          <span class="toc-title">En esta página</span>
          <ol>${toc.map(([id, l]) => `<li><a href="${U.ficha(a)}#${id}" data-toc="${id}">${l}</a></li>`).join("")}</ol>
        </nav>
        <div class="detail-main">
          <section id="que-hace" class="detail-sec">
            <h2>Qué hace</h2>
            <ul class="puntos">${a.puntos.map((p) => `<li>${I.check}<span>${esc(p)}</span></li>`).join("")}</ul>
          </section>
          <section id="citar" class="detail-sec">
            <h2>Cómo citar</h2>
            <p class="muted">Si usaste ${esc(a.nombre)} en una tesis, artículo o informe, cítala como cualquier otra fuente${a.doi ? "; el DOI siempre lleva a la versión más reciente" : ""}.</p>
            <div class="cite-box">
              <div class="cite-tabs" role="tablist" aria-label="Formato de la cita">
                <button type="button" role="tab" id="tab-apa" aria-controls="cite-apa" aria-selected="true">APA</button>
                <button type="button" role="tab" id="tab-bib" aria-controls="cite-bib" aria-selected="false" tabindex="-1">BibTeX</button>
              </div>
              <div role="tabpanel" id="cite-apa" aria-labelledby="tab-apa"><p class="cite-text">${esc(citation(a))}</p></div>
              <div role="tabpanel" id="cite-bib" aria-labelledby="tab-bib" hidden><pre class="cite-bib">${esc(bibtex(a))}</pre></div>
              <div class="dl-links">
                <button class="btn btn-primary btn-sm" type="button" id="citeBtn">${I.copy} Copiar</button>
                <button class="btn btn-ghost btn-sm" type="button" id="bibBtn">${I.down} Descargar .bib</button>
              </div>
            </div>
          </section>
          <section id="ficha-tecnica" class="detail-sec">
            <h2>Ficha técnica</h2>
            <dl class="ficha">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          </section>
          ${online(a) ? `<section id="descargas" class="detail-sec">
            <h2>Descargas</h2>
            <div class="cite-box">
              <div class="dl-links">
                ${a.manualPdf ? `<a class="btn btn-ghost btn-sm" href="${U.pdf(a)}" target="_blank" rel="noopener">${I.doc} Manual PDF <span class="size">${a.manualMb} MB</span>${NEW}</a>` : ""}
                ${a.manualHtml ? `<a class="btn btn-ghost btn-sm" href="${U.html(a)}" target="_blank" rel="noopener">${I.doc} Manual en línea${NEW}</a>` : ""}
                <a class="btn btn-ghost btn-sm" href="${U.zip(a)}">${I.down} App completa (.zip)</a>
              </div>
              <p class="muted small">El .zip permite usar la aplicación sin internet: descomprímelo y abre <span class="mono">index.html</span>.</p>
            </div>
          </section>` : ""}
        </div>
      </div></section>`;

      /* pestañas de la cita: flechas para cambiar, como en cualquier lista de pestañas */
      const tabs = [$("#tab-apa"), $("#tab-bib")];
      let fmt = "apa";
      const pick = (t) => {
        fmt = t === tabs[0] ? "apa" : "bib";
        tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
      };
      tabs.forEach((t, i) => {
        t.addEventListener("click", () => pick(t));
        t.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const n = tabs[(i + 1) % 2]; pick(n); n.focus(); }
        });
      });
      $("#citeBtn").addEventListener("click", () => copy(fmt === "apa" ? citation(a) : bibtex(a), fmt === "apa" ? "Cita APA copiada" : "Cita BibTeX copiada"));
      $("#bibBtn").addEventListener("click", () => {
        const url = URL.createObjectURL(new Blob([bibtex(a) + "\n"], { type: "application/x-bibtex;charset=utf-8" }));
        const l = document.createElement("a"); l.href = url; l.download = `${a.id}.bib`; document.body.appendChild(l); l.click(); l.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      });

      /* índice: marca la sección que se está leyendo */
      const links = [...document.querySelectorAll(".toc a")];
      if ("IntersectionObserver" in window) {
        const seen = new Map();
        const ob = new IntersectionObserver((es) => {
          es.forEach((e) => seen.set(e.target.id, e.isIntersecting));
          const cur = toc.map(([id]) => id).find((id) => seen.get(id));
          if (cur) links.forEach((l) => l.toggleAttribute("aria-current", l.dataset.toc === cur));
        }, { rootMargin: "-80px 0px -55% 0px" });
        toc.forEach(([id]) => { const s = document.getElementById(id); if (s) ob.observe(s); });
      }

      const others = APPS.filter((x) => x.categoria === a.categoria && x.id !== a.id);
      $("#others").innerHTML = others.length ? others.map(card).join("") : APPS.filter((x) => x.destacada && x.id !== a.id).slice(0, 3).map(card).join("");
    },

    descargas() {
      const rows = APPS.map((a) => {
        const on = online(a);
        const cells = on ? `
          <td>${a.manualPdf ? `<a class="btn btn-ghost btn-sm" href="${U.pdf(a)}" target="_blank" rel="noopener">${I.doc} PDF</a> <span class="size">${a.manualMb} MB</span>` : '<span class="muted">—</span>'}</td>
          <td>${a.manualHtml ? `<a href="${U.html(a)}" target="_blank" rel="noopener">Leer en línea</a>` : '<span class="muted">—</span>'}</td>
          <td><div class="dl-links"><a class="btn btn-ghost btn-sm" href="${U.zip(a)}">${I.down} .zip</a><a class="btn btn-ghost btn-sm" href="${U.repo(a)}" target="_blank" rel="noopener">${I.code} GitHub</a></div></td>`
          : `<td colspan="3"><span class="chip chip-soon"><span class="dot"></span>Próximamente</span></td>`;
        return `<tr><td><div class="name"><a href="${U.ficha(a)}">${esc(a.nombre)}</a></div><div class="sub">${esc((CATS[a.categoria] || {}).corto || "")}${a.version ? " · v" + esc(a.version) : ""}</div></td>${cells}</tr>`;
      }).join("");
      $("#dlBody").innerHTML = rows;
      const man = APPS.filter((a) => online(a) && a.manualPdf);
      $("#nMan").textContent = man.length;
      $("#mbMan").textContent = man.reduce((s, a) => s + a.manualMb, 0);
    },

    publicaciones() {
      const soft = APPS.filter((a) => a.doi).map((a) => ({
        tipo: "software", anio: 2026, titulo: `${a.nombre}: ${a.lema}`, autores: C.autor,
        revista: `Zenodo${a.version ? " · versión " + a.version : ""}`, doi: a.doi, url: U.doi(a.doi), tema: "software"
      }));
      const ALL = PUBS.concat(soft);
      const TIPOS = { articulo: "Artículos", capitulo: "Capítulos", libro: "Libros", congreso: "Congresos", software: "Software", otro: "Otros" };
      const temas = [...new Set(ALL.map((p) => p.tema).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
      $("#tema").innerHTML = '<option value="">Todos los temas</option>' + temas.map((t) => `<option>${esc(t)}</option>`).join("");
      const present = Object.keys(TIPOS).filter((k) => ALL.some((p) => p.tipo === k));
      let tipo = "todos";
      $("#tipos").innerHTML = [["todos", "Todo"]].concat(present.map((k) => [k, TIPOS[k]]))
        .map(([k, l]) => `<button class="pill" type="button" data-k="${k}" aria-pressed="${k === tipo}">${l} <span class="pill-n">${k === "todos" ? ALL.length : ALL.filter((p) => p.tipo === k).length}</span></button>`).join("");
      $("#tipos").addEventListener("click", (e) => {
        const b = e.target.closest(".pill"); if (!b) return;
        tipo = b.dataset.k; $("#tipos").querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", p === b)); draw();
      });
      $("#pq").addEventListener("input", draw);
      $("#tema").addEventListener("change", draw);
      $("#pubs").addEventListener("click", (e) => {
        const b = e.target.closest("[data-cite]"); if (!b) return;
        copy(b.dataset.cite, "Referencia copiada");
      });
      const me = /Barrera[- ]Guzm[aá]n,?\s*(L(uis)?\.?\s*[ÁA]?(ngel)?\.?)?|L(uis)?\.?\s*[ÁA](ngel|\.)?\s*Barrera[- ]Guzm[aá]n/g;
      function ref(p) {
        const vol = [p.volumen, p.paginas].filter(Boolean).join(", ");
        return `${p.autores} (${p.anio}). ${p.titulo}. ${p.revista}${vol ? ", " + vol : ""}.${p.doi ? " https://doi.org/" + p.doi : ""}`;
      }
      function draw() {
        const t = norm($("#pq").value), tm = $("#tema").value;
        const list = ALL.filter((p) => (tipo === "todos" || p.tipo === tipo) && (!tm || p.tema === tm) &&
          (!t || norm([p.titulo, p.autores, p.revista].join(" ")).includes(t)))
          .sort((a, b) => b.anio - a.anio || a.titulo.localeCompare(b.titulo));
        $("#pcount").textContent = `${list.length} de ${ALL.length} registros`;
        if (!list.length) { $("#pubs").innerHTML = '<p class="empty">Ningún registro coincide con los filtros.</p>'; return; }
        const years = [...new Set(list.map((p) => p.anio))];
        $("#pubs").innerHTML = years.map((y) => `<div class="pub-year"><h2>${y}</h2><div class="pub-list">${
          list.filter((p) => p.anio === y).map((p) => `<article class="pub">
            <div class="pub-title">${esc(p.titulo)}</div>
            <div class="pub-authors">${esc(p.autores).replace(me, (m) => `<mark>${m}</mark>`)}</div>
            <div class="pub-venue">${esc(p.revista)}${p.volumen ? ", " + esc(p.volumen) : ""}${p.paginas ? ", " + esc(p.paginas) : ""}</div>
            <div class="pub-meta">
              <span class="chip chip-cat">${esc(TIPOS[p.tipo] ? TIPOS[p.tipo].replace(/s$/, "") : p.tipo)}</span>
              ${p.tema ? `<span class="chip" style="background:var(--line-2);color:var(--ink-2)">${esc(p.tema)}</span>` : ""}
              ${p.doi ? `<a class="doi" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi:${esc(p.doi)}</a>` : (p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Ver</a>` : "")}
              <button class="link-btn" type="button" data-cite="${esc(ref(p))}">Copiar referencia</button>
            </div></article>`).join("")
        }</div></div>`).join("");
        $("#pubs").classList.add("fade-swap");
      }
      draw();
    },

    blog() {
      const slug = document.body.dataset.id || decodeURIComponent(location.hash.slice(1));
      const post = POSTS.find((p) => p.slug === slug);
      if (post && !document.body.dataset.id) { location.replace(U.post(post)); return; }
      const list = $("#blogList"), art = $("#blogPost");
      if (!post) {
        art.hidden = true; list.hidden = false;
        $("#posts").innerHTML = POSTS.map(postCard).join("");
      } else {
        list.hidden = true; art.hidden = false;
        document.title = `${post.titulo} · ${C.sitio} Suite`;
        $("#postHead").innerHTML = `<a href="blog.html" class="muted" style="font-size:.9rem">← Todas las entradas</a>
          <div class="tags">${post.etiquetas.map((t) => `<span class="chip chip-cat">${esc(t)}</span>`).join("")}</div>
          <h1 style="font-size:clamp(1.9rem,4vw,2.7rem)">${esc(post.titulo)}</h1>
          <time datetime="${post.fecha}">${fmtDate(post.fecha)} · ${esc(C.autor)}</time>`;
        const body = $("#postBody");
        if (!body.hasAttribute("data-static")) {
        body.innerHTML = '<p class="muted">Cargando…</p>';
        fetch(`blog/entradas/${post.slug}.md`).then((r) => { if (!r.ok) throw 0; return r.text(); })
          .then((src) => { body.innerHTML = markdown(src); })
          .catch(() => { body.innerHTML = '<p>No se pudo cargar la entrada. Si abriste el archivo con doble clic, usa el servidor local (ver LEEME.md).</p>'; });
        }
        const rel = (post.apps || []).map((id) => APPS.find((a) => a.id === id)).filter(Boolean);
        $("#postApps").innerHTML = rel.length ? `<span class="eyebrow">Aplicaciones mencionadas</span><div class="dl-links">${rel.map((a) => `<a class="btn btn-ghost btn-sm" href="${U.ficha(a)}">${esc(a.nombre)}</a>`).join("")}</div>` : "";
      }
    },

    /* Página 404: propone la app cuyo nombre se parece más a la dirección pedida */
    p404() {
      const path = decodeURIComponent(location.pathname).replace(/\/+$/, "");
      /* cada app vive en el primer tramo de la dirección: /NombreApp/… */
      const seg = norm(path.split("/").filter(Boolean)[0] || "").replace(/\.html?$/, "").replace(/[^a-z0-9]/g, "");
      $("#badPath").textContent = path || "/";
      const dist = (a, b) => {                                   /* distancia de edición */
        const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) d[0][j] = j;
        for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        return d[a.length][b.length];
      };
      const scored = seg ? APPS.map((a) => {
        const k = norm(a.id).replace(/[^a-z0-9]/g, "");
        return { a, s: k.includes(seg) || seg.includes(k) ? 0 : dist(seg, k) / Math.max(seg.length, k.length) };
      }).sort((x, y) => x.s - y.s) : [];
      const best = scored.filter((x) => x.s <= 0.4).slice(0, 3).map((x) => x.a);
      const show = best.length ? best : APPS.filter((a) => a.destacada).slice(0, 3);
      $("#guessHead").textContent = best.length ? "¿Buscabas alguna de estas?" : "Aplicaciones destacadas";
      $("#guess").innerHTML = show.map(card).join("");
      const f = $("#q404");
      if (seg) f.value = seg;
      $("#f404").addEventListener("submit", (e) => { e.preventDefault(); location.href = "aplicaciones.html?q=" + encodeURIComponent(f.value.trim()); });
    },

    acerca() {
      $("#nA").textContent = APPS.length;
      const dl = [];
      if (C.institucion) dl.push(["Institución", `${esc(C.institucion)}${C.centro ? "<br>" + esc(C.centro) : ""}`]);
      if (C.direccion) dl.push(["Dirección", esc(C.direccion)]);
      dl.push(...[
        ["ORCID", `<a href="https://orcid.org/${esc(C.orcid)}" target="_blank" rel="noopener" class="mono">${esc(C.orcid)}</a>`],
        ["Código", `<a href="${esc(C.github)}" target="_blank" rel="noopener">github.com/luisangelbg</a>`]
      ]);
      if (C.researchgate) dl.push(["ResearchGate", `<a href="${esc(C.researchgate)}" target="_blank" rel="noopener">Perfil</a>`]);
      if (C.correo) dl.unshift(["Correo", `<span class="mono">${esc(C.correo)}</span> <button class="link-btn" type="button" id="mailCopy">Copiar</button>`]);
      $("#contactDl").innerHTML = dl.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
      const mc = $("#mailCopy"); if (mc) mc.addEventListener("click", () => copy(C.correo, "Correo copiado"));
      const f = $("#contactForm");
      if (C.formspree) {
        f.hidden = false;
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const btn = f.querySelector("button"); btn.disabled = true; btn.textContent = "Enviando…";
          fetch(C.formspree, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
            .then((r) => { if (!r.ok) throw 0; f.reset(); $("#formMsg").textContent = "Mensaje enviado. Gracias por escribir."; })
            .catch(() => { $("#formMsg").textContent = "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo."; })
            .finally(() => { btn.disabled = false; btn.textContent = "Enviar mensaje"; });
        });
      }
    }
  };

  /* ---------- Markdown de las entradas: assets/js/markdown.js ---------- */
  const markdown = (src) => window.LABG_MD.markdown(src);

  function fmtDate(d) {
    try { return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return d; }
  }
  function postCard(p) {
    return `<a class="post-card" href="${U.post(p)}">
      <time datetime="${p.fecha}">${fmtDate(p.fecha)}</time>
      <h3>${esc(p.titulo)}</h3><p>${esc(p.resumen)}</p>
      <div class="tags">${p.etiquetas.map((t) => `<span class="chip chip-cat">${esc(t)}</span>`).join("")}</div>
      <span class="more">Leer entrada →</span></a>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    header(page);
    footer();
    if (pages[page]) pages[page]();
    reveal();
    new MutationObserver(() => reveal()).observe(document.querySelector("main"), { childList: true, subtree: true });
  });
})();
