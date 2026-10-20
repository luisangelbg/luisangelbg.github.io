/* =====================================================================
   PORTAL LABG — motor bilingüe (español / inglés)
   ---------------------------------------------------------------------
   El sitio se escribe en español y se traduce al vuelo, igual que en las
   aplicaciones de la suite: el diccionario (assets/js/dic.js) tiene como
   clave el texto en español, de modo que una traducción que falte se nota
   —se ve el texto español— en lugar de romperse en silencio.

   El idioma se decide en este orden:
     1. ?lang=es|en en la dirección (y se recuerda);
     2. lo que la persona eligió antes, guardado en labg.lang;
     3. el idioma del navegador: inglés si el navegador está en inglés;
     4. español, que es el idioma de la suite.

   Cómo traduce: el portal pinta casi todo con JavaScript y desde varios
   archivos (site.js, nav.js, home.js, chapters.js…), así que en vez de
   marcar cada cadena en el código, el motor recorre el árbol ya construido
   y cambia los textos y los atributos que encuentra en el diccionario.
   Un observador repite esa pasada sobre lo que se añade después —paneles,
   tarjetas, resultados de búsqueda—, de modo que el contenido dinámico
   queda traducido sin tocar los archivos que lo generan. Las cadenas que
   llevan una cifra dentro sí se traducen desde el código, con t().

   La misma preferencia viaja a las aplicaciones: los enlaces de «Abrir»
   llevan ?lang=, que PCAPro ya entiende y las demás ignoran sin daño.
   ===================================================================== */
window.LABG_I18N = (function () {
  const CLAVE = "labg.lang";
  const SOPORTADOS = ["es", "en"];

  let lang = "es";
  try {
    const url = new URLSearchParams(location.search).get("lang");
    const guardado = localStorage.getItem(CLAVE);
    if (SOPORTADOS.includes(url)) { lang = url; localStorage.setItem(CLAVE, url); }
    else if (SOPORTADOS.includes(guardado)) { lang = guardado; }
    else { lang = /^en\b/i.test(navigator.language || "") ? "en" : "es"; }
  } catch (e) { /* navegación privada o dirección rara: queda el español */ }

  document.documentElement.lang = lang;

  const DIC = window.LABG_DIC || {};
  const en = lang === "en";
  const t = (s) => (en && DIC[s]) ? DIC[s] : s;

  function set(nuevo) {
    if (!SOPORTADOS.includes(nuevo) || nuevo === lang) return;
    try { localStorage.setItem(CLAVE, nuevo); } catch (e) { /* ignorar */ }
    const u = new URL(location.href);
    u.searchParams.delete("lang");   /* manda la preferencia guardada */
    location.replace(u.toString());
  }

  /* ---------- la pasada por el árbol ---------- */
  /* no se entra a estas etiquetas: su contenido no es texto para leer */
  const MUDAS = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, SVG: 1, svg: 1 };
  const ATRIBUTOS = ["placeholder", "title", "aria-label", "alt", "aria-placeholder", "content"];

  function texto(nodo) {
    const s = nodo.nodeValue;
    if (!s) return;
    const limpio = s.trim();
    if (!limpio || !DIC[limpio]) return;
    /* se conservan los espacios y saltos que rodeaban al texto */
    nodo.nodeValue = s.slice(0, s.indexOf(limpio[0])) + DIC[limpio]
      + s.slice(s.indexOf(limpio[0]) + limpio.length);
  }

  function elemento(el) {
    for (const a of ATRIBUTOS) {
      if (a === "content" && el.tagName !== "META") continue;
      if (!el.hasAttribute(a)) continue;
      const v = el.getAttribute(a).trim();
      if (DIC[v]) el.setAttribute(a, DIC[v]);
    }
  }

  /* los títulos animados de la portada traen una palabra por <span>, para que
     entren escalonadas. Traducirlos palabra por palabra sería absurdo —el orden
     y el número cambian—, así que se traduce la frase entera y se vuelven a
     repartir los <span>, dejando el énfasis en el último, como en el original. */
  function frases(raiz) {
    const h = raiz.querySelectorAll ? raiz.querySelectorAll(".words") : [];
    (raiz.classList && raiz.classList.contains("words") ? [raiz, ...h] : h).forEach((el) => {
      if (el.dataset.i18nHecho) return;
      const frase = el.textContent.replace(/\s+/g, " ").trim();
      const nueva = DIC[frase];
      if (!nueva) return;
      const conEnfasis = !!el.querySelector("em");
      const palabras = nueva.split(" ");
      el.innerHTML = palabras.map((p, i) => {
        const dentro = (conEnfasis && i === palabras.length - 1) ? "<em>" + p + "</em>" : p;
        return '<span class="w" style="--i:' + i + '">' + dentro + "</span>";
      }).join(" ");
      el.dataset.i18nHecho = "1";
    });
  }

  function aplicar(raiz) {
    if (!en || !raiz) return;
    if (raiz.nodeType === 3) { texto(raiz); return; }
    if (raiz.nodeType !== 1 && raiz.nodeType !== 9 && raiz.nodeType !== 11) return;
    if (raiz.nodeType === 1) {
      if (MUDAS[raiz.tagName]) return;
      elemento(raiz);
    }
    /* primero las frases animadas: si se tradujeran palabra por palabra, la
       frase entera dejaría de encontrarse en el diccionario */
    frases(raiz);
    const it = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeType === 1 && MUDAS[n.tagName])
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let n;
    while ((n = it.nextNode())) { if (n.nodeType === 3) texto(n); else elemento(n); }
  }

  /* las cadenas que llevan una cifra o un nombre dentro se traducen desde el
     código: la clave trae {llaves} que aquí se rellenan. */
  function fmt(clave, datos) {
    return String(t(clave)).replace(/\{(\w+)\}/g, (m, k) => (k in datos ? datos[k] : m));
  }

  /* lo que se dibuja después —paneles, tarjetas, sugerencias— pasa por aquí */
  function vigilar() {
    if (!en || !window.MutationObserver) return;
    new MutationObserver((cambios) => {
      for (const c of cambios) for (const n of c.addedNodes) aplicar(n);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ---------- el conmutador ES | EN de la barra ---------- */
  function conmutador() {
    return '<div class="seg lang-seg" role="group" aria-label="Idioma / Language">'
      + SOPORTADOS.map((l) => '<button type="button" data-lang="' + l + '"'
          + ' title="' + (l === "es" ? "Español" : "English") + '"'
          + ' aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + "</button>").join("")
      + "</div>";
  }
  function enlazar(raiz) {
    (raiz || document).querySelectorAll(".lang-seg button").forEach((b) => {
      b.addEventListener("click", () => set(b.dataset.lang));
    });
  }
  /* la portada trae su barra escrita en el HTML: ahí el conmutador se inserta */
  function montarEnPortada() {
    const tools = document.querySelector(".nav-tools");
    if (!tools || tools.querySelector(".lang-seg")) return;
    tools.insertAdjacentHTML("afterbegin", conmutador());
    enlazar(tools);
  }

  /* para los enlaces que abren una aplicación en el idioma que se está leyendo */
  const conIdioma = (url) => (en ? url + (url.includes("?") ? "&" : "?") + "lang=en" : url);

  function arranque() {
    montarEnPortada();
    aplicar(document.body);
    aplicar(document.head);
    vigilar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arranque);
  else arranque();

  return { get lang() { return lang; }, t, fmt, set, conmutador, enlazar, conIdioma, aplicar };
})();
