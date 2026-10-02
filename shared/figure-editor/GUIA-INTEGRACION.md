# Editor ✎ LABG · guía de integración (v1.0.0)

El editor ✎ trabaja sobre **una** figura, como un programa de gráficas. Cada figura de la app lleva un botón ✎ que abre un panel flotante con seis pestañas:

| Pestaña | Qué cambia |
|---|---|
| **General** | título, subtítulo y nota al pie dentro de la figura; familia tipográfica, tamaños, escala de líneas y puntos, color del texto, fondo y marco |
| **Ejes y rejilla** | títulos de los ejes, números, color y grosor de los ejes, la rejilla y el recuadro del área de la gráfica |
| **Series** | cada color de la figura, con el nombre de su entrada de leyenda: color, grosor, trazo, opacidad, ocultar |
| **Leyenda** | mostrarla u ocultarla, ocho lugares, como se dibujó, en fila o en columna, tamaño y recuadro; también se arrastra |
| **Textos** | cada texto uno por uno: redacción, tamaño, negrita, cursiva, color, ocultar |
| **Anotaciones** | notas, flechas, líneas de referencia en un valor de cualquier eje, bandas y letra de panel; notas y flechas se arrastran |

El Estudio de figuras LABG cambia todas las figuras a la vez (paleta, letra, tamaño de salida). El editor ✎ afina una sola. Cuando el estudio está abierto, el editor se **acopla** dentro de su inspector.

No necesita nada del módulo que dibujó la figura: lee el SVG como está. Las marcas del kit de dibujo (sección 3) le ayudan a encontrar la leyenda, los ejes y el área de la gráfica.

## 1. Integrar: una línea

Después del kit de dibujo de la app:

```html
<script src="js/labg-figedit.js" data-key="miapp:figedit"></script>
```

El módulo trae su propia hoja de estilo (la inserta como `#figEditCss`): no hay CSS que copiar. Usa las variables de color de la app (`--primary`, `--border`, `--card-bg`…) si existen.

### Opciones

Como atributos `data-*` de la etiqueta `<script>`, o en `window.LABG_FIGEDIT = { … }` antes de cargarla:

| Opción | Atributo | Por omisión | Para qué |
|---|---|---|---|
| `key` | `data-key` | `<app>:figedit` (la primera palabra del título de la página) | dónde se guardan las ediciones en el navegador |
| `panes` | `data-panes` | `.pg-pane, [data-fig], .fig-block` | lo que contiene una figura |
| `exportBtn` | `data-export-btn` | `.fig-dl` | el botón de exportar de cada figura; el panel lo repite («⤓ Exportar») |
| `title` | `data-title` | `.pg-title, .fig-head h4` | de dónde sale el nombre de la figura en el panel |
| `btnHost` | `data-btn-host` | `.fig-head` | si el panel de la figura lo tiene, el botón ✎ va dentro |
| `skip` | `data-skip` | botones, el propio editor, `.fig-tools` | lo que no es figura |
| `minSize` | — | 90 | un SVG más chico es un ícono, no una figura |
| `literal` | — | se decide por figura | `true`: colores fijos en vez de variables CSS |

### Cómo está en cada app

| App | Configuración |
|---|---|
| AgriDesign, BreedingPro, ClusteringPro, PCAPro, PopGeneticsPro | `data-key="<app>:figedit" data-export-btn=".fig-tools .btn"` |
| SciMetricsPro | lo mismo, desde `js/core/labg-figedit.js` |
| EconomicsPro, PhenologyPro, ReviewPro | `data-key="<app>:figedit"` |
| PollinationPro | `data-key="pollinationpro:figedit2"` (su editor anterior guardaba con otra clave) |

## 2. Dónde guarda y cómo vuelve

- Las ediciones se guardan **por figura** en el navegador, bajo la clave de la app. La figura se reconoce por el `id` de su SVG o por su panel.
- Se vuelven a poner **cada vez que la app redibuja** la figura: al cambiar los datos, el idioma o el tema.
  - Los textos se reconocen por su redacción original.
  - Los colores, por su valor original.
- Se escriben **en el propio SVG**, con atributos y estilos en línea, así que lo que se ve es lo que la app exporta.
- Un texto reescrito deja de traducirse: si se cambia de idioma, el texto editado se queda en el idioma en que se escribió.

## 3. Lo que le sirve del kit de dibujo

Nada es obligatorio: sin marcas, el editor igual cambia textos, colores y anotaciones. Con ellas, encuentra cada parte con exactitud:

| Marca | Dónde | Para qué |
|---|---|---|
| `data-role="legend"` | el grupo de la leyenda | la pestaña Leyenda |
| `data-li="i"` | la muestra **y** el texto de cada entrada | emparejar color y nombre, ocultar una entrada |
| `data-role="legend-box"` | el recuadro de la leyenda | esconderlo al reacomodarla |
| `data-role="xlab"`, `"ylab"`, `"lab"` | los títulos de los ejes | la pestaña Ejes y rejilla |
| `data-role` terminado en `tick` | los números de los ejes | tamaño y color de los números |
| `data-role="axis"`, `"grid"` | las líneas de ejes y rejilla | su color, grosor y trazo |
| `data-plot="x y ancho alto"` | el SVG | el área de la gráfica (leyenda dentro, recuadro, anotaciones) |
| `data-xr`, `data-yr`, `data-y2r` | el SVG | el rango de cada eje, para las líneas de referencia y las bandas |

