#!/usr/bin/env node
/* =====================================================================
   COMPILADOR DEL PORTAL — genera las páginas reales a partir de data/.
   Uso:  node scripts/build.mjs
   Produce:
     apps/<id>/index.html        una página por aplicación (Open Graph + JSON-LD)
     blog/<slug>/index.html      una página por entrada del blog
     sitemap.xml, robots.txt
     publicaciones.html          inserta el JSON-LD de los artículos
   No hace falta ejecutarlo a mano: la acción de GitHub lo corre al editar data/.
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Carga data/*.js tal como lo haría el navegador
const win = {};
for (const f of ["config", "apps", "publicaciones", "blog"]) vm.runInNewContext(read(`data/${f}.js`), { window: win });
// Convertidor de Markdown del sitio (el mismo que usa la página)
vm.runInNewContext(read("assets/js/markdown.js"), { window: win });
const MD = win.LABG_MD;
const C = win.LABG_CONFIG, APPS = win.LABG_APPS, CATS = win.LABG_CATEGORIAS, PUBS = win.LABG_PUBLICACIONES, POSTS = win.LABG_BLOG;
const SITE = C.base.replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const slug = (a) => a.id.toLowerCase();
const appUrl = (a) => `${SITE}/apps/${slug(a)}/`;
const postUrl = (p) => `${SITE}/blog/${p.slug}/`;
const author = { "@type": "Person", name: C.autor, url: `https://orcid.org/${C.orcid}`, identifier: `https://orcid.org/${C.orcid}` };

function head({ title, desc, url, image, base, jsonld, type = "website", preloadImg = "" }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<base href="${base}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(C.sitio)} Suite">
<meta property="og:locale" content="es_MX">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/sans-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/serif-600-latin.woff2" as="font" type="font/woff2" crossorigin>
${preloadImg ? `<link rel="preload" href="${preloadImg}" as="image" fetchpriority="high">
` : ""}
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/site.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script>try{var t=localStorage.getItem("labg-tema");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}document.documentElement.classList.add("js")</script>
<script defer src="data/config.js"></script>
<script defer src="data/apps.js"></script>
<script defer src="data/publicaciones.js"></script>
<script defer src="data/blog.js"></script>
${type === "article" ? '<script defer src="assets/js/markdown.js"></script>\n' : ""}<script defer src="assets/js/site.js"></script>
</head>`;
}

/* Contenido de la ficha escrito en el HTML: lo leen los buscadores y quien
   navega sin JavaScript. Con JavaScript, site.js lo sustituye por la ficha
   completa (índice, pestañas de la cita, descargas). La cita debe coincidir
   con citation() de assets/js/site.js. */
function staticDetail(a, cat) {
  const on = a.estado === "enlinea";
  const year = a.anio || C.anioCita || 2026;
  const cite = `${C.autorCita} (${year}). ${a.nombre}: ${a.lema}${a.version ? ` (Versión ${a.version})` : ""} [Software]. ${a.doi ? `Zenodo. https://doi.org/${a.doi}` : `${C.github}/${a.id}`}`;
  return `
    <section class="detail-hero"><div class="wrap">
      <nav class="crumbs" aria-label="Migas de pan"><ol><li><a href="index.html">Inicio</a></li><li><a href="aplicaciones.html">Aplicaciones</a></li><li><a href="aplicaciones.html#${a.categoria}">${esc(cat.corto || "")}</a></li><li><span aria-current="page">${esc(a.nombre)}</span></li></ol></nav>
      <div class="detail-copy">
        <h1>${esc(a.nombre)}</h1>
        <p class="lead detail-lema">${esc(a.lema)}</p>
        <p>${esc(a.descripcion)}</p>
        <div class="hero-actions">${on ? `<a class="btn btn-primary" href="${SITE}/${a.id}/">Abrir ${esc(a.nombre)}</a>` : `<span class="btn btn-ghost" aria-disabled="true">Disponible próximamente</span>`}</div>
      </div>
    </div></section>
    <section class="section"><div class="wrap detail-main">
      <section id="que-hace" class="detail-sec"><h2>Qué hace</h2><ul class="puntos">${a.puntos.map((p) => `<li><span>${esc(p)}</span></li>`).join("")}</ul></section>
      <section id="citar" class="detail-sec"><h2>Cómo citar</h2><div class="cite-box"><p class="cite-text">${esc(cite)}</p></div></section>
    </div></section>`;
}

