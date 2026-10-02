# Pendientes priorizados (después de la v1.0.0)

Los dos módulos ya están integrados en las 15 apps de la suite (FloralPro quedó fuera, como en las rondas anteriores). Esto es lo que falta, de lo más importante a lo menos.

## Prioridad alta

1. ~~**Editor ✎ común (`labg-figedit.js`).**~~ **Hecho** (1 de octubre de 2026). Está publicado en 10 apps: AgriDesign, BreedingPro, ClusteringPro, EconomicsPro, PCAPro, PhenologyPro, PollinationPro, PopGeneticsPro, ReviewPro y SciMetricsPro.
   - Es el mismo módulo en todas. Su fuente está en `shared/figure-editor/`, con guía, registro de cambios y copia fija `v1.0.0/`. Su autoprueba es `tests/figedit-selftest.js` (`FigEditSelfTest(clave)`). Antes de publicarlo pasó 783 comprobaciones sin fallas en figuras reales de las 8 apps nuevas.
   - El estudio lo acopla dentro del inspector y le deja las leyendas con entradas. Las barras de color se quedan en el estudio.
   - PollinationPro deja su editor propio (`figedit.js`) por el común. Las ediciones viejas, guardadas con otra clave, no se trasladan.
   - PhenologyPro también deja su editor propio, del que nació el común. Guarda con la misma clave y el mismo formato, así que sus ediciones se conservan. Sus 424 pruebas y la autoprueba común pasan.
2. ~~**StatsPro y BioModellingPro (figuras hechas en Python).**~~ **Hecho en la 1.1.0** (1 de octubre de 2026). El puente `labg-pyfig.js` vuelve a dibujar con Python cada figura a las medidas de salida (PNG con ppp, y SVG y PDF vectoriales), con vista previa a tamaño de salida. Ver la guía, sección 7.
3. ~~**Mapas con su propio estudio.**~~ **Hecho en la 1.2.0** (1 de octubre de 2026). Los mapas de PollinationPro y BioModellingPro abren en el estudio con su vista previa nativa y sus pestañas en el inspector. Exportan por el estudio de mapas de cada app: PNG, SVG, PDF, TIFF y GeoTIFF. Ver la guía, sección 8.
   - **SigmaPro**, en construcción en otra sesión, lleva todavía el estudio 1.0.0. Al integrarla, copiar la versión vigente.

## Prioridad media

3b. **Navegador e idioma.** Su observador del idioma rehace etiquetas, barra e índice cada vez que una app vuelve a escribir el mismo `lang` (por ejemplo, al traducir un panel). No se cuelga, pero conviene la misma comprobación que tiene el estudio desde la 1.2.0. Se dejó sin tocar porque otra sesión tenía cambios abiertos en el navegador.

3c. ~~**Leyendas marcadas en los kits de dibujo.**~~ **Hecho** (1 de octubre de 2026). Con las marcas `data-role="legend"`, `data-li` y `data-plot`, el estudio acomoda la leyenda exactamente y el editor ✎ común las usa.
   - **Los kits** (`figure.js` o `plotkit.js`) de AgriDesign, BreedingPro, ClusteringPro, EconomicsPro, PollinationPro, PopGeneticsPro y SciMetricsPro ya tienen sus marcas publicadas. Las había preparado la sesión del editor ✎, que todavía no se publica. PhenologyPro y ReviewPro ya las tenían.
   - **Las leyendas propias** de cada app, fuera del kit, van marcadas igual: las de PCAPro, AgriDesign, BreedingPro, ClusteringPro, PopGeneticsPro, SciMetricsPro, PollinationPro, ReviewPro, PhylogenyPro y BioModellingPro. Las barras de color y las leyendas de tamaño van en grupos `data-legend`.
   - **Sin marca, por su naturaleza:**
     - las leyendas en HTML de GermplasmPro, que están fuera de la figura;
     - las de las figuras de Python de StatsPro y BioModellingPro, que acomoda Python;
     - las de los mapas;
     - las claves que son solo texto.

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
11. **Nuevas versiones de las apps.** Los módulos tienen su propia versión (navegador 1.0.0, estudio 1.3.1). No se publicaron versiones nuevas en Zenodo ni se cambió el DOI de ninguna app (decisión pendiente del autor).
