# Estudio de figuras LABG · cambios

## 1.5.0 · 3 de octubre de 2026

- **PDF vectorial.** El PDF de una figura SVG sale con trazos y texto, no como imagen: se amplía sin perder nitidez, pesa poco y el texto se puede buscar y copiar. En «Tamaño y exportación», la fila nueva **PDF** ofrece «Vectorial» (por omisión) o «Imagen», que es el PDF de antes, a la resolución elegida. Con «Vectorial», la resolución no aplica y el nombre del archivo ya no lleva los ppp.
- **Cómo se escribe.** El estudio toma lo que el navegador ya resolvió (los estilos calculados, la transformación de cada elemento y la posición de cada carácter) y lo escribe con los operadores de PDF, sin bibliotecas. Reproduce:
  - rectángulos (también redondeados), círculos, elipses, líneas, polígonos y trazados con curvas y arcos;
  - recortes (`clip-path`), marcadores (las flechas), degradados lineales y radiales, tramas (`<pattern>`), SVG anidados e imágenes dentro del SVG;
  - transparencias, también la de un grupo entero, y los modos de fusión;
  - líneas punteadas, extremos y uniones, relleno par-impar y el halo del texto (`paint-order: stroke`).
- **Lo que no pasa:** los filtros (sombras, desenfoques), las máscaras y el HTML dentro del SVG (`foreignObject`). Si una figura los usa, el aviso de la exportación lo dice. Ninguna figura de la suite los usa hoy.
- **El texto** va con las letras estándar de PDF, como en el dispositivo `pdf()` de R: sans (para system-ui, Segoe UI, Arial…), serif y mono, con negrita y cursiva. No se incrustan, porque todo lector de PDF las trae. Además:
  - cada tramo de texto ocupa exactamente el ancho y la posición que tiene en la pantalla;
  - el griego y los signos (λ, β, σ, χ, ⊗, ∝, →) van con la letra Symbol; el signo menos, ≤, ≥, √, Δ y las letras de Europa central, con los glifos que las letras estándar traen fuera de su codificación;
  - los subíndices y superíndices de Unicode (₁, ₑ, ⁻, ᵗ) se escriben con la letra normal, más chica, arriba o abajo; las letras con un acento que no traen (ŷ, ĝ, x̄), con el acento encima;
  - un carácter que ninguna de esas letras trae (♀, ♂, ▼) va como una imagen pequeña de ese carácter, del color del texto.
- Con la app en tema oscuro y «Colores: Del tema claro», el PDF vectorial también sale en claros.
- Las figuras que dibuja la app (Python en StatsPro y BioModellingPro, el PDF propio de SigmaPro) siguen con su propio PDF, y los mapas y las figuras de lienzo, como imagen. Para ellas no aparece la fila «PDF».
- **API:** `LABGFigureStudio.toPDF(svg, { wmm, hmm, bg, light, title })` devuelve el PDF vectorial de cualquier figura SVG de la app (ver la guía, sección 11).
- **Comprobado** con las 263 figuras SVG que el estudio encuentra en 13 apps:
  - ningún error al convertir, y ningún aviso de Poppler al leerlas;
  - pesan 5 KB en la mediana (la más grande, de 259 KB, es una nube de casi 3 700 puntos) y se escriben en 6 ms en la mediana;
  - dibujadas con Poppler y comparadas con la imagen que exporta el estudio, difieren mucho en el 0.3 % de los píxeles en la mediana (3.6 % como máximo). Lo que cambia es el dibujo de las letras y el ajuste de las líneas finas a los píxeles, no la geometría;
  - el visor de PDF del navegador las dibuja igual, y el texto se extrae con sus acentos y su griego;
  - en tema oscuro, PCAPro, PhenologyPro y GermplasmPro dan el mismo PDF que en claro.
- Copia fija en `v1.5.0/`.

## 1.4.0 · 2 de octubre de 2026

- **Tema oscuro al exportar.** Con la app en tema oscuro, la sección «Tamaño y exportación» trae una opción nueva, **Colores**: «Del tema claro» (por omisión) o «Como se ven». Con «Del tema claro»:
  - la figura se ve en el estudio con los colores del tema claro, y así sale en SVG, PNG, TIFF, PDF y al copiarla. La app sigue en oscuro;
  - para exportar, el estudio lee los estilos con `data-theme="light"` puesto un instante, sin pintar nada ni lanzar `themechange`. Para la vista previa, pone sobre la figura elevada los valores claros de las variables del tema, solo mientras está en el estudio;
  - vale para lo que dibuja el estudio. Lo que dibuja la app (Python, los mapas, el PDF de SigmaPro) ya sale en claro por su cuenta.
