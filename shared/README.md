# Módulos compartidos de la LABG Suite

Piezas de interfaz que usan todas las apps de la suite. Cada módulo es un solo archivo
JavaScript, más su hoja de estilo, sin dependencias ni compilación. Funciona con doble clic
(`file://`), en GitHub Pages y en cualquier servidor.

| Módulo | Versión | Qué hace | Guía |
|---|---|---|---|
| **Estudio de figuras LABG** | 1.5.0 | Abre cualquier figura en pantalla dividida para editarla y exportarla | [figure-studio/GUIA-INTEGRACION.md](figure-studio/GUIA-INTEGRACION.md) |
| **Navegador LABG** | 1.1.0 | Barra lateral de bloques, índice de secciones, modo enfocado, paleta Ctrl+K y enlaces directos | [navigator/GUIA-INTEGRACION.md](navigator/GUIA-INTEGRACION.md) |
| **Efectos LABG** | 1.0.0 | Las esperas sobre el panel de resultados, con la animación de cada app; la aparición escalonada de los resultados, microanimaciones y el botón «Animaciones» | [fx/GUIA-INTEGRACION.md](fx/GUIA-INTEGRACION.md) · [demostración](fx/demo.html) |
| **Editor ✎ LABG** | 1.0.0 | Un panel por figura (botón ✎): títulos, ejes, series, leyenda, textos y anotaciones, como un programa de gráficas | [figure-editor/GUIA-INTEGRACION.md](figure-editor/GUIA-INTEGRACION.md) |

## Dónde viven

```
shared/
  figure-studio/
    labg-figure-studio.js     ← la versión vigente
    labg-figure-studio.css
    v1.0.0/ … v1.5.0/         ← copia fija de cada versión publicada
    puentes/labg-pyfig.js     ← puente para las figuras que dibuja Python (StatsPro, BioModellingPro)
  navigator/
    labg-navigator.js
    labg-navigator.css
    v1.0.0/ v1.0.1/ v1.0.2/ v1.1.0/
  fx/
    labg-fx.js                ← la versión vigente
    labg-fx.css
    demo.html                 ← las animaciones de todas las apps y esperas de prueba
    v1.0.0/
  figure-editor/
    labg-figedit.js           ← la versión vigente (trae su propia hoja de estilo)
    v1.0.0/
    tests/figedit-selftest.js ← su autoprueba: FigEditSelfTest(clave)
  LICENSES-TERCEROS.md        ← íconos de Lucide (ISC) y su texto de licencia
```

## Cómo los carga una app

**Así lo hacen las apps de la suite: una copia dentro de la app.** Así siguen funcionando
sin conexión, porque las apps se abren con doble clic.

```html
<script src="js/labg-core.js"></script>
<script src="js/labg-figure-studio.js" defer></script>
<script src="js/labg-navigator.js" defer></script>
<script src="js/labg-fx.js" data-app="pcapro" defer></script>
```

Cada script carga solo su hoja de estilo (`css/labg-*.css`), así que basta una línea por módulo.
Para actualizar una app se copian los cuatro archivos desde esta carpeta.

**Desde el portal** (páginas en línea que no son de la suite; sin conexión no cargan):

```html
<script src="https://luisangelbg.github.io/shared/figure-studio/v1.5.0/labg-figure-studio.js" defer></script>
<script src="https://luisangelbg.github.io/shared/navigator/v1.1.0/labg-navigator.js" defer></script>
<script src="https://luisangelbg.github.io/shared/fx/v1.0.0/labg-fx.js" data-app="pcapro" defer></script>
```

Si un módulo no carga o algo falla al arrancar, la app sigue igual que antes, con su barra
de bloques y sus menús de siempre. Es mejora progresiva.

## Identidad

- **Colores:** oro y negro de la marca LABG. Los fondos, textos y bordes salen de los tokens de
  `labg-base.css`, así que siguen el tema claro u oscuro de cada app.
- **Letras:** «LABG Serif» en los títulos de bloque y «LABG Sans» en la interfaz, servidas desde el
  portal. Sin red se usan las del sistema.
- **Íconos:** de línea fina (Lucide, ISC; ver `LICENSES-TERCEROS.md`).

## Versiones

Se sigue el versionado semántico:

- **1.0.x:** arreglos sin cambios de uso.
- **1.x:** novedades que no rompen la integración.
- **2.0:** cambios de API.

Cada versión publicada queda fija en su carpeta. Los cambios se anotan en el `CHANGELOG.md`
de cada módulo.
