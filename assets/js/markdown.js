/* LABG — Markdown de las entradas del blog.
   Convertidor propio y pequeño para lo que usan las entradas: títulos (#…######),
   párrafos, listas con viñeta o numeradas, citas (>), bloques de código (```),
   línea horizontal (---), **negritas**, *cursivas*, `código`, [enlaces](url),
   ![imágenes](url) y direcciones sueltas. Todo el texto se escapa primero.
   Lo usan la página (assets/js/site.js) y el compilador (scripts/build.mjs),
   que escribe la entrada ya convertida en el HTML: así ambos dan lo mismo. */
(function (root) {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function inline(s) {
    const code = [];
    s = esc(s).replace(/`([^`]+)`/g, (m, c) => { code.push(c); return `\u0000${code.length - 1}\u0000`; });
    const safe = (u) => /^(https?:|mailto:|#|\/|[\w.-]+(\/|\.html|\.md|$))/i.test(u) ? u : "#";
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, u) => `<img src="${safe(u)}" alt="${alt}" loading="lazy">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => /^https?:/i.test(u) ? `<a href="${safe(u)}" target="_blank" rel="noopener">${t}</a>` : `<a href="${safe(u)}">${t}</a>`)
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:])/g, (m, pre, u) => `${pre}<a href="${u}" target="_blank" rel="noopener">${u}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>")
      .replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, "$1<em>$2</em>");
    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${code[+i]}</code>`);
  }
  function markdown(src) {
    const lines = String(src).replace(/\r\n?/g, "\n").split("\n");
    const out = []; let i = 0;
    const isBlockStart = (l) => /^(#{1,6}\s|>\s?|```|\s*[-*+]\s+|\s*\d+[.)]\s+|-{3,}\s*$)/.test(l);
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { i++; continue; }
      let m;
      if ((m = l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) {
        const n = Math.min(6, Math.max(2, m[1].length));     /* el h1 es el título de la entrada */
        out.push(`<h${n}>${inline(m[2])}</h${n}>`); i++;
      } else if (/^```/.test(l)) {
        const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++; out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      } else if (/^-{3,}\s*$/.test(l)) {
        out.push("<hr>"); i++;
      } else if (/^>\s?/.test(l)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
        out.push(`<blockquote>${markdown(buf.join("\n"))}</blockquote>`);
      } else if ((m = l.match(/^\s*([-*+]|\d+[.)])\s+/))) {
        const ordered = /\d/.test(m[1]);
        const re = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
        const items = [];
        while (i < lines.length && (re.test(lines[i]) || (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length))) {
          if (re.test(lines[i])) items.push(lines[i].replace(re, "")); else items[items.length - 1] += " " + lines[i].trim();
          i++;
        }
        out.push(`<${ordered ? "ol" : "ul"}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`);
      } else {
        const buf = [];
        while (i < lines.length && lines[i].trim() && !(buf.length && isBlockStart(lines[i]))) buf.push(lines[i++].trim());
        out.push(`<p>${inline(buf.join(" "))}</p>`);
      }
    }
    return out.join("\n");
  }
  root.LABG_MD = { markdown };
})(typeof window !== "undefined" ? window : globalThis);
