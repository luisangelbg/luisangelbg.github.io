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
const C = win.LABG_CONFIG, APPS = win.LABG_APPS, CATS = win.LABG_CATEGORIAS, PUBS = win.LABG_PUBLICACIONES, POSTS = win.LABG_BLOG;
const SITE = C.base.replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const slug = (a) => a.id.toLowerCase();
const appUrl = (a) => `${SITE}/apps/${slug(a)}/`;
const postUrl = (p) => `${SITE}/blog/${p.slug}/`;
const author = { "@type": "Person", name: C.autor, url: `https://orcid.org/${C.orcid}`, identifier: `https://orcid.org/${C.orcid}` };

function head({ title, desc, url, image, base, jsonld, type = "website" }) {
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:ital,wght@0,500;0,600;0,700;1,500&display=swap">
<link rel="stylesheet" href="assets/css/site.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script src="data/config.js"></script>
<script src="data/apps.js"></script>
<script src="data/publicaciones.js"></script>
<script src="data/blog.js"></script>
${type === "article" ? '<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>\n' : ""}<script src="assets/js/site.js"></script>
</head>`;
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
    url: appUrl(a), image: `${SITE}/assets/og/${a.id}.jpg`, base: "../../", jsonld
  }) + `
<body data-page="app" data-id="${a.id}">
<a class="skip" href="apps/${slug(a)}/#detail">Saltar al contenido</a>
<div id="hdr" style="min-height:64px"></div>
<main>
  <div id="detail"></div>
  <section class="section band">
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
        <header class="post-head" id="postHead"></header>
        <div class="prose" id="postBody"></div>
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
