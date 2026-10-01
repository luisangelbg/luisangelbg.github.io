# Mapa de las apps (auditoría previa a la v1.0.0)

Así están hechas las 15 apps de la suite. Este mapa se revisó en el código antes de escribir los dos módulos, y sirve para mantenerlos.

- **Bloque:** cada panel de la barra.
- **Sección:** cada parte que el navegador lista dentro de un bloque.
- **Dependencias:** qué abre cada bloque.
- **Figuras:** cómo se dibujan y dónde está su menú.

## Lo común

- **Base común:** `js/labg-core.js` (`window.LABG`) y `css/labg-base.css` son iguales en todas, salvo `LABG.REPO`. SciMetricsPro los tiene en `js/core/`.
- **Barra superior:** `header.topbar` sticky (z 50; en BioModellingPro, z 900, por los mapas). Mide unos 95 px con la barra de bloques; sin ella, unos 53 px.
- **Bloques:** `button.step-btn[data-step]` dentro de `nav.stepper`, con los estados `.active` y `[aria-current=step]`, `.done`, `.warn`, `disabled` y `.soon`.
- **Panel de cada bloque:** `section.step-panel#panel-N` (se muestra con `.active`). Se activa con el clic del botón: siempre conviene usar ese clic, porque algunas apps cuelgan lógica de él.
- **Al cambiar de bloque**, la app:
  - hace `scrollTo(0)`;
  - en varias apps, emite `stepchange` en `document`;
  - agrega `nav.step-footer` como último hijo del panel.
- **Teclado:** `LABG.shortcuts([])` deja `?`, Alt+←/→ y las flechas en la barra. **Ninguna app usaba Ctrl+K ni `[`.**
- **Idioma:** cambia `<html lang>`. Los textos bilingües van en `span[data-l]` o en `data-es`/`data-i18n`.

## Por app

| App | Bloques | Secciones | Dependencias | Dirección | Teclas propias |
|---|---|---|---|---|---|
| AgriDesign | 8 (1–8) | `.card>h2` (y `.panel-title` de bloque); resultados en `#anResults`, `#gfxMain`… | Bloques 3–7 bloqueados sin datos; `#gfxNoResults` y `#rpNoResults` («Run Block 5 first») | no | — |
| StatsPro (AnalizaR) | 7 (0–6) | Bloques 1–3: `.card>h2`. Bloques 4–6: una tarjeta grande con `.subtab-panel` y `.card>h3` | Bloques 2–6 bloqueados sin datos | no | — |
| BioModellingPro | 11 (0–10) | `.card` con `h2` o `.results-header h2`; anidado variable (`#mlSections`…) | Bloques 2–10 bloqueados; avisos «Primero extrae…» | no | ← → en las pestañas de sus estudios |
| BreedingPro | 12 (1–12) | `.card#bNXxx>h2`, directas | Nunca bloquea; sin datos oculta tarjetas y avisa | no | Ctrl dentro de la hoja de datos |
| ClusteringPro | 8 (1–8) | `.card>h2`; teoría `.theory-card` | Bloques 3–7 bloqueados sin datos | no | — |
| EconomicsPro | 10 (1–10) | `.card>h2`, directas | Ninguna (proyecto por omisión) | no | Enter y flechas en las rejillas |
| GermplasmPro | 10 (1–10) | `h3.section-title` + hermanos (sin envoltorio); en los bloques 5–8, dentro de `#bNBody`; bloque 3, `.qc-section` | `div.sim-empty` «Primero carga tus accesiones en el Bloque 2.» | `#bN` (lee y escribe) | — |
| LeafPro | 8 (1–8) | `h2.section-title` + hermanos; atlas con categorías `h3.at-cat-title` | Ninguna | `#bN` (lee y escribe) | Espacio, ← → y Esc en el modo clase |
| PCAPro | 8 (0–7; el 7 es el «5b») | `.card>h2`; resultados en `#pcaResults`, `#rotResults`… | Bloques 2–7 se abren en cadena | no | — |
| PhenologyPro | 10 (1–10) | `.card>h2`; bloques 3–10 dentro de `#bNBody` | `.soon-box#bNEmpty` «Primero hace falta una serie» | no | Esc |
| PhylogenyPro | 12 (1–12) | `.card` directas con `.card-head h2` | Tarjetas «sin datos» `#…NoData` y `#…NoTree` | no | Ctrl+rueda en el alineamiento |
| PollinationPro | 10 (1–10) | `.card>h2`; `#bNBody` y `#bNBody2` | Bloques bloqueados sin registros; `.soon-box#bNEmpty` | no | Enter en las listas del bloque 2 |
| PopGeneticsPro | 10 (1–10) | `.card` «N · Título»; resultados en `#…Results` | Bloques 3–10 bloqueados según el tipo de datos | no | Ctrl dentro de la hoja de datos |
| ReviewPro | 10 (1–10) | `.card` directas con `h2` numerado | Ninguna; vacíos con `p.hint` | lee `#bN` al iniciar | Bloque 4: I, E, M, ?, Z, N, 1–9; bloque 5: I, 1–9 |
| SciMetricsPro | 13 rutas `#/id` en menú lateral | Una vista (`#view`) reconstruida por ruta; pestañas `.tab-panel` y `section.card` | Enlaces `.locked` sin datos; `section.empty-state` | `#/id` (rutas) | PRISMA: I, E, D, U, ← →; red: + − 0 |

## Figuras por familia

| Familia | Apps | Contenedor | Menú de la app | ¿Se redibuja? |
|---|---|---|---|---|
| `Fig.mount` | PCAPro, ClusteringPro, AgriDesign, PopGeneticsPro, BreedingPro, SciMetricsPro | Anfitrión con id (`.fig-block`; en PCAPro, el padre de `.fig-canvas`) > `.fig-head h4` + `.fig-canvas>svg` | `details.fig-editor` debajo, con pestañas, más `.fig-tools` (formato, ppp, fondo y descarga) | Sí: un `<svg>` nuevo en cada cambio |
| Kit `Plot` | PhenologyPro, PollinationPro, EconomicsPro, ReviewPro | `.pg-pane > .pg-title + svg#id` | ⤓ `.fig-dl` (menú flotante), ✎ `.fig-ed` (FigEdit) y panel global `#figStylePanel` (FigStyle) | No: el mismo `<svg>`, con sus hijos de nuevo |
| SVG en cadena | GermplasmPro, PhylogenyPro, LeafPro | `.pg-pane`, `.map-wrap`, `#…Fig` | Controles en la tarjeta (encima) y descarga debajo | Sí: `innerHTML` |
| Imágenes de Python | StatsPro, BioModellingPro (bloques 8–9) | `.fig-card` / `.fig-box > img` | Barras de estilo por bloque y descargas `[data-f]` | Sí: `<img>` nuevo |
| Estudios propios ya divididos | PollinationPro (mapa), BioModellingPro (`fstudio`/`mstudio`), StatsPro (estudio de gráficas) | — | Ya son pantallas divididas: el mapa y el estudio de gráficas quedan **fuera** del estudio LABG | — |

**Conflictos que se evitaron:**

- El nombre «Estudio de figuras» ya lo usaban:
  - el panel global de PhenologyPro, PollinationPro y ReviewPro;
  - las tarjetas del bloque 12 de PhylogenyPro y del bloque 10 de EconomicsPro.

  Dentro del estudio LABG, esos paneles aparecen como «Estilo de todas las figuras (de la app)».
- El navegador no crea botones `.step-btn` (`labg-core` los contaría dos veces) y no busca paneles con `[id^="panel-"]` (SciMetricsPro usa `#panel-keywords`).
