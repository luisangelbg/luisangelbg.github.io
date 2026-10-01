# Pendientes priorizados (después de la v1.0.0)

Los dos módulos ya están integrados en las 15 apps de la suite (FloralPro quedó fuera, como en las rondas anteriores). Esto es lo que falta, de lo más importante a lo menos.

## Prioridad alta

1. **Editor ✎ común (`labg-figedit.js`).** Está en 9 apps sin subir, trabajo de otra sesión. El estudio ya lo acopla dentro del inspector cuando existe; se probó en PCAPro, AgriDesign, BreedingPro, EconomicsPro y ReviewPro. Al subirlo, aparece solo en el estudio de esas apps.
2. **StatsPro y BioModellingPro (figuras hechas en Python).** Son imágenes PNG a 170 ppp, así que exportarlas desde el estudio a 600 ppp no agrega detalle. Falta conectar `export.render` a la exportación de Python de cada app (`export_plot` con los ppp elegidos), para que el estudio pida la figura a la resolución correcta.
3. **Mapas con su propio estudio:**
   - PollinationPro (`.ms-view`, MapStudio).
   - BioModellingPro (`.main-map`, en lienzo, con `mstudio`).

   Hoy quedan fuera del estudio porque ya son pantallas divididas. Lo siguiente es registrarlos con `attach()` para que tengan la misma barra (historial, preajustes, exportación en mm), sin perder sus pestañas.

## Prioridad media

4. **Secciones sin título.** Algunos bloques no tienen títulos de sección, así que el índice no aparece:
   - GermplasmPro, bloques 4, 9 y 10;
   - LeafPro, bloques 6 a 8;
   - parte de BioModellingPro.

   Ponerles un `h2`/`h3` (o `data-labg-section`) les daría índice y modo enfocado.
5. **SciMetricsPro.** El navegador agrega ruta, modos y paleta, pero respeta sus rutas `#/…` y su menú. Falta:
   - un índice por pestaña (las secciones viven dentro de `.tab-panel`);
   - enlaces a una pestaña concreta.
6. **PDF vectorial.** El PDF del estudio lleva la imagen a la resolución elegida. Un PDF con trazos (desde el SVG) sería más liviano y escalable para las revistas que lo pidan. Mientras tanto, el SVG cubre ese caso.
7. **Tema oscuro y fondo blanco.** En tema oscuro las figuras usan colores claros. El estudio avisa, pero podría pasar la figura a colores claros solo al exportar si la app expone su tema de figuras (por ejemplo, `FigStyle` o el `theme` de `Fig.mount`).

## Prioridad baja

8. **Pruebas con Playwright.** Están escritas en `shared/tests/`. Las mismas comprobaciones ya se corrieron por CDP en las 15 apps y los 3 tamaños. Correrlas con `npx playwright test` necesita `npm i -D @playwright/test` (no hay npm en esta máquina).
9. **Versión en inglés de las guías** (`GUIA-INTEGRACION.md`).
10. **FloralPro**, si se decide integrarla.
11. **Nuevas versiones de las apps.** Los módulos tienen su propia versión (1.0.0). No se publicaron versiones nuevas en Zenodo ni se cambió el DOI de ninguna app (decisión pendiente del autor).
