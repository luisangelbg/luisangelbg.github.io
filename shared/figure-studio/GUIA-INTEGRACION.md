# Estudio de figuras LABG · guía de integración (v1.3.1)

El estudio abre cualquier figura de una app en una **pantalla dividida**:

- **Escenario** (65–70 % del ancho): la figura siempre a la vista, a escala y sobre un «papel» del tamaño de salida, con la silueta de los anchos de 85 y 180 mm.
- **Inspector** (360–420 px, redimensionable, con desplazamiento propio): secciones plegables con íconos y un buscador de controles.
- **Barra de herramientas** (fina, arriba): deshacer y rehacer, antes/ahora, zoom, preajustes, exportar y «Cerrar estudio».

## 1. Integrar: una línea

```html
<script src="js/labg-core.js"></script>
<script src="js/labg-figure-studio.js" defer></script>
```

La hoja de estilo (`css/labg-figure-studio.css`) se carga sola. Con esa línea:

- A cada figura de la app se le agrega un botón con el ícono de lápiz y regla, que la abre en el estudio. Se muestra al pasar el ratón; en pantallas táctiles, siempre.
- Fuera del estudio, al abrir el menú «Editar figura» de una app (`details.fig-editor`), la figura queda fija arriba mientras se recorren sus opciones, siempre que quepa en algo más de la mitad de la pantalla.
- Lo que el estudio cambia en una figura (paleta, letra, tamaño del texto, líneas y textos editados) se guarda en ese navegador y vuelve a ponerse cada vez que la app la redibuja.

## 2. Cómo funciona sin romper la app

| Pieza | Cómo lo hace | Por qué |
|---|---|---|
| La figura en el escenario | Se **eleva a la capa superior** del navegador (Popover API). El nodo **no se mueve** del documento. | Los estilos de la app, sus oyentes y el código que la redibuja siguen igual. Si la app la reemplaza (`innerHTML`, `Fig.mount`), el estudio encuentra la nueva. |
| Los controles de la app | Se **reflejan** en el inspector. Cada cambio se escribe en el control original y se avisa con sus eventos (`input`, `change`, `click`). | Muchas apps escuchan en la tarjeta o el bloque. Mover un control rompería esos oyentes, y algunas reescriben sus controles al recalcular. |
| Editor fino ✎ y panel de estilo global | Si la app trae `window.FigEdit` o `window.FigStyle`, sus paneles se **acoplan** dentro del inspector mientras el estudio está abierto. | Se aprovecha lo que ya existe, sin duplicarlo. |
| Navegadores sin Popover API | La figura se presta al escenario y vuelve a su lugar al cerrar. | Mejora progresiva. |

**Qué entra al inspector, en este orden:**

1. **Ajustes de la figura** (los de la app):
   - los datos y opciones de la tarjeta donde vive la figura;
   - su menú de edición (`details.fig-editor`, con sus pestañas como grupos);
   - el estilo del bloque, si la app tiene uno;
   - las opciones de descarga de la app (`.fig-tools`).
2. **Paneles acoplados** de la app (✎ y estilo global), si existen.
3. **Paleta y color** (del estudio): 8 paletas científicas y simulación de protanopía, deuteranopía, tritanopía y acromatopsia. La simulación solo cambia la vista; no se exporta.
4. **Texto y líneas** (del estudio): familia tipográfica, tamaño del texto y grosor de las líneas. Muestra el tamaño del texto más chico **en puntos al tamaño de salida** y avisa si queda por debajo de 6 pt.
5. **Tamaño y exportación:**
   - Formatos: PNG, SVG, PDF y TIFF.
   - Ancho en mm o pulgadas (85, 114 o 180 mm, o el que quieras) y alto automático o propio.
   - Resolución: 300, 600 o 1200 ppp.
   - Fondo: blanco, como se ve o transparente.
   - Vista a tamaño real y copia al portapapeles.
6. **Preajustes:** 11 de un clic, más los propios, que se guardan en este navegador y se exportan o importan en JSON.
7. **Historial:** cada cambio con su hora. Un clic regresa a ese punto.

## 3. API

