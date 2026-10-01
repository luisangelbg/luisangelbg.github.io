# Estudio de figuras LABG · cambios

## 1.2.0 · 1 de octubre de 2026

- **Mapas en el estudio.** El mapa del bloque 4 de PollinationPro y los mapas interactivos de BioModellingPro se abren en el estudio:
  - la misma barra (historial, preajustes, exportación en mm y ppp);
  - la exportación la hace el estudio de mapas de cada app, incluido el GeoTIFF;
  - sus pestañas aparecen en el inspector.

  Ver la guía, sección 8.
- **Reabrir una figura redibujada.** Si la app reemplazaba la figura al redibujarla (al cambiar un control, el idioma o el tema), su botón dejaba de abrir el estudio. Pasaba, por ejemplo, con el biplot de PCAPro. Ahora el botón abre la figura que ocupa su lugar, y `open()` también.
- **Página congelada al abrir algunas figuras.** Venía desde la 1.0.0 y se encontró en PhenologyPro (climograma del bloque 3). Al acoplarse, el editor ✎ propio de esa app vuelve a escribir el mismo idioma en la página; el estudio lo tomaba como un cambio de idioma y volvía a armar el inspector y a acoplar el editor, sin fin. Ahora solo reacciona cuando el idioma cambia de verdad.
- **Descripción nativa ampliada** con siete campos opcionales: `extra`, `notes`, `studioStyles`, `lift`, `aspect`, `title` y `controls`.
- **Figuras que no se elevan** (`lift: false`). El papel muestra siempre la vista previa nativa, que también es el «antes» de la comparación y recibe la simulación de daltonismo.
- **Formatos de la app.** Los que la app agrega aparecen junto a PNG, SVG, PDF y TIFF, cada uno con su nota. El PDF sale del PNG nativo cuando la app no lo dibuja. El GeoTIFF se nombra `…-geo.tif`.
- **Inspector:**
  - los paneles con pestañas se reparten en un grupo por pestaña;
  - las pestañas de un panel único aparecen como fichas;
  - cada control lleva el subtítulo de su sección;
  - los botones con título y descripción se leen en dos renglones;
  - las etiquetas ya no llevan pegado el valor del deslizador («Grosor0.6»);
  - la búsqueda encuentra también por subtítulo.
- **Vista previa:**
  - los controles de la app, deshacer y rehacer la renuevan cuando la figura no se eleva;
  - mientras se exporta, espera su turno.
- **Proporción exacta** de lo que dibuja la app (`aspect`): la lectura de píxeles coincide con el archivo.
- **BioModellingPro:** su perfil nunca se aplicaba porque el nombre de la app es «BioModelling Pro»; la clave ahora es `biomodelling`.

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
