# Efectos LABG · guía de integración (v1.0.0)

Las esperas de la suite con la animación propia de cada app, la aparición escalonada de los resultados, unas microanimaciones discretas y un botón para apagarlo todo. Es un solo archivo JavaScript, más su hoja de estilo, sin dependencias ni compilación; funciona con doble clic (`file://`).

No lleva sonido: el autor de la suite decidió dejarlo fuera.

Demostración: [`demo.html`](demo.html), con las animaciones de todas las apps, las esperas de prueba y las microanimaciones.

## 1. Integrar: una línea

Después de `labg-core.js` (en las apps de la suite, después de la línea del navegador):

```html
<script src="js/labg-core.js"></script>
<script src="js/labg-figure-studio.js" defer></script>
<script src="js/labg-navigator.js" defer></script>
<script src="js/labg-fx.js" data-app="pcapro" defer></script>
```

El script carga solo su hoja de estilo (`css/labg-fx.css`). Atributos:

| Atributo | Para qué | Por omisión |
|---|---|---|
| `data-app` | La animación de la app (sección 4) | La primera palabra del título de la página |
| `data-panel` | Selector del panel de resultados, si no es el del bloque activo | El bloque activo |
| `data-micro` | Microanimaciones: `"botones paneles filas"`, una parte de esas palabras o `"no"` | Las tres |
| `data-espera` | `"ventana"` deja la ventana de antes de `LABG.work` | La capa |

Lo mismo se puede dar antes del script con `window.LABG_FX = { app, panel, micro, espera }`.

## 2. Las esperas

Las apps no cambian: `labg-fx.js` toma el lugar de la ventana de `LABG.work` (de `labg-core.js`) con la misma API, así que todas sus esperas pasan a la capa nueva.

```js
const w = LABG.work({ title: 'Remuestreando…', message: '1000 réplicas', cancel: () => detener() });
w.update(0.4, 'Réplica 400 de 1000');   // fracción 0–1; null si no se sabe cuánto falta
w.message('Ajustando el modelo…');
await w.done();                          // o w.fail('La matriz no es invertible')

await LABG.work.run({ title: 'Ajustando…' }, async w => { … });   // abre, deja pintar, corre y cierra
```

**Dónde aparece.** Sobre la parte visible del panel del bloque activo, debajo de la barra superior. El panel se busca como lo hace el navegador: `#panel-N` del bloque activo, luego `.step-panel.active`, luego `#view` (SciMetricsPro) y por último `main`. Si no hay panel a la vista, o lo que se ve mide menos de 280 × 230 px, la espera sale como una tarjeta al centro de la pantalla.

**Cómo se ve.**
- La animación de la app (120 px), el título, el texto del paso, la barra (indeterminada si no se sabe cuánto falta) y, abajo, el porcentaje y el tiempo («quedan ~12 s»).
- Pasados 14 s sin texto de paso, un aviso de paciencia.
- Si la app da `cancel`, un botón Cancelar; Escape hace lo mismo.

**Lo rápido no se ve.** La capa aparece después de 300 ms (`delay`). Si el cálculo termina antes de los 300 ms más 150, se cierra sin haberse visto y sin celebrar.

**Al terminar.**
1. La palomita aparece unos 0.75 s sobre el isotipo LABG, con «¡Listo! Terminado en 3,6 s».
2. La capa se desvanece en 300 ms.
3. Lo que el cálculo agregó a la página entra escalonado, con 60 ms entre una pieza y otra: tarjetas, tablas, figuras. Son las piezas de arriba, visibles y de más de 80 × 18 px, hasta 16. No entran las filas de tabla ni los elementos en línea.

**Con error:** tache, mensaje y botón «Cerrar». La capa se queda hasta que se cierra.

**Como la ventana:**
- Un escudo transparente cubre la página mientras dura la espera, para que no se cambie de bloque a media cuenta. El cursor muestra que se está trabajando.
- El foco se queda en la espera y vuelve a su lugar al cerrar.
- Lleva `role="dialog"` y `aria-modal="true"`; la barra lleva `role="progressbar"` con `aria-valuenow`.
- Anuncia el inicio y el final al lector de pantalla.

**No se congela.** Todo lo que se mueve usa `transform` y `opacity`, así que el navegador lo anima aparte. Comprobado con su registro: con la página ocupada 2 s seguidos, siguió dibujando unos 108 cuadros en cada una de las escenas. El porcentaje y el texto, en cambio, solo cambian si el cálculo cede el paso: `await LABG.nextPaint()` o `await LABGfx.pause()` entre trozos.

## 3. `LABGfx.loading`: la misma espera, con pasos

