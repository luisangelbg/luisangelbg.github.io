# Estudio de figuras LABG · cambios

## 1.1.0 · 1 de octubre de 2026

- **Exportación nativa.** Si la app sabe volver a dibujar una figura, el estudio le pide la figura a las medidas de salida en lugar de ampliar la imagen de la pantalla:
  - lo declara con `attach(el, { native })` o con el gancho `window.LABG_FIGSTUDIO.nativeExport`;
  - PNG con sus ppp, y SVG y PDF vectoriales;
  - el TIFF se arma con el PNG nativo;
  - copiar al portapapeles también usa la figura nativa.
- **Vista previa a tamaño de salida** sobre el papel. Se rehace al cambiar el tamaño o el fondo y se puede apagar. El alto automático toma la proporción real de la figura nativa.
- **Puente de Python** (`puentes/labg-pyfig.js`). Recuerda qué llamada de Python dibujó cada imagen y la vuelve a ejecutar con las medidas de salida. Conectado en StatsPro y BioModellingPro.
- **StatsPro:** su estudio de gráficas (bloque 2) ya abre en el estudio LABG.
- **Títulos:** se toman del rótulo que está justo antes de la figura.
- **Controles que la app oculta** porque no aplican: no aparecen en el inspector, que se rehace cuando la app los muestra u oculta.
- **PNG:** si ya trae su resolución escrita (pHYs), se reescribe en lugar de duplicarla.

## 1.0.0 · 1 de octubre de 2026

Primera versión.

- **Pantalla dividida:**
  - figura a la izquierda, siempre a la vista, sobre un papel del tamaño de salida, con siluetas de 114 y 180 mm;
  - inspector a la derecha, a la izquierda o flotante, y en el teléfono como hoja inferior;
  - barra fina arriba.
- **Sin mover nada de la app:**
  - la figura se eleva a la capa superior y los controles de la app se reflejan en el inspector;
  - el editor ✎ y el panel de estilo global se acoplan cuando existen.
- **Inspector:**
  - secciones plegables con íconos y buscador de controles;
  - paletas científicas con simulación de daltonismo;
  - texto y líneas para el tamaño de salida, con el texto más chico en puntos;
  - edición de textos con doble clic, historial con deshacer y rehacer, y comparación con cortina;
  - 11 preajustes de un clic, más los propios en JSON.
- **Exportación propia:**
  - PNG con ppp, SVG con estilos escritos y PDF de una página;
  - TIFF comprimido con su resolución;
  - en mm o pulgadas, a 300, 600 o 1200 ppp, con fondo transparente;
  - vista a tamaño real y copia al portapapeles.
- **Fuera del estudio:** con el menú de la figura abierto, la figura queda fija a la vista.
- **API:** `attach(el, {library, controls, onChange, export, title, key})` con adaptadores para SVG, lienzo, imagen y dos bibliotecas de gráficas.
- **Uso:** atajos de teclado, foco atrapado y devuelto, y ajustes recordados por app.
- **Íconos:** de Lucide (ISC); ver `../LICENSES-TERCEROS.md`.
