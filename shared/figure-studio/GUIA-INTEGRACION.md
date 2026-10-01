# Estudio de figuras LABG · guía de integración (v1.0.0)

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

## 7. Lista de comprobación al integrar una app nueva

1. Copiar `js/labg-figure-studio.js`, `css/labg-figure-studio.css` y `LICENSES-TERCEROS.md`.
2. Agregar la línea después de `labg-core.js`.
3. Abrir la app y revisar que cada figura tenga su botón. Si falta alguno, usar `hosts` o `attach()`.
4. Abrir el estudio y comprobar:
   - que la figura se vea entera;
   - que los controles del inspector la cambien al instante;
   - que deshacer funcione;
   - que exporte a PNG, SVG, PDF y TIFF.
5. Probar a 1440×900, 1280×720 y 390×844.