```js
LABGfx.loading.start({ titulo: 'Calculando el ACP…', mensaje: 'Preparando los datos…', pasos: 4 });
LABGfx.loading.step('Calculando componentes…');   // «Calculando componentes… paso 1 de 4», barra en 0 %
LABGfx.loading.step('Rotando la solución…');      // «… paso 2 de 4», barra en 25 %
await LABGfx.loading.done();                      // o LABGfx.loading.fail('texto')

await LABGfx.loading.run({ titulo: 'Remuestreo', pasos: 3 }, async step => {
  step('Réplicas 1 a 300…'); /* … */ await LABGfx.pause();
  step('Réplicas 301 a 600…'); /* … */
});
```

Opciones de `start`:
- `titulo` (o `title`) y `mensaje` (o `message`);
- `pasos` (o `steps`);
- `cancelar` (o `cancel`);
- `panel`: un elemento, un selector, una función o `false` para la tarjeta al centro;
- `delay`, en ms;
- `escena`: otra animación, la de otra app.

`LABGfx.work(opciones)` es la espera directa, con la misma API que `LABG.work`.

## 4. Las animaciones de cada app

Todas miden 120 × 120 px, dan una vuelta de 2,6 a 3,4 s y toman sus colores del tema de la app: `--primary`, `--accent`, `--success` e `--info`, con `--border-strong` para ejes y guías. Por eso cambian con el tema claro u oscuro.

| `data-app` | App | Animación |
|---|---|---|
| `pcapro` | PCAPro | Nube de puntos que gira en 3D y se proyecta sobre los dos ejes |
| `clusteringpro` | ClusteringPro | Puntos sueltos que se agrupan y toman el color de su grupo |
| `popgeneticspro` | PopGeneticsPro | Hélice de alelos; cada dos vueltas, un extremo se recombina |
| `phylogenypro` | PhylogenyPro | Cladograma que se ramifica desde la raíz |
| `phenologypro` | PhenologyPro | Brote que crece por etapas: tallo, hojas, botón y flor |
| `pollinationpro` | PollinationPro | Granos de polen que viajan de una flor a la otra |
| `agridesign` | AgriDesign | Parcelas sueltas que se ordenan en tres bloques, cada tratamiento en su color |
| `scimetricspro` | SciMetricsPro | Barras de producción y una red de citas que se teje |
| `biomodellingpro` | BioModelling Pro | Curva logística que se traza entre ausencias y presencias |
| `economicspro` | EconomicsPro | Oferta y demanda que giran hasta cruzarse en el equilibrio |
| `breedingpro` | BreedingPro | La cruza de dos progenitores (♀ × ♂) y su descendiente |
| `statspro` | StatsPro | Histograma que se acomoda en una campana |
| `germplasmpro` | GermplasmPro | Semillas que caen en los cajones del banco y los van llenando |
| `reviewpro` | ReviewPro | Documentos que pasan por el embudo PRISMA; los excluidos salen por un lado |

Otros nombres: `sigmapro` usa la de StatsPro y `cladisticspro`, la de PhylogenyPro. Una app sin escena propia recibe puntos que se ordenan sobre una recta.

`LABGfx.scene(nombre, contenedor)` dibuja una animación en cualquier lugar (así lo hace `demo.html`); `LABGfx.scenes` da la lista.

**Para hacer una nueva:** solo `transform` y `opacity`, nada de animar colores, tamaños ni trazos de SVG, porque eso no lo anima el navegador aparte. Para que algo cambie de color, se cruzan dos capas con `opacity`. Para que algo se dibuje, se usa `scaleX` con el origen en un extremo.

## 5. Animaciones sí o no

- **El botón «Animaciones»** (el ícono de destellos) va en la cabecera, junto al del tema (`#themeBtn`), dentro de `.top-tools`. Al pulsarlo, las apaga o las enciende y avisa con un mensaje breve. Si la app arma su cabecera con JavaScript (SciMetricsPro), el botón llega en cuanto aparece el del tema.
- **En el teléfono** (480 px de ancho o menos) el botón no cabe junto a los demás sin apretar el nombre de la app. Se esconde, y el mismo interruptor queda en la ayuda («?»), arriba, después del recuadro «Dónde estás». En la ayuda está también en pantallas anchas.
- **La preferencia** se guarda en `localStorage` con la clave `labg.motion` (`on` u `off`), común a todas las apps. Rige para todas las que comparten almacenamiento en el navegador: las del portal entre sí y, en Chrome y Edge, las abiertas con doble clic entre sí. Otra pestaña abierta se entera al momento.
- **Apagadas, o con «reducir movimiento» del sistema:**
  - la espera muestra solo un círculo que gira;
  - los resultados aparecen sin escalonar;
  - no hay microanimaciones;
  - se detienen también las barras indeterminadas y los puntos de `labg-base.css`.