/* ---------- Páginas de aplicaciones ---------- */
for (const a of APPS) {
  const cat = CATS[a.categoria] || {};
  const jsonld = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: a.nombre, alternateName: a.id, description: a.descripcion, url: appUrl(a),
    applicationCategory: "ScienceApplication", applicationSubCategory: cat.nombre,
    operatingSystem: "Any (web browser)", browserRequirements: "An up-to-date desktop web browser",
    softwareVersion: a.version || undefined, license: `https://spdx.org/licenses/${a.licencia}.html`,
    isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "MXN" },
    author, creator: author, inLanguage: ["es", "en"],
    image: `${SITE}/assets/og/${a.id}.jpg`, screenshot: `${SITE}/assets/apps/${a.id}.webp`,
    codeRepository: `${C.github}/${a.id}`,
    ...(a.doi ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: a.doi }, sameAs: `https://doi.org/${a.doi}` } : {}),
    ...(a.estado === "enlinea" ? { installUrl: `${SITE}/${a.id}/` } : {})
  };
  const html = head({
    title: `${a.nombre} · ${C.sitio} Suite`, desc: `${a.lema}. ${a.descripcion}`.slice(0, 300),
    url: appUrl(a), image: `${SITE}/assets/og/${a.id}.jpg`, base: "../../", jsonld, preloadImg: `assets/apps/${a.id}.webp`
  }) + `
<body data-page="app" data-id="${a.id}">
<a class="skip" href="apps/${slug(a)}/#detail">Saltar al contenido</a>
<div id="hdr" style="min-height:64px"></div>
<main id="main">
  <div id="detail">${staticDetail(a, cat)}</div>
  <section class="section band" id="relacionadas">
    <div class="wrap">
      <div class="section-head"><div><span class="eyebrow">Relacionadas</span><h2>De la misma área</h2></div></div>
      <div class="grid-apps" id="others"></div>
    </div>
  </section>
</main>
</body>
</html>
`;
  write(`apps/${slug(a)}/index.html`, html);
}

/* Cabecera de la entrada escrita en el HTML (el mismo marcado que arma
   blog() en assets/js/site.js): la página no se mueve al cargar. */
function postHead(p) {
  let date = p.fecha;
  try { date = new Date(p.fecha + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { /* fecha tal cual */ }
  return `<a href="blog.html" class="muted" style="font-size:.9rem">← Todas las entradas</a>
          <div class="tags">${p.etiquetas.map((t) => `<span class="chip chip-cat">${esc(t)}</span>`).join("")}</div>
          <h1 style="font-size:clamp(1.9rem,4vw,2.7rem)">${esc(p.titulo)}</h1>
          <time datetime="${p.fecha}">${date} · ${esc(C.autor)}</time>`;
}

/* ---------- Entradas del blog ---------- */
for (const p of POSTS) {
  const jsonld = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: p.titulo, description: p.resumen, datePublished: p.fecha, dateModified: p.fecha,
    url: postUrl(p), mainEntityOfPage: postUrl(p), author, publisher: { "@type": "Person", name: C.autor },
    keywords: p.etiquetas.join(", "), inLanguage: "es", image: `${SITE}/assets/og/default.jpg`
  };
  const html = head({
    title: `${p.titulo} · ${C.sitio} Suite`, desc: p.resumen, url: postUrl(p),
    image: `${SITE}/assets/og/default.jpg`, base: "../../", jsonld, type: "article"
  }) + `
<body data-page="blog" data-id="${p.slug}">
<a class="skip" href="blog/${p.slug}/#blogPost">Saltar al contenido</a>
<div id="hdr" style="min-height:64px"></div>
<main>
  <div id="blogList" hidden><section class="section"><div class="wrap"><div class="posts" id="posts"></div></div></section></div>
  <section class="section" id="blogPost">
    <div class="wrap">
      <article class="article">
        <header class="post-head" id="postHead">${postHead(p)}</header>
        <div class="prose" id="postBody" data-static>${MD.markdown(read(`blog/entradas/${p.slug}.md`))}</div>
        <div class="related" id="postApps"></div>
      </article>
    </div>
  </section>
</main>
</body>
</html>
`;
  write(`blog/${p.slug}/index.html`, html);
}

/* ---------- JSON-LD de publicaciones (se inserta en publicaciones.html) ---------- */
{
  const items = PUBS.filter((p) => p.doi).map((p, i) => ({
    "@type": "ListItem", position: i + 1,
    item: { "@type": p.tipo === "capitulo" ? "Chapter" : "ScholarlyArticle", name: p.titulo, datePublished: String(p.anio),
      author: p.autores.split(/,\s*/).map((n) => ({ "@type": "Person", name: n })),
      isPartOf: { "@type": "Periodical", name: p.revista }, identifier: `https://doi.org/${p.doi}`, url: `https://doi.org/${p.doi}` }
  }));
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: `Publicaciones de ${C.autor}`, numberOfItems: items.length, itemListElement: items };
  const tag = `<script type="application/ld+json" data-build>${JSON.stringify(ld)}</script>`;
  const p = "publicaciones.html"; let s = read(p);
  s = s.replace(/<script type="application\/ld\+json" data-build>[\s\S]*?<\/script>\n?/, "");
  s = s.replace("</head>", `${tag}\n</head>`);
  write(p, s);
}

/* ---------- sitemap.xml y robots.txt ---------- */
{
  const urls = [
    ["", "1.0"], ["aplicaciones.html", "0.9"], ["descargas.html", "0.8"], ["publicaciones.html", "0.8"], ["blog.html", "0.7"], ["acerca.html", "0.5"],
    ...APPS.map((a) => [`apps/${slug(a)}/`, a.estado === "enlinea" ? "0.9" : "0.6"]),
    ...POSTS.map((p) => [`blog/${p.slug}/`, "0.6", p.fecha])
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(([u, pr, d]) => `  <url><loc>${SITE}/${u}</loc><lastmod>${d || today}</lastmod><priority>${pr}</priority></url>`).join("\n") + `\n</urlset>\n`;
  write("sitemap.xml", xml);
  write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
}

console.log(`OK: ${APPS.length} apps, ${POSTS.length} entradas, sitemap con ${6 + APPS.length + POSTS.length} URLs`);