```js
// registrar una figura que la detección automática no encuentra, o darle opciones
const h = LABGFigureStudio.attach(elemento, {
  library: 'svg',            // 'svg' | 'canvas' | 'img' | 'plotly' | 'chartjs' (se detecta sola)
  title: 'Mapa de calor',    // o ['Mapa de calor', 'Heat map']
  key: 'b5-heatmap',         // clave estable para recordar sus ajustes
  controls: '#miMenu',       // selector, nodo, lista o función(fig) → controles propios de la figura
  onChange: estado => {},    // { key, figure: {pal, font, txt, line, texts}, export: {w, unit, h, dpi, fmt, bg} }
  export: {                  // opcional: la app dibuja la figura en alta resolución
    render: (anchoPx, altoPx) => canvasOImagen,
  },
});
h.open(); h.close(); h.detach();

LABGFigureStudio.open(elemento);    // abre el estudio con esa figura (svg, canvas, img o su contenedor)
LABGFigureStudio.close();
LABGFigureStudio.isOpen();
LABGFigureStudio.figures();         // [{ el, key, title, library }] de toda la app
LABGFigureStudio.refresh();         // vuelve a buscar figuras (lo hace solo al cambiar el DOM)
LABGFigureStudio.on('export', d => console.log(d.name, d.size));   // 'open' | 'close' | 'change' | 'export' | 'ready'
```

También se emiten eventos del DOM en `document`: `labg-figure-studio:open`, `:close`, `:change`, `:export` y `:ready`.

### Adaptadores por biblioteca

`LABGFigureStudio.adapters` trae `svg`, `canvas`, `img`, `plotly` y `chartjs`. Cada uno tiene:

- `test(el)`;
- `aspect(el)`;
- `styles` (si admite paleta, texto y líneas);
- opcionalmente, `raster(el, w, h)`.

Para otra biblioteca:

```js
LABGFigureStudio.adapters.mibib = {
  test: el => el.classList.contains('mibib-canvas'),
  aspect: el => el.height / el.width,
  styles: false,
  raster: (el, w, h) => miBib.exportar(el, w, h),   // promesa → imagen o lienzo
};
```

## 4. Configuración opcional

Antes del script, `window.LABG_FIGSTUDIO = { … }`:

| Clave | Por omisión | Para qué |
|---|---|---|
| `hosts` | `.fig-block, .pg-pane, [data-fig], .fig-card, .fig-box, .fs-host, .chart-body, .map-wrap, …` | Qué agrupa una figura |
| `exclude` | `.theory-fig, .theory-card, details.acc, .hero, .help-guide, .plate` | Figuras que no llevan botón |
| `titles` | `.fig-head h4, .pg-title, .chart-title, …` | Dónde está el título |
| `btnHost` | `.fig-head, .chart-actions` | Dónde va el botón, si la figura tiene cabecera |
| `controlsFor` | `null` | `función(fig)` que devuelve un nodo con más controles de esa figura |
| `minSize` | `90` | SVG más chicos son íconos, no figuras |

Lo propio de cada app de la suite ya viene en el módulo (`PERFILES`):

- PollinationPro y BioModellingPro excluyen sus mapas, que ya tienen su propio estudio dividido.
- StatsPro excluye su estudio de gráficas y suma la barra de estilo del bloque.
- LeafPro suma el panel del constructor de hojas.

## 5. Teclado

| Tecla | Acción |
|---|---|
| Esc | Cerrar el estudio |
| Ctrl+Z / Ctrl+Y (Ctrl+Shift+Z) | Deshacer / rehacer |
| Ctrl+E (o Ctrl+S) | Exportar |
| Ctrl+Shift+C | Copiar la imagen |
| + / − / 0 / 1 | Acercar / alejar / ajustar / tamaño real (también Ctrl + rueda) |
| B | Comparar antes y ahora (cortina; se mueve con el ratón o con ← →) |
| / o Ctrl+F | Buscar un control |
| P | Cambiar la posición del inspector (derecha, izquierda, flotante) |
| ? | Atajos del estudio |
| Doble clic sobre un texto | Cambiarlo ahí mismo |

Mientras el estudio está abierto, Tab no sale de él y el foco vuelve al botón que lo abrió.

## 6. Exportación propia

Todo se escribe en el navegador, sin bibliotecas:

- **SVG:** los estilos calculados quedan escritos dentro, para que se vea igual fuera de la app. Lleva el tamaño en mm.
- **PNG:** con su resolución en el trozo `pHYs`.
- **TIFF:** RGB o RGBA de 8 bits, comprimido (*deflate* con predictor horizontal), con `XResolution`/`YResolution` en ppp.
- **PDF:** una página del tamaño exacto de la figura, con la imagen a la resolución elegida. El fondo transparente se guarda como máscara.

**Límites:**

- Las imágenes de más de 150 megapíxeles (o de más de 16 000 px por lado) se reducen solas, con aviso.
- Las figuras que ya son imágenes de píxeles (las hechas en Python, los mapas en lienzo) no ganan detalle con más ppp. Para eso está la descarga propia de la app, que se refleja en el inspector.

## 7. Exportación nativa: figuras que la app sabe volver a dibujar (1.1.0)

Hay figuras que llegan como imagen de pantalla pero que la app sabe volver a dibujar. Es el caso de las que hace Python con matplotlib en StatsPro y BioModellingPro. Para ellas, el estudio **no amplía la imagen: le pide a la app la figura a las medidas de salida**:

- el ancho y el alto en mm, con el texto a su tamaño en puntos;
- la resolución;
- el formato;
- el fondo.

En SVG y PDF el resultado es vectorial. El TIFF se arma con el PNG nativo.

Mientras el estudio está abierto, una **vista previa a tamaño de salida** se pinta sobre el papel y se rehace al cambiar el tamaño o el fondo. Se puede apagar.

La app lo declara de una de dos formas:

```js
// para una figura
LABGFigureStudio.attach(img, { native: descripcion });
// o para todas, con un gancho que se consulta al abrir el estudio
window.LABG_FIGSTUDIO = Object.assign(window.LABG_FIGSTUDIO || {}, {
  nativeExport: rec => (/* ¿sé volver a dibujar rec.el? */ ok ? descripcion : null),
});
```

`descripcion` es así:

```js
{
  label: 'Python',                      // se muestra: «dibujada de nuevo por Python»
  formats: ['png', 'svg', 'pdf'],       // lo que la app dibuja por sí misma
  preview: true,                        // false: sin vista previa (si dibujar es lento)
  render: (fmt, o) => Blob | 'data:…'   // o una promesa de ellos
}
// o = { fmt, wmm, hmm, win, hin, dpi, bg, transparent, light }
//   hmm/hin = null → el alto que dé la figura; light = true → fondo blanco o transparente
//   bg = 'white' | 'screen' (como se ve) | 'none' (transparente)
```

Desde la 1.2.0 la descripción admite además estos campos, todos opcionales:

```js
{
  extra: [['geotiff', ['GeoTIFF', 'GeoTIFF']]],    // formatos además de PNG, SVG, PDF y TIFF
  notes: { svg: ['nota', 'note'] },                 // una nota por formato (español, inglés)
  studioStyles: false,       // el estilo lo pone la app: sin paleta ni texto del estudio y sin editor ✎
  lift: false,               // la figura no se eleva: el papel muestra solo la vista previa (mapas vivos)
  aspect: () => alto / ancho,                       // la proporción exacta de lo que dibuja la app
  title: () => 'Nombre',                            // el nombre en la barra y en el archivo
  file: () => 'nombre_de_archivo',                  // el nombre de archivo de la app, si es otro (1.3.0)
  legend: true,                                     // la app mueve su leyenda adonde la pida el estudio (1.3.0)
  controls: () => ({ node, title: ['…', '…'] }),    // dónde están los controles de la app
}
```

Si la app no dibuja un formato pero sí el PNG, el estudio arma el TIFF y el PDF con ese PNG, a los ppp exactos. Para una figura sin elevar, también el SVG (con la imagen dentro).

### El puente de Python: `labg-pyfig.js`

Está en `shared/figure-studio/puentes/` y se carga con una línea después de `pyodide-core.js`. Hace tres cosas:

1. **Envuelve `runPy`.** Cada vez que una llamada de Python devuelve una imagen (`data:image/…`, sola o dentro de un objeto o un JSON), el puente recuerda *qué llamada la dibujó*: el código y sus variables.
2. **Registra el gancho `nativeExport`.** Para esas imágenes ofrece PNG, SVG y PDF.
3. **Vuelve a ejecutar esa misma llamada al exportar,** dentro de `_xp_run(o, código)`. Ese ayudante de Python pone las medidas de salida en `_XP` y la función que guarda la figura las usa:
   - en StatsPro es `fig_to_uri` y en BioModellingPro, `fig_to_b64`;
   - `_xp_fit` lleva la figura al ancho pedido, medido con el recorte ajustado con que se guarda (`bbox_inches='tight'`), en a lo más cuatro pasos;
   - `savefig` recibe los ppp y `transparent`.

   Nada se calcula de otra forma: es el mismo dibujo con otro papel.

