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
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
  };

  /* ---------- Tema claro / oscuro ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  const saved = store("labg-tema");
  if (saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store("labg-tema", next);
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
  let INDEX = null, sdlg = null;
  function openSearch() {
    if (!sdlg) {
      INDEX = buildIndex();
      sdlg = document.createElement("div");
      sdlg.className = "sdlg"; sdlg.setAttribute("role", "dialog"); sdlg.setAttribute("aria-modal", "true"); sdlg.setAttribute("aria-label", "Buscar en el sitio");
      sdlg.innerHTML = `<div class="sbox">
        <label class="search sinput" for="sq">${I.search}<input id="sq" type="search" placeholder="Buscar apps, publicaciones y entradas…" autocomplete="off"><kbd>Esc</kbd></label>
        <div class="sres" id="sres" role="listbox" aria-live="polite"></div>
        <div class="shint"><span><kbd>↑</kbd><kbd>↓</kbd> moverse</span><span><kbd>↵</kbd> abrir</span><span><kbd>Ctrl</kbd>+<kbd>K</kbd> abrir el buscador</span></div>
      </div>`;
      document.body.appendChild(sdlg);
      const inp = $("#sq", sdlg), res = $("#sres", sdlg);
      const KIND = { app: "Aplicación", pub: "Publicación", post: "Blog" };
      let sel = 0;
      function draw() {
        const q = norm(inp.value.trim());
        const words = q.split(/\s+/).filter(Boolean);
        let list = words.length ? INDEX.filter((r) => words.every((w) => r.x.includes(w))) : INDEX.filter((r) => r.k === "app").slice(0, 8);
        list = list.sort((a, b) => ({ app: 0, post: 1, pub: 2 }[a.k] - { app: 0, post: 1, pub: 2 }[b.k])).slice(0, 12);
        sel = 0;
        res.innerHTML = list.length ? list.map((r, i) => `<a class="sitem" role="option" href="${r.h}"${r.ext ? ' target="_blank" rel="noopener"' : ""} data-i="${i}">
          <span class="skind skind-${r.k}">${KIND[r.k]}</span><span class="stext"><b>${esc(r.t)}</b><small>${esc(r.s)}</small></span>${r.k === "app" && r.on === false ? '<span class="chip chip-soon">Próximamente</span>' : ""}</a>`).join("")
          : `<p class="empty" style="padding:24px">Nada coincide con «${esc(inp.value)}».</p>`;
        mark();
      }
      function mark() { res.querySelectorAll(".sitem").forEach((el, i) => el.setAttribute("aria-selected", i === sel)); }
      inp.addEventListener("input", draw);
      inp.addEventListener("keydown", (e) => {
        const items = res.querySelectorAll(".sitem");
        if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); mark(); items[sel]?.scrollIntoView({ block: "nearest" }); }
        if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); items[sel]?.scrollIntoView({ block: "nearest" }); }
        if (e.key === "Enter" && items[sel]) { items[sel].click(); }
      });
      sdlg.addEventListener("click", (e) => { if (e.target === sdlg) closeSearch(); });
      addEventListener("keydown", (e) => { if (e.key === "Escape" && sdlg.classList.contains("open")) closeSearch(); });
      draw();
    }
    sdlg.classList.add("open"); document.body.style.overflow = "hidden";
    const inp = $("#sq", sdlg); inp.value = ""; inp.dispatchEvent(new Event("input")); setTimeout(() => inp.focus(), 30);
  }
  function closeSearch() { sdlg.classList.remove("open"); document.body.style.overflow = ""; $("#searchBtn")?.focus(); }

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
      <a class="brand" href="index.html" aria-label="${esc(C.sitio)} — inicio">
        <span class="brand-mark">${esc(C.sitio)}</span>
        <span class="brand-text"><b>${esc(C.sitio)} Suite</b><span>${esc(C.subtitulo)}</span></span>
      </a>
      <button class="icon-btn menu-btn" type="button" id="menuBtn" aria-label="Abrir menú" aria-expanded="false">${I.menu}</button>
      <nav class="nav" id="nav" aria-label="Principal">
        ${NAV.map(([href, label, key]) => `<a href="${href}"${key === cur ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <button class="icon-btn" type="button" id="searchBtn" aria-label="Buscar en el sitio (Ctrl+K)" title="Buscar (Ctrl+K)">${I.search}</button>
        <button class="icon-btn" type="button" id="themeBtn" aria-label="Cambiar tema claro u oscuro" title="Tema claro / oscuro">${I.moon}</button>
      </nav></div>`;
    const ph = $("#hdr"); if (ph) ph.replaceWith(h); else document.body.prepend(h);
    $("#themeBtn").addEventListener("click", toggleTheme);
    $("#searchBtn").addEventListener("click", openSearch);
    addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    });
    $("#menuBtn").addEventListener("click", (e) => {
      const n = $("#nav"); n.classList.toggle("open");
      e.currentTarget.setAttribute("aria-expanded", n.classList.contains("open"));
    });
  }
  function footer() {
    const f = document.createElement("footer");
    f.className = "foot";
    const year = new Date().getFullYear();
    f.innerHTML = `<div class="wrap">
      <div class="foot-grid">
        <div style="display:grid;gap:10px">
          <b style="font-family:var(--f-display);font-size:1.3rem;color:#fff">${esc(C.sitio)} Suite</b>
          <p style="max-width:42ch">Aplicaciones científicas libres para la investigación y la docencia en ciencias agrícolas y biológicas.</p>
        </div>
        <div><h4>Sitio</h4><ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></div>
        <div><h4>Enlaces</h4><ul>
          <li><a href="${esc(C.github)}" target="_blank" rel="noopener">GitHub</a></li>
          <li><a href="https://orcid.org/${esc(C.orcid)}" target="_blank" rel="noopener">ORCID</a></li>
          ${C.researchgate ? `<li><a href="${esc(C.researchgate)}" target="_blank" rel="noopener">ResearchGate</a></li>` : ""}
          <li><a href="https://zenodo.org/search?q=${encodeURIComponent('"' + C.autor + '"')}" target="_blank" rel="noopener">Zenodo</a></li>
        </ul></div>
      </div>
      <div class="foot-bottom"><span>© ${year} ${esc(C.autor)} · Las aplicaciones se distribuyen como software libre (GPL/AGPL).</span><span>Hospedado gratis en GitHub Pages</span></div>
    </div>`;
    document.body.appendChild(f);
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
    return `<article class="card" data-cat="${esc(a.categoria)}">
      <a class="card-img" href="${U.ficha(a)}" tabindex="-1" aria-hidden="true">
        <img src="${U.shot(a)}" alt="" loading="lazy" width="1200" height="750">${statusChip(a)}
      </a>
      <div class="card-body">
        <span class="eyebrow">${esc((CATS[a.categoria] || {}).corto || "")}</span>
        <h3><a href="${U.ficha(a)}">${esc(a.nombre)}</a></h3>
        <p class="card-lema">${esc(a.lema)}</p>
        <div class="label">${meta}</div>
      </div>
      <div class="card-actions">
        ${online(a)
          ? `<a class="btn btn-primary btn-sm" href="${U.app(a)}" target="_blank" rel="noopener">Abrir app ${I.arrow}</a>`
          : `<span class="btn btn-ghost btn-sm" aria-disabled="true">Próximamente</span>`}
        <a class="btn btn-ghost btn-sm" href="${U.ficha(a)}">Ver ficha</a>
      </div>
    </article>`;
  }
  function citation(a) {
    const v = a.version ? ` (Versión ${a.version})` : "";
    const where = a.doi ? `Zenodo. ${U.doi(a.doi)}` : `${U.repo(a)}`;
    return `${C.autorCita} (2026). ${a.nombre}: ${a.lema}${v} [Software]. ${where}`;
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
      const grid = $("#grid"), q = $("#q"), pills = $("#pills"), cnt = $("#count"), st = $("#estado");
      let cat = "todas";
      const h = location.hash.slice(1);
      if (CATS[h]) cat = h;
      pills.innerHTML = [["todas", "Todas"]].concat(Object.entries(CATS).map(([k, c]) => [k, c.corto]))
        .map(([k, l]) => `<button class="pill" type="button" data-k="${k}" aria-pressed="${k === cat}">${l}</button>`).join("");
      pills.addEventListener("click", (e) => {
        const b = e.target.closest(".pill"); if (!b) return;
        cat = b.dataset.k;
        pills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", p === b));
        draw();
      });
      q.addEventListener("input", draw);
      st.addEventListener("change", draw);
      const q0 = new URLSearchParams(location.search).get("q"); if (q0) q.value = q0;
      function draw() {
        const t = norm(q.value);
        const list = APPS.filter((a) =>
          (cat === "todas" || a.categoria === cat) &&
          (st.value === "todas" || a.estado === st.value) &&
          (!t || norm([a.nombre, a.lema, a.descripcion, a.puntos.join(" ")].join(" ")).includes(t)));
        grid.innerHTML = list.length ? list.map(card).join("") : '<p class="empty" style="grid-column:1/-1">Ninguna aplicación coincide con la búsqueda.</p>';
        grid.classList.add("fade-swap"); grid.querySelectorAll(".card").forEach((c, i) => c.style.animationDelay = `${Math.min(i, 8) * 45}ms`);
        cnt.textContent = `${list.length} de ${APPS.length} aplicaciones`;
      }
      draw();
    },

    app() {
      const id = document.body.dataset.id || decodeURIComponent(location.hash.slice(1));
      const a = APPS.find((x) => x.id === id);
      if (!a) { location.replace("aplicaciones.html"); return; }
      if (!document.body.dataset.id) { location.replace(U.ficha(a)); return; }
      document.title = `${a.nombre} · ${C.sitio} Suite`;
      const cat = CATS[a.categoria] || {};
      const rows = [
        ["Versión", a.version || "—"],
        ["Licencia", a.licencia],
        ["DOI", a.doi ? `<a href="${U.doi(a.doi)}" target="_blank" rel="noopener">${esc(a.doi)}</a>` : "En trámite"],
        ["Estado", online(a) ? "Publicada" : "Próximamente"],
        ["Requiere", "Chrome o Edge"],
        ["Instalación", "Ninguna"]
      ];
      $("#detail").innerHTML = `
      <section class="detail-hero"><div class="wrap">
        <div class="crumbs"><a href="aplicaciones.html">Aplicaciones</a> / <a href="aplicaciones.html#${a.categoria}">${esc(cat.corto || "")}</a> / ${esc(a.nombre)}</div>
        <div class="detail-grid">
          <div class="detail-copy">
            <div class="chips">${statusChip(a)}<span class="chip chip-cat">${esc(cat.nombre || "")}</span></div>
            <h1>${esc(a.nombre)}</h1>
            <p class="lead" style="font-family:var(--f-display);font-style:italic">${esc(a.lema)}</p>
            <p>${esc(a.descripcion)}</p>
            <div class="hero-actions">
              ${online(a) ? `<a class="btn btn-primary" href="${U.app(a)}" target="_blank" rel="noopener">Abrir ${esc(a.nombre)} ${I.arrow}</a>` : `<span class="btn btn-ghost" aria-disabled="true">Disponible próximamente</span>`}
              ${online(a) && a.manualPdf ? `<a class="btn btn-ghost" href="${U.pdf(a)}" target="_blank" rel="noopener">${I.doc} Manual PDF</a>` : ""}
              ${online(a) ? `<a class="btn btn-ghost" href="${U.repo(a)}" target="_blank" rel="noopener">${I.code} Código</a>` : ""}
            </div>
          </div>
          <div class="detail-shot"><img src="${U.shot(a)}" alt="Portada de ${esc(a.nombre)}" width="1200" height="750"></div>
        </div>
      </div></section>
      <section class="section"><div class="wrap two-col">
        <div style="display:grid;gap:18px">
          <h2>Qué hace</h2>
          <ul class="puntos">${a.puntos.map((p) => `<li>${I.check}<span>${esc(p)}</span></li>`).join("")}</ul>
          <div class="cite-box">
            <span class="eyebrow">Cómo citar</span>
            <p id="citeText">${esc(citation(a))}</p>
            <div><button class="btn btn-ghost btn-sm" type="button" id="citeBtn">${I.copy} Copiar cita</button></div>
          </div>
        </div>
        <div style="display:grid;gap:18px">
          <h2>Ficha técnica</h2>
          <dl class="ficha">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          ${online(a) ? `<div class="cite-box"><span class="eyebrow">Descargas</span>
            <div class="dl-links">
              ${a.manualPdf ? `<a class="btn btn-ghost btn-sm" href="${U.pdf(a)}" target="_blank" rel="noopener">${I.doc} Manual PDF <span class="size">${a.manualMb} MB</span></a>` : ""}
              ${a.manualHtml ? `<a class="btn btn-ghost btn-sm" href="${U.html(a)}" target="_blank" rel="noopener">${I.doc} Manual en línea</a>` : ""}
              <a class="btn btn-ghost btn-sm" href="${U.zip(a)}">${I.down} App completa (.zip)</a>
            </div>
            <p class="muted" style="font-size:.88rem">El .zip permite usar la aplicación sin internet: descomprímelo y abre <span class="mono">index.html</span>.</p></div>` : ""}
        </div>
      </div></section>`;
      $("#citeBtn").addEventListener("click", () => copy(citation(a), "Cita copiada"));
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
        .map(([k, l]) => `<button class="pill" type="button" data-k="${k}" aria-pressed="${k === tipo}">${l} <span class="mono" style="opacity:.7">${k === "todos" ? ALL.length : ALL.filter((p) => p.tipo === k).length}</span></button>`).join("");
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
        $("#pubs").innerHTML = years.map((y) => `<div class="pub-year"><h3>${y}</h3><div class="pub-list">${
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
        body.innerHTML = '<p class="muted">Cargando…</p>';
        fetch(`blog/entradas/${post.slug}.md`).then((r) => { if (!r.ok) throw 0; return r.text(); })
          .then((md) => { body.innerHTML = window.marked ? window.marked.parse(md) : `<pre>${esc(md)}</pre>`; })
          .catch(() => { body.innerHTML = '<p>No se pudo cargar la entrada. Si abriste el archivo con doble clic, usa el servidor local (ver LEEME.md).</p>'; });
        const rel = (post.apps || []).map((id) => APPS.find((a) => a.id === id)).filter(Boolean);
        $("#postApps").innerHTML = rel.length ? `<span class="eyebrow">Aplicaciones mencionadas</span><div class="dl-links">${rel.map((a) => `<a class="btn btn-ghost btn-sm" href="${U.ficha(a)}">${esc(a.nombre)}</a>`).join("")}</div>` : "";
      }
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
