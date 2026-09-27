#!/usr/bin/env node
/* Comprueba que ningún enlace importante del portal esté roto (apps, manuales, DOI).
   Uso: node scripts/check-links.mjs   → termina con error si alguno falla. */
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const win = {}; for (const f of ["config", "apps", "publicaciones"]) vm.runInNewContext(fs.readFileSync(path.join(ROOT, `data/${f}.js`), "utf8"), { window: win });
const C = win.LABG_CONFIG, APPS = win.LABG_APPS, PUBS = win.LABG_PUBLICACIONES;
const urls = new Set([C.base + "/", C.base + "/sitemap.xml"]);
for (const a of APPS) {
  urls.add(`${C.base}/apps/${a.id.toLowerCase()}/`);
  if (a.estado !== "enlinea") continue;
  urls.add(`${C.base}/${a.id}/`);
  if (a.manualPdf) urls.add(`${C.base}/${a.id}/manual/${encodeURIComponent(a.manualPdf)}`);
  if (a.manualHtml) urls.add(`${C.base}/${a.id}/manual/es/manual-completo.html`);
  if (a.doi) urls.add(`https://doi.org/${a.doi}`);
}
for (const p of PUBS) if (p.doi) urls.add(`https://doi.org/${p.doi}`);
const bad = [];
await Promise.all([...urls].map(async (u) => {
  for (let i = 0; i < 2; i++) {
    try { const r = await fetch(u, { method: i ? "GET" : "HEAD", redirect: "follow", headers: { "User-Agent": "labg-linkcheck" } }); if (r.ok || r.status === 403) return; if (i) bad.push(`${r.status} ${u}`); }
    catch (e) { if (i) bad.push(`ERR ${u}`); }
  }
}));
console.log(`${urls.size} enlaces revisados, ${bad.length} rotos.`);
if (bad.length) { console.log(bad.join("\n")); process.exit(1); }
