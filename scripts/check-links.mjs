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
}
// Los DOI se comprueban en el registro oficial (api handles), no en la editorial:
// muchas revistas bloquean robots o tardan, y eso no significa que el DOI esté roto.
const dois = new Set([...APPS.filter((a) => a.doi).map((a) => a.doi), ...PUBS.filter((p) => p.doi).map((p) => p.doi)]);
const bad = [];
await Promise.all([...urls].map(async (u) => {
  for (let i = 0; i < 2; i++) {
    try { const r = await fetch(u, { method: i ? "GET" : "HEAD", redirect: "follow", headers: { "User-Agent": "labg-linkcheck" } }); if (r.ok || r.status === 403) return; if (i) bad.push(`${r.status} ${u}`); }
    catch (e) { if (i) bad.push(`ERR ${u}`); }
  }
}));
await Promise.all([...dois].map(async (d) => {
  try { const r = await fetch(`https://doi.org/api/handles/${d}`); const j = await r.json(); if (j.responseCode !== 1) bad.push(`DOI no registrado: ${d}`); }
  catch { bad.push(`DOI sin respuesta: ${d}`); }
}));
console.log(`${urls.size} enlaces y ${dois.size} DOI revisados, ${bad.length} rotos.`);
if (bad.length) { console.log(bad.join("\n")); process.exit(1); }