- **Desde el código:** `LABGfx.motion()` dice si hay animaciones, y `LABGfx.motion(false)` las apaga en toda la suite. Al cambiar se lanza el evento `labg-motion-change` en `document`.
- **En la página:** `<html>` lleva la clase `lfx-motion` o `lfx-still`, y el atributo `data-labg-motion`.

## 6. Microanimaciones

De 150 a 200 ms, solo con las animaciones encendidas:

| Palabra en `data-micro` | Qué hace |
|---|---|
| `botones` | `.btn`: sube 1 px al pasar el cursor y se hunde al pulsar. `.icon-btn`: crece un poco. |
| `paneles` | El contenido de un `<details>` entra con un desvanecido al abrirse |
| `filas` | La fila de una tabla (`tbody tr`) se tiñe al pasar el cursor |

## 7. Lo que conviene saber

- La ventana de antes sigue disponible: `data-espera="ventana"`, o `LABG.work.ventana(opciones)`.
- Las escenas viejas que pasan las apps (`fit`, `cluster`, `grow`, `tree`) ya no se usan: manda `data-app`.
- Capas: escudo 44, capa 45. La barra superior va en 50, los avisos en 90, los diálogos en 100 y el estudio de figuras por encima de todo.
- Para que lo que dibuja un cálculo entre escalonado, la app no tiene que hacer nada: el módulo observa lo que se agrega a `main` mientras dura la espera.
- **Si la app busca las piezas de la ventana vieja** (`.lw-backdrop`, `.lw-bar`, `.lw-msg`…), tiene que buscar también las de la capa: `w.el` es la tarjeta de la espera (`.lfx-box`, dentro de `.lfx-layer`), con `.lfx-bar`, `.lfx-msg`, `.lfx-meta` y `.lfx-actions`. Así lo hace el `ProgressOverlay` de SciMetricsPro. Si la app tiene estilos para su propio velo, que no alcancen a `.lfx-layer`.

## 8. Lista de comprobación al integrar una app nueva

1. Copiar `js/labg-fx.js` y `css/labg-fx.css`, y sumar en `LICENSES-TERCEROS.md` la línea del ícono de destellos (Lucide, ISC).
2. Agregar la línea después de la del navegador, con su `data-app`.
3. Abrir la app: el botón «Animaciones» aparece junto al del tema. Al pulsarlo, cambia y avisa.
4. Correr un cálculo largo:
   - la capa cubre la parte visible del panel, con la animación de la app;
   - al terminar, los resultados entran escalonados.
5. Un cálculo de menos de 300 ms no muestra nada.
6. Con el botón apagado: un círculo que gira y nada escalonado.
7. Revisar la cabecera a 1440 × 900, 1280 × 720 y 390 × 844 px: el botón nuevo no debe empujar nada fuera de la barra.
8. Probar un error: tache, mensaje y «Cerrar».

## 9. Pruebas de la 1.0.0

- **Las animaciones:** las 16 se ven en la demostración, en claro y en oscuro, con los colores de cada app, y cambian de etapa en cada vuelta.
- **No se congelan:** con la página ocupada 2 s seguidos (un cálculo que no cede el paso), el navegador siguió dibujando unos 108 cuadros en cada escena. Según su registro, todas las animaciones de las escenas corren aparte del hilo principal; la única que no es la palomita final, que llega cuando el cálculo ya terminó.
- **El escalonado:** cinco tarjetas entraron con 50 a 68 ms entre una y otra.
- **En las 14 apps:**
  - el módulo carga con su hoja, el puente con `LABG.work` queda puesto y el botón aparece junto al del tema;
  - las esperas reales de los ejemplos (6 en PCAPro, por ejemplo) usan la capa con la animación de la app; las de menos de 300 ms no se ven, como debe ser;
  - una espera de prueba de 1.6 s aparece sobre la parte visible del panel y termina con «¡Listo!»;
  - sin errores en la consola.
- **Tema oscuro y animaciones apagadas:** en PhylogenyPro y ClusteringPro, la capa toma la paleta oscura. En EconomicsPro, con las animaciones apagadas, muestra el círculo, termina antes y no escalona; el botón se ve tachado.
- **Doble clic (file://):** la app abre con el módulo y su hoja. Apagar las animaciones en PCAPro las deja apagadas en AgriDesign.
- **La cabecera:** en las 14 apps, a 1440, 1280 y 390 px, nada se sale ni se encima. A 390 px el botón se esconde y el interruptor queda en la ayuda.
- **SciMetricsPro:** sus 328 pruebas pasan, y en la app su `ProgressOverlay` usa la capa: porcentaje, mensaje, Cancelar, error y `run` con un hilo de trabajo.