Del lado de Python, cada app necesita en su `PY_SETUP` estas piezas:

- `_XP`, `_xp_relayout`, `_xp_fit`, `_xp_begin`, `_xp_end` y `_xp_run`;
- que la función que guarda las figuras respete `_XP`.

BioModellingPro además pasa la figura a su aspecto claro (`_UI_LIGHT`) cuando el fondo es blanco o transparente y la página está en tema oscuro.

**Comprobado (1 de octubre de 2026):**

| App | Figura | PNG 85 mm, 600 ppp | SVG / PDF | TIFF 180 mm, 300 ppp | Vista previa |
|---|---|---|---|---|---|
| StatsPro | histograma del estudio de gráficas | 85.0 mm | vectoriales, 85.0 mm, texto con la letra incrustada | 180.0 mm | 0.5–1.8 s |
| BioModellingPro | sedimentación y biplot del ACP | 84.9 mm | vectoriales, 84.9 mm | 179.8 mm | 0.4 s |

En tema oscuro, BioModellingPro exportó:

- con fondo blanco, una figura clara;
- con «como se ve», la oscura;
- con fondo transparente, una sin fondo.

## 8. Mapas (1.2.0)

Los mapas que una app arma con su propio estudio de mapas también se abren en el estudio de figuras. Hoy son dos:

- **PollinationPro:** el mapa del bloque 4, un SVG que dibuja `js/mapstudio.js` con sus ocho pestañas.
- **BioModellingPro:** los siete mapas interactivos que llevan «Estudio de mapa»: registros (paso 4), variables (paso 5), agrupamientos (paso 8), datos y resultado del modelo (paso 9), e índices agroclimáticos y cultivo (paso 10).

### Cómo se ven en el estudio

- **El mapa no se eleva.** Un mapa interactivo sigue vivo en la página. El papel muestra la vista previa que dibuja el estudio de mapas de la app al tamaño de salida, y se rehace con cada cambio.
- **El botón de entrada:**
  - en un mapa interactivo es un control más, debajo del zoom (no tapa la leyenda, el título ni la flecha);
  - en un mapa SVG va en su esquina, como en cualquier figura.
- **El inspector refleja el estudio de mapas de la app:**
  - un grupo por pestaña (Mapa base, Textos y fuentes, Elementos…), con un subtítulo por cada sección de la app (Fondo, Límites, Leyenda…);
  - si la app rehace un solo panel al cambiar de pestaña, las pestañas aparecen arriba como fichas;
  - los estilos listos (Publicación, Blanco y negro…) se leen en dos renglones: nombre y descripción;
  - la búsqueda encuentra también por subtítulo.
- **Sin estilos del estudio.** Paleta, texto y editor ✎ no aparecen: el estilo del mapa lo pone su propio estudio, que es el que exporta.

### Exportación

La hace el estudio de mapas de cada app, con todo lo que tenga elegido (encuadre, recorte, mapa base, leyenda):

| Formato | PollinationPro | BioModellingPro |
|---|---|---|
| PNG | su dibujo, rasterizado a los ppp pedidos | su exportación, con las teselas del mapa base |
| SVG | vectorial completo | datos y textos como vectores, sin teselas (lo avisa una nota) |
| GeoTIFF | WGS 84 (EPSG 4326) | Web Mercator (EPSG 3857), sin título ni leyenda salvo que se pidan en su «Exportar» |
| PDF y TIFF | los arma el estudio con el PNG nativo, a los ppp exactos | igual |

El fondo del estudio se traduce así:

- **Blanco:** blanco en lugar del fondo del tema oscuro o del transparente; un color propio del mapa se respeta.
- **Como se ve:** el fondo que tenga el mapa.
- **Transparente:** sin fondo.

En BioModellingPro, la exportación cambia por un momento el tamaño del mapa vivo y luego lo devuelve exactamente a como estaba. Por eso las exportaciones van de una en una.