- Funciona con las figuras que toman sus colores del tema (variables CSS). En una medición de 255 figuras SVG de 12 apps, 103 cambian así con el tema y 102 ya eran claras siempre. Las únicas que se quedaban en oscuro eran 8 de GermplasmPro, que ahora también siguen al tema (ver la guía, sección 10).
- **Colores mezclados.** Un color hecho con `color-mix()` se escribe como `rgb()` al exportar, porque los programas de dibujo no leen `color(srgb …)`. El estudio también lo reconoce como color de serie.
- Comprobado:
  - en tema claro, el SVG exportado es idéntico al de la 1.3.1 (tres figuras de PCAPro) y la opción «Colores» no aparece;
  - en tema oscuro, en ClusteringPro, PopGeneticsPro, PhylogenyPro, BreedingPro, PhenologyPro, GermplasmPro y SigmaPro, el texto pasa de claro a oscuro en la vista previa y en los archivos. «Como se ven» regresa al oscuro y, al cerrar, no queda nada en la figura;
  - StatsPro sigue exportando sus figuras de Python en claro.
- Copia fija en `v1.4.0/`.

## 1.3.1 · 1 de octubre de 2026

- **«Debajo, en fila» con leyendas marcadas.** En una leyenda marcada por el kit (`data-role="legend"`), las entradas bajaban a la fila pero el título y las notas se quedaban en su lugar. Ahora el título va al principio de la fila y una nota de debajo de las entradas (por ejemplo, «elipse de concentración 95 %»), al final. Si el grupo trae algo más que entradas, títulos y marco, la leyenda baja entera.
- **Barras de color.** Un grupo `data-legend` (sin `data-role`) se acomoda en el estudio aunque el editor ✎ común esté acoplado: ese editor solo acomoda leyendas con entradas. Ver la guía, sección 9.
- Probado con los dibujos propios de PCAPro, que ya marcan sus leyendas (`data-role="legend"`, `data-li`, `data-plot`) y sus barras de color (`data-legend="colorbar"`). Sin el editor ✎ (como en línea), el estudio las mueve a los once lugares y las regresa. Con el editor acoplado, las leyendas con entradas pasan a su pestaña «Leyenda» y las barras de color se quedan en el estudio.

## 1.3.0 · 1 de octubre de 2026

- **La ubicación de la leyenda en las gráficas de todas las apps.** La sección «Leyenda» del inspector ofrece:
  - ocho lugares dentro de la gráfica;
  - fuera, a la derecha, o debajo, en fila; el dibujo crece lo justo;
  - ocultarla;
  - arrastrarla sobre la figura.

  La leyenda se encuentra marcada por el kit (`data-role="legend"`), con nombre de leyenda o suelta (textos con su muestra). El área de la gráfica sale de `data-plot` o de ejes y rejilla. Ver la guía, sección 9.
- **Figuras de Python:** `legend: true` en la descripción nativa del puente; `_xp_legend(fig)` mueve la leyenda de matplotlib (StatsPro y BioModellingPro). Debajo, en las columnas que quepan en el ancho pedido.
- **Sin controles dobles:**
  - si el editor ✎ de la app maneja esa leyenda, la sección remite a su pestaña «Leyenda»;
  - si la figura trae su propio control del lugar de la leyenda, remite a ese control.
- **Nombre de archivo:** la descripción nativa admite `file`. Los mapas de BioModellingPro ya no se llaman todos como la especie: cada uno usa el nombre de su propia exportación («map_clusters_…», «map_bio_1_…»).
- Los cambios del estudio que tocan atributos (`transform`, `viewBox`, `width`, `height`) se guardan y se deshacen igual que los de estilo.
- Las ayudas «?» de la app (`.help-badge` y parecidas) ya no aparecen en el inspector como si fueran ajustes de la figura.
- Los siete mapas de BioModellingPro, comprobados uno por uno: vista previa, PNG, SVG, PDF y GeoTIFF a 85.0 mm, y el mapa vivo intacto.

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
