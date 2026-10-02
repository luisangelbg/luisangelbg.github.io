# Editor ✎ LABG · cambios

## 1.0.0 · 1 de octubre de 2026

Primera versión publicada como módulo común. Nació del editor propio de PhenologyPro.

- **Un panel por figura** con seis pestañas: General, Ejes y rejilla, Series, Leyenda, Textos y Anotaciones. La leyenda, las notas y las flechas se arrastran sobre la figura.
- **Ediciones por figura**, guardadas en el navegador con la clave de la app. Se vuelven a poner cada vez que la app redibuja la figura (datos, idioma o tema) y se escriben en el propio SVG, así que lo que se ve es lo que se exporta.
- **Lee el SVG como está** y aprovecha las marcas del kit de dibujo: `data-role` (leyenda, ejes, rejilla, números), `data-li`, `data-plot`, `data-xr`, `data-yr` y `data-y2r`.
- **Para exportar:** `strip`, `applyTo` y `bakeString`.
- **Para el registro de un informe:** `summary`.
- **Se acopla** dentro del inspector del Estudio de figuras LABG y recibe de él las leyendas con entradas.
- **Autoprueba:** `tests/figedit-selftest.js` (`FigEditSelfTest(clave)`).
- **Está en 10 apps:** AgriDesign, BreedingPro, ClusteringPro, EconomicsPro, PCAPro, PhenologyPro, PollinationPro, PopGeneticsPro, ReviewPro y SciMetricsPro.
  - El archivo es idéntico en todas; su huella MD5 es `9e1ec8be5da3054e9956f0a70b6aeeca`.
  - Lleva su número de versión adentro, como el Navegador y el Estudio: en la cabecera y en `FigEdit.version`. Se agregó el mismo día, sin cambiar nada más.
  - PhenologyPro y PollinationPro dejaron su editor propio por este.