Son las mismas marcas que usa el Estudio de figuras para acomodar la leyenda (guía del estudio, sección 9). Las barras de color van en un grupo `data-legend`: el editor no las toma como leyenda con entradas y el estudio las acomoda.

## 4. Exportar

- **Si la app exporta un clon del SVG en pantalla**, conviene quitarle las marcas del editor:

  ```js
  if (window.FigEdit && FigEdit.strip) FigEdit.strip(clon);
  ```

  `strip` quita los atributos `data-fe-*` y `data-li`.
- **Si el editor puso un título o una nota dentro de la figura**, el `viewBox` crece y su origen queda por encima de 0. La exportación debe respetar el origen del `viewBox` (así lo hacen EconomicsPro y PollinationPro en su `figure.js`).
- **Si la app vuelve a dibujar la figura fuera de pantalla** para exportarla, `FigEdit.applyTo(svg, clave)` le pone las ediciones.
- **Si la figura se guarda como texto SVG**, `FigEdit.bakeString(texto, clave)` devuelve el texto ya editado y sin marcas.

## 5. Interfaz pública (`window.FigEdit`)

| Función | Qué hace |
|---|---|
| `figures(raíz?)` | las figuras que encuentra: `[{ pane, svg, key }]` |
| `findSvg(clave)`, `keyOf(svg)` | de la clave a la figura y de vuelta |
| `get(clave)`, `has(clave)`, `all()` | las ediciones de una figura (para cambiarlas), si tiene, y todas |
| `apply(svg, clave?)` | pone las ediciones en el SVG |
| `reset(clave)` | deshace todo en esa figura |
| `addNote(clave, tipo, opciones)` | agrega una anotación: `text`, `arrow`, `letter`, `hline`, `vline`, `band` |
| `save()`, `load(obj)` | guarda en el navegador; carga un conjunto de ediciones (de un proyecto) |
| `summary()` | resumen por figura (título, textos, colores, series, anotaciones), para el registro de un informe |
| `show(botón, svg)`, `hide()` | abre y cierra el panel |
| `decorate(raíz?)` | pone los botones ✎ (el editor ya los pone solo al observar la página) |
| `strip(svg)`, `applyTo(svg, clave)`, `bakeString(texto, clave)` | para exportar (sección 4) |
| `textsOf(svg)`, `seriesOf(svg)`, `legendOf(svg)`, `axisTitles(svg)` | lo que el editor lee de una figura |

`FigEdit.__labg` vale `true`: así lo reconoce el Estudio de figuras para acoplarlo.

## 6. Con el Estudio de figuras LABG

- Con el estudio abierto, el panel del editor se acopla dentro del inspector y trabaja sobre la figura del estudio.
- **Leyenda:** si la figura tiene una leyenda marcada con entradas, la sección «Leyenda» del estudio remite a la pestaña «Leyenda» del editor. Las barras de color y las leyendas de tamaño (grupos `data-legend`) se quedan en el estudio.

## 7. Autoprueba

`tests/figedit-selftest.js` es la misma en todas las apps. Con la app abierta y una figura a la vista, en la consola:

```js
await new Promise(r => { const s = document.createElement('script'); s.src = 'tests/figedit-selftest.js'; s.onload = r; document.head.appendChild(s); });
await FigEditSelfTest(FigEdit.figures()[0].key);   // → { pass, fail, lines }
```

Revisa unas veinte cosas en esa figura:
- que tenga su botón ✎ y textos o colores que editar;
- que cada cambio se aplique y se deshaga;
- que deje la figura como la encontró.

Si se le pasa como segundo argumento una función que hace redibujar la figura, también comprueba que las ediciones sobrevivan: `FigEditSelfTest(clave, async () => { … })`.

**Comprobado (1 de octubre de 2026):**
- 783 comprobaciones sin fallas en 8 apps antes de publicarlo, y 160 en PhenologyPro;
- otra vez desde GitHub Pages en EconomicsPro, AgriDesign y PhenologyPro;
- las 424 pruebas de PhenologyPro (`tests11.js`), que prueban el editor a fondo, pasan con el común.

## 8. Lista de verificación al integrar

1. Copiar `labg-figedit.js` (y `tests/figedit-selftest.js`) y agregar la línea con la clave de la app.
2. Si la app ya tenía un editor propio, quitar su script y su CSS. Usar la misma clave si el formato es el mismo, para conservar lo que cada quien ya editó.
3. Abrir una figura: el botón ✎ aparece, el panel abre y cada pestaña cambia la figura.
4. Cambiar de idioma o de datos: las ediciones vuelven.
5. Exportar la figura editada (sección 4).
6. Abrir la figura en el Estudio de figuras: el editor se acopla.
7. Correr la autoprueba en una o dos figuras.
