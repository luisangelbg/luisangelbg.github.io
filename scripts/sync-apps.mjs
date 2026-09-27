#!/usr/bin/env node
/* =====================================================================
   SINCRONIZA data/apps.js CON TUS REPOSITORIOS DE GITHUB
   Para cada app del catálogo consulta:
     - https://luisangelbg.github.io/<id>/          → ¿está publicada? (estado)
     - <repo>/CITATION.cff                          → version, doi
     - <repo>/manual/                               → manualPdf, manualMb, manualHtml
   y actualiza esos campos en data/apps.js sin tocar el resto (nombre, lema,
   descripción, puntos…). Los campos con  // fijo  al final de la línea no se tocan.
   Uso:  node scripts/sync-apps.mjs        (GITHUB_TOKEN opcional, sube el límite de la API)
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "data/apps.js");
const win = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data/config.js"), "utf8"), { window: win });
vm.runInNewContext(fs.readFileSync(FILE, "utf8"), { window: win });
const C = win.LABG_CONFIG, APPS = win.LABG_APPS;
const OWNER = C.github.split("/").pop();
const H = { "User-Agent": "labg-sync", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };

let answered = 0; // respuestas reales de GitHub (para no escribir nada si no hay red)
async function get(url, as = "text") {
  try { const r = await fetch(url, { headers: H, redirect: "follow" }); answered++; if (!r.ok) return r.status === 404 ? "404" : null; return as === "json" ? r.json() : r.text(); }
  catch { return null; }
}
async function head(url) { try { const r = await fetch(url, { method: "HEAD", headers: H, redirect: "follow" }); return r.ok; } catch { return false; } }
const cff = (txt, key) => { const m = txt && txt.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, "m")); return m ? m[1].trim() : ""; };

let src = fs.readFileSync(FILE, "utf8");
const changes = [];

function setField(id, field, value) {
  // localiza el bloque de la app y sustituye  field: "..."  dentro de él
  const start = src.indexOf(`id: "${id}"`); if (start < 0) return;
  const end = src.indexOf("\n  }", start);
  const block = src.slice(start, end);
  const re = new RegExp(`(\\b${field}:\\s*)("[^"]*"|true|false|[\\d.]+)([^\\n]*)`);
  const m = block.match(re); if (!m) return;
  if (/\/\/\s*fijo/.test(m[3])) return; // el autor pidió no tocarlo
  const lit = typeof value === "string" ? `"${value}"` : String(value);
  if (m[2] === lit) return;
  const nb = block.replace(re, `$1${lit}$3`);
  src = src.slice(0, start) + nb + src.slice(end);
  changes.push(`${id}: ${field} ${m[2]} → ${lit}`);
}

for (const a of APPS) {
  const repo = `${OWNER}/${a.id}`;
  const pages = await head(`${C.base}/${a.id}/`);
  const meta = await get(`https://api.github.com/repos/${repo}`, "json");
  if (meta === null) { process.stdout.write(`${a.id.padEnd(16)} sin respuesta de GitHub; se deja como está\n`); continue; }
  const exists = meta !== "404" && !meta.message;
  const branch = (meta && meta.default_branch) || "main";
  const raw = (p) => `https://raw.githubusercontent.com/${repo}/${branch}/${p}`;
  const cit0 = exists ? await get(raw("CITATION.cff")) : null; const cit = cit0 === "404" ? null : cit0;
  const manual0 = exists ? await get(`https://api.github.com/repos/${repo}/contents/manual`, "json") : null; const manual = manual0 === "404" ? [] : manual0;
  const pdf = Array.isArray(manual) ? manual.find((f) => /\.pdf$/i.test(f.name)) : null;
  const htmlOk = exists && await head(raw("manual/es/manual-completo.html"));

  setField(a.id, "estado", pages ? "enlinea" : "proximamente");
  if (cit) {
    const v = cff(cit, "version"); if (v) setField(a.id, "version", v);
    const d = cff(cit, "doi").replace(/^https?:\/\/doi\.org\//, ""); if (d) setField(a.id, "doi", d);
    const lic = cff(cit, "license").replace(/-or-later$/, ""); if (lic) setField(a.id, "licencia", lic);
  }
  if (Array.isArray(manual)) {
    setField(a.id, "manualPdf", pdf ? pdf.name : "");
    setField(a.id, "manualMb", pdf ? Math.round(pdf.size / 1048576) : 0);
    setField(a.id, "manualHtml", !!htmlOk);
  }
  process.stdout.write(`${a.id.padEnd(16)} repo:${exists ? "sí" : "no"}  pages:${pages ? "sí" : "no"}  cff:${cit ? "sí" : "no"}  pdf:${pdf ? "sí" : "no"}\n`);
}

if (!answered) { console.log("\nGitHub no respondió a ninguna consulta; no se modifica nada."); process.exit(0); }
if (changes.length) {
  fs.writeFileSync(FILE, src);
  console.log(`\n${changes.length} cambio(s):\n- ` + changes.join("\n- "));
} else console.log("\nSin cambios.");