### Lo que declara cada app

Cada `js/mapstudio.js` agrega su gancho `nativeExport` (encadenado al que ya hubiera) con `lift: false`, `studioStyles: false`, `extra` (GeoTIFF), `aspect`, `title` y `controls`.

**Comprobado (1 de octubre de 2026):**

| App | Vista previa | PNG 85 mm, 600 ppp | SVG | PDF | GeoTIFF |
|---|---|---|---|---|---|
| PollinationPro | 0.3 s | 2008 × 1297 px (85.0 mm) | 85 mm, vectorial | 85.0 × 54.9 mm | 2008 × 1297, EPSG 4326, 600 ppp |
| BioModellingPro (registros) | 0.3–0.7 s | 2008 × 1055 px (85.0 mm) | 85 mm | 85.0 × 44.7 mm | 2008 × 1055, EPSG 3857, 600 ppp |
| BioModellingPro (variables, agrupamientos, datos y resultado del modelo, índices y cultivo) | 1.7–8.4 s | 2008 × 1360 o 2008 × 921 px (85.0 mm) | 85 mm | 85.0 × 57.6 o 85.0 × 39.0 mm | 1004 × 680 o 1004 × 461, EPSG 3857, 300 ppp |

Además:

- el mapa vivo de BioModellingPro quedó con el mismo centro, zoom y tamaño;
- en tema oscuro, PollinationPro dio fondo blanco con «Blanco», el del tema con «Como se ve» y ninguno con «Transparente»;
- deshacer y rehacer un control del mapa rehacen la vista previa.

## 9. La ubicación de la leyenda (1.3.0)

Cualquier gráfica que tenga una leyenda aparte trae en el inspector la sección **Leyenda**:

- **Dentro de la gráfica:** una cuadrícula de 3 × 3 con ocho lugares. El centro la deja donde la dibujó la app.
- **Fuera de la gráfica:**
  - *a la derecha*, centrada en la altura de la gráfica;
  - *debajo, en fila*, con el título al principio, y en varias filas si no cabe.

  El dibujo crece lo justo para que quepa: `viewBox`, `width` y `height` numéricos, y el rectángulo de fondo si lo hay.
- **Mostrar la leyenda:** una casilla para ocultarla.
- **A mano:** la leyenda se arrastra sobre la figura. Cada cambio va al historial y se deshace.

El lugar se guarda por figura, como la paleta y la letra. Se vuelve a poner cada vez que la app redibuja la figura, se ve también en la página y sale así en las exportaciones del estudio y en las de la app.

### Cómo encuentra la leyenda

1. **Marcada por el kit de dibujo** con `data-role="legend"`, la marca del editor ✎ común. Si cada entrada lleva `data-li`, «debajo, en fila» reacomoda las entradas una por una:
   - el título va al principio de la fila, y una nota que esté debajo de las entradas (por ejemplo, qué es la elipse), al final;
   - el marco `data-role="legend-box"` se esconde en la fila;
   - si el grupo trae algo más que entradas, títulos y marco (una barra de color, por ejemplo), la leyenda baja entera.
2. **Con nombre de leyenda:** un grupo con `legend` en su clase o en su `id`, o con el atributo `data-legend`.
3. **Suelta:** dos o más textos, cada uno con su muestra justo a la izquierda (rectángulo, línea, punto o marca), en columna con el mismo paso o en fila. También toma su título, que va justo encima, y su marco.

   Una celda de un mapa de calor no cuenta: tiene otra igual pegada a la izquierda.

El área de la gráfica se toma de `data-plot="izquierda arriba ancho alto"` en el SVG, la marca del editor común. Si no está, se toma de lo que cubren ejes y rejilla.

**Para quien escriba un kit de dibujo:** marcar la leyenda con `data-role="legend"`, cada entrada con `data-li` (en su muestra y en su texto) y el SVG con `data-plot` da una ubicación exacta. Además:

- **Una barra de color** (una escala continua, sin entradas) va en un grupo `data-legend="colorbar"`, no `data-role="legend"`. El editor ✎ común solo acomoda leyendas con entradas: con `data-legend` la acomoda el estudio aunque el editor esté acoplado.
- **Una figura con dos leyendas** (por ejemplo, la barra de color y una clave de líneas) marca con `data-role="legend"` solo la principal: el estudio y el editor toman la primera que encuentran.

