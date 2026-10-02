# Pendientes priorizados (después de la v1.0.0)

Los módulos compartidos ya están integrados en las apps de análisis de la suite. LeafPro y FloralPro son apps educativas y quedan fuera: LeafPro conserva lo que ya tenía, sin más cambios, y FloralPro no los lleva. Esto es lo que falta, de lo más importante a lo menos.

## Prioridad alta

1. ~~**Editor ✎ común (`labg-figedit.js`).**~~ **Hecho** (1 de octubre de 2026). Está publicado en 10 apps: AgriDesign, BreedingPro, ClusteringPro, EconomicsPro, PCAPro, PhenologyPro, PollinationPro, PopGeneticsPro, ReviewPro y SciMetricsPro.
   - Es el mismo módulo en todas. Su fuente está en `shared/figure-editor/`, con guía, registro de cambios y copia fija `v1.0.0/`. Su autoprueba es `tests/figedit-selftest.js` (`FigEditSelfTest(clave)`). Antes de publicarlo pasó 783 comprobaciones sin fallas en figuras reales de las 8 apps nuevas.
   - El estudio lo acopla dentro del inspector y le deja las leyendas con entradas. Las barras de color se quedan en el estudio.
   - PollinationPro deja su editor propio (`figedit.js`) por el común. Las ediciones viejas, guardadas con otra clave, no se trasladan.
   - PhenologyPro también deja su editor propio, del que nació el común. Guarda con la misma clave y el mismo formato, así que sus ediciones se conservan. Sus 424 pruebas y la autoprueba común pasan.
2. ~~**StatsPro y BioModellingPro (figuras hechas en Python).**~~ **Hecho en la 1.1.0** (1 de octubre de 2026). El puente `labg-pyfig.js` vuelve a dibujar con Python cada figura a las medidas de salida (PNG con ppp, y SVG y PDF vectoriales), con vista previa a tamaño de salida. Ver la guía, sección 7.
3. ~~**Mapas con su propio estudio.**~~ **Hecho en la 1.2.0** (1 de octubre de 2026). Los mapas de PollinationPro y BioModellingPro abren en el estudio con su vista previa nativa y sus pestañas en el inspector. Exportan por el estudio de mapas de cada app: PNG, SVG, PDF, TIFF y GeoTIFF. Ver la guía, sección 8.
   - **SigmaPro**, en construcción en otra sesión, ya lleva el estudio 1.3.1 y el editor ✎ común (1 de octubre de 2026). Sus gráficas (`js/interfaz/graficas.js`) ya llevan las marcas del kit: área, rangos, ejes, rejilla, números, títulos y la leyenda de la gráfica de interacción. Sus colores también van ya en el SVG, como atributos con las variables del tema. Antes iban por clases CSS, que les ganaban a los cambios del editor. Ahora la pestaña Series los encuentra y la autoprueba del editor pasa completa. Su sesión guarda todo esto con su próximo commit.

## Prioridad media

3b. ~~**Navegador e idioma.**~~ **Hecho en la 1.0.1** (1 de octubre de 2026). El observador del idioma ya solo reacciona cuando el idioma cambia de verdad, como el del estudio. Está en las 15 apps de análisis y en LABG-Design. SigmaPro lo recibió al cerrar su Hito 1.8, en un commit aparte.

3c. ~~**Leyendas marcadas en los kits de dibujo.**~~ **Hecho** (1 de octubre de 2026). Con las marcas `data-role="legend"`, `data-li` y `data-plot`, el estudio acomoda la leyenda exactamente y el editor ✎ común las usa.
   - **Los kits** (`figure.js` o `plotkit.js`) de AgriDesign, BreedingPro, ClusteringPro, EconomicsPro, PollinationPro, PopGeneticsPro y SciMetricsPro ya tienen sus marcas publicadas. Las había preparado la sesión del editor ✎, que todavía no se publica. PhenologyPro y ReviewPro ya las tenían.
   - **Las leyendas propias** de cada app, fuera del kit, van marcadas igual: las de PCAPro, AgriDesign, BreedingPro, ClusteringPro, PopGeneticsPro, SciMetricsPro, PollinationPro, ReviewPro, PhylogenyPro y BioModellingPro. Las barras de color y las leyendas de tamaño van en grupos `data-legend`.
   - **Sin marca, por su naturaleza:**
     - las leyendas en HTML de GermplasmPro, que están fuera de la figura;
     - las de las figuras de Python de StatsPro y BioModellingPro, que acomoda Python;
     - las de los mapas;
     - las claves que son solo texto.

4. ~~**Secciones sin título.**~~ **Hecho** (1 de octubre de 2026, con el navegador 1.0.2):
   - **GermplasmPro:** títulos numerados en los bloques 4, 9 y 10, en los dos idiomas; en el 9 no salen al imprimir. Sus bloques 6, 7 y 8 ya tenían títulos, pero el navegador los juntaba en una sola sección; desde la 1.0.2 los separa.
   - **BioModellingPro:** título «Reglas de depuración» en la primera tarjeta del Bloque 3. En el Bloque 9, los resultados del modelo ya salen como secciones. El Bloque 4 es un solo mapa y se queda sin índice a propósito.
   - **SigmaPro** recibe el navegador 1.0.2 cuando su sesión cierre el hito en curso.
5. **SciMetricsPro.** El navegador agrega ruta, modos y paleta, pero respeta sus rutas `#/…` y su menú. Falta:
   - un índice por pestaña (las secciones viven dentro de `.tab-panel`);
   - enlaces a una pestaña concreta.
6. **PDF vectorial.** El PDF del estudio lleva la imagen a la resolución elegida. Un PDF con trazos (desde el SVG) sería más liviano y escalable para las revistas que lo pidan. Mientras tanto, el SVG cubre ese caso.
7. **Tema oscuro y fondo blanco.** En tema oscuro las figuras usan colores claros. El estudio avisa, pero podría pasar la figura a colores claros solo al exportar si la app expone su tema de figuras (por ejemplo, `FigStyle` o el `theme` de `Fig.mount`).

## Prioridad baja

8. **Pruebas con Playwright.** Están escritas en `shared/tests/`. Las mismas comprobaciones ya se corrieron por CDP en las 15 apps y los 3 tamaños. Correrlas con `npx playwright test` necesita `npm i -D @playwright/test` (no hay npm en esta máquina).
9. **Versión en inglés de las guías** (`GUIA-INTEGRACION.md`).
10. ~~**FloralPro**, si se decide integrarla.~~ **Descartada** (1 de octubre de 2026). FloralPro y LeafPro son apps educativas y quedan fuera de los módulos de la suite.
11. **Nuevas versiones de las apps.** Los módulos tienen su propia versión (navegador 1.0.2, estudio 1.3.1, editor ✎ 1.0.0). No se publicaron versiones nuevas en Zenodo ni se cambió el DOI de ninguna app (decisión pendiente del autor).