Las apps de análisis de la suite marcan así sus leyendas, en sus kits y en sus dibujos propios, desde el 1 de octubre de 2026.

### Con quién convive

- **El editor ✎ de la app**, acoplado y con la leyenda marcada: él tiene ocho lugares, fila o columna, tamaño y marco. La sección remite a su pestaña «Leyenda» y abre esa pestaña con un botón.
- **El control propio de la app:** si la figura ya trae uno, como «Posición de la leyenda» en el estudio de gráficas de StatsPro, la sección remite a ese control y lo señala.
- **Figuras de Python:** la descripción nativa dice `legend: true` y el puente pasa el lugar a Python en `o.legend`. Allí, `_xp_legend(fig)` cambia el lugar de cada leyenda de matplotlib antes de ajustar el tamaño y conserva sus muestras, textos, título y letra:
  - ocho lugares dentro;
  - a la derecha;
  - debajo, en las columnas que quepan en el ancho pedido, a una distancia en puntos;
  - oculta.

  Se ve en la vista previa y sale así al exportar.
- **Mapas:** su leyenda se acomoda en su propio estudio de mapas («Elementos»), que el inspector ya refleja.

**Comprobado (1 de octubre de 2026):**

| App | Figura | Leyenda | Resultado |
|---|---|---|---|
| PCAPro | gráfico de sedimentación | suelta (líneas y textos de `plots2.js`) | los nueve lugares, fuera a la derecha (el `viewBox` pasa de 910 a 1037), debajo en fila, oculta y de vuelta; arrastre, deshacer y SVG exportado con el nuevo lugar |
| BreedingPro | plan de cruzamientos | marcada por el kit | con el editor ✎ acoplado remite a su pestaña «Leyenda»; sin él, todos los lugares (a la derecha, de 530 a 684) |
| StatsPro | figura de Python con tres series | matplotlib | la vista previa la redibuja Python en cada lugar; debajo, en dos columnas que caben en 85 mm |
| StatsPro | estudio de gráficas | control propio («Posición de la leyenda») | remite a ese control |
| AgriDesign, EconomicsPro, SciMetricsPro, PhenologyPro, PollinationPro | gráficas del kit, como están publicadas (sin marcas ni editor ✎) | suelta | se encuentra, se mueve y vuelve |
| ReviewPro | semáforo de sesgo | suelta, en fila | se encuentra, se mueve y vuelve |

En 14 apps (BioModellingPro aparte) se abrió el estudio en las figuras visibles de los primeros bloques, sin un solo error. Las gráficas sin leyenda aparte (cajas, Q–Q, dispersión sin grupos, árboles) no muestran la sección.

Dos falsas leyendas se encontraron y se corrigieron:

- en el diagrama PRISMA de ReviewPro, una flecha entre dos renglones parecía la muestra de dos entradas; ahora un conector con punta de flecha no cuenta y cada entrada necesita su muestra propia;
- en PhenologyPro, el eje derecho (rayita y número) parecía una leyenda en columna; ahora una rayita de eje no cuenta como muestra y un grupo de puros números con muestras de línea se toma por eje.

## 10. Lista de comprobación al integrar una app nueva

1. Copiar `js/labg-figure-studio.js`, `css/labg-figure-studio.css` y `LICENSES-TERCEROS.md`.
2. Agregar la línea después de `labg-core.js`.
3. Abrir la app y revisar que cada figura tenga su botón. Si falta alguno, usar `hosts` o `attach()`.
4. Abrir el estudio y comprobar:
   - que la figura se vea entera;
   - que los controles del inspector la cambien al instante;
   - que deshacer funcione;
   - que exporte a PNG, SVG, PDF y TIFF.
5. Probar a 1440×900, 1280×720 y 390×844.
6. Si la app redibuja sus figuras (al cambiar un control, el idioma o el tema), cerrar el estudio y volver a abrirlo con el mismo botón.
7. Mapas: declarar la descripción nativa en su estudio de mapas (sección 8) y exportar los cinco formatos.
8. Leyenda: abrir una gráfica con leyenda, probar los lugares de la sección «Leyenda» y arrastrarla. Si el kit la marca (`data-role="legend"`, `data-li`, `data-plot`), el acomodo es exacto. Probar también «Debajo, en fila» con una leyenda que tenga título.
