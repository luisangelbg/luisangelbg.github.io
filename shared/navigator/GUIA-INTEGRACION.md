# Navegador LABG · guía de integración (v1.1.3)

El navegador ordena la navegación de una app en tres niveles, sin tocar sus cálculos ni mover sus nodos.

1. **Bloques.** Una barra lateral a la izquierda con el estado de cada bloque:
   - activo, en oro;
   - terminado, con palomita;
   - con aviso, con triángulo;
   - bloqueado, con candado.

   Se contrae con `[` hasta quedar en números. En pantallas de menos de 1024 px se vuelve una fila de pestañas abajo.
2. **Secciones del bloque**, en dos modos que se recuerdan por app:
   - **Documento:** un índice fijo a la derecha que sigue la lectura (IntersectionObserver), con el estado de cada sección y una barra de progreso. La sección actual siempre está a la vista en la ruta de arriba.
   - **Enfocado:** una sección a la vez, con fichas arriba, «Anterior / Siguiente» abajo y Alt+← / Alt+→.
3. **Paleta de comandos** con Ctrl+K. Busca (con tolerancia a errores y sin importar los acentos):
   - bloques;
   - secciones de todos los bloques;
   - controles;
   - figuras;
   - acciones: tema, idioma, atajos, modo, contraer, enlace, reportar y portal.

   Agrupa los resultados y pone primero los recientes.

**Además:**

- Ruta *App › Bloque › Sección*, con el título del bloque en la letra con remates del sistema.
- Contraer y expandir secciones, una o todas, con memoria.
- Botones flotantes para volver arriba y a lo último que se editó; cuando el pie del bloque (`.step-footer`, `.next-bar`) entra en pantalla, suben por encima de él para no tapar «Siguiente».
- Enlaces directos `#bN/seccion` que respetan Atrás y Adelante.
- «Ir al paso pendiente» cuando un bloque espera un paso anterior.
- Ayuda en contexto con `?`.
- Si el Estudio de figuras LABG está cargado, abrir desde el índice las figuras de cada sección.

## 1. Integrar: una línea

```html
<script src="js/labg-core.js"></script>
<script src="js/labg-navigator.js" defer></script>
```

La hoja de estilo (`css/labg-navigator.css`) se carga sola. El navegador lee la barra de bloques de la app (`.stepper .step-btn[data-step]`) y:

- la reemplaza **a la vista**: la barra sigue en el DOM y es la fuente de verdad;
- marca cada panel con `data-labg-block` y cada sección con `data-labg-section`;
- vuelve a leer todo cuando la app cambia de bloque, recalcula, muestra resultados o cambia de idioma.

**Mejora progresiva:** si algo falla al arrancar, el navegador se retira y la app queda con su barra de siempre.

## 2. Qué es una sección

Se detecta sola en cada bloque:

- una **tarjeta con título** (`.card` con su `h2`/`h3`, aunque esté en `.card-head`, `.results-header` o `.chart-head`);
- un **título suelto con lo que le sigue** (`h2.section-title` + hermanos, como en el Inicio de varias apps).

Los envoltorios sin título (`#resultados`, `#bNBody`) se atraviesan, y una tarjeta grande con subtarjetas se abre en sus partes. Si un envoltorio trae dos o más títulos sueltos del mismo rango (`h3` «1 · …», «2 · …»), cada uno abre su sección aunque el primero quede arriba; una tarjeta con su `h2` y subtítulos `h3` sigue siendo una sola.

**Para que un bloque tenga índice** bastan dos partes con título: un `h2`/`h3` (o `.section-title`) arriba de cada una. Si el título no debe imprimirse, basta con darle `no-print`: en pantalla sigue contando.

**Pestañas dentro de un bloque** (opcional, desde la 1.1.0). Si un bloque tiene pestañas y la app dibuja solo la abierta, la opción `tabs` le dice al navegador dónde está su lista (`[role="tablist"]` con botones `[role="tab"]`). El índice muestra entonces las pestañas y, debajo de la abierta, sus secciones; la ruta y la paleta también las nombran. El id de cada pestaña es su `data-tab` o, si no lo tiene, el final del id del botón (`stab-bradford` → `bradford`). Con `tabsOf`, la paleta lista las pestañas de todos los bloques; con `goTab`, abre las de otro bloque; con `tabLink`, copia su enlace. Las apps que no la usan no cambian.

El encabezado del bloque (`.panel-title`, `.blk-title`) y los pies (`.step-footer`, `.next-bar`, `.messages`) no cuentan.

**Estado de cada sección:**

| Estado | Cuándo | Cómo se ve |
|---|---|---|
| pendiente | Muestra un aviso de «carga datos primero» (`.soon-box`, `.sim-empty`, `.empty-state`, `[id$="NoData"]`, `[id$="Empty"]`…) | Círculo hueco |
| con resultados | Tiene figuras o tablas | Punto dorado |
| neutra | Lo demás | Punto gris |

**Por qué no se usa `display:none`:** en el modo enfocado y al plegar, las secciones fuera de vista conservan su ancho (alto cero, `visibility:hidden`, `inert`). Así, las figuras que la app dibuja mientras están escondidas miden bien. Ningún nodo de la app recibe estilos en línea, así que funciones como `Fig.mounted()`, que excluye lo oculto en línea, siguen viendo todo.

## 3. API

```js
LABGNavigator.go(3, 'varianza-explicada');   // ir a un bloque (y a una sección)
LABGNavigator.section('varianza-explicada');
LABGNavigator.next(); LABGNavigator.prev();   // secciones
LABGNavigator.mode('focus');                  // 'doc' | 'focus' (sin argumento: el actual)
LABGNavigator.palette();                      // abre la paleta de comandos
LABGNavigator.reveal(nodo);                   // muestra la sección (plegada o fuera de vista) que contiene un nodo
LABGNavigator.blocks();                       // [{ n, label, done, disabled, active }]
LABGNavigator.sections();                     // [{ id, title, state, head }] del bloque activo (de su pestaña abierta)
LABGNavigator.tabs();                         // [{ id, label, active }] del bloque activo, si tiene pestañas
LABGNavigator.tab('bradford', 'sources');    // abrir una pestaña (sin bloque: la del bloque activo)
LABGNavigator.refresh();
LABGNavigator.on('block' | 'tab' | 'section' | 'mode' | 'ready', fn);
```

## 4. Configuración opcional

Antes del script, `window.LABG_NAV = { … }`:

| Clave | Por omisión | Para qué |
|---|---|---|
| `steps` | `.stepper .step-btn[data-step]` | Los botones de bloque de la app |
| `panel` | `n => document.getElementById('panel-' + n)` | El panel de cada bloque (función o plantilla `'#paso-{n}'`) |
| `blockHead` | `.panel-title, .blk-title, .blk-head, .block-title, .page-head` | Encabezado del bloque (no es sección) |
| `sections` | detección automática | `función(panel) → [{ head, nodes, wrap }]` para definirlas a mano |
| `empty` | `.soon-box, .sim-empty, .empty-state, …` | Avisos de «falta un paso» |
| `sidebar` | `true` | `false` si la app ya tiene menú lateral (SciMetricsPro) |
| `hash` | `true` | `false` si la app usa la dirección para sus rutas |
| `noToc` | `[]` | Bloques sin índice de secciones (tienen el suyo) |
| `tabs` | `null` | Selector de la lista de pestañas dentro del panel (bloques con pestañas) |
| `tabsOf` | `null` | `n => [{ id, label }]`: las pestañas de cualquier bloque, para la paleta |
| `goTab` | `null` | `(n, id) => …`: abrir esa pestaña de ese bloque (si no, el navegador cambia de bloque y pulsa la pestaña) |
| `tabLink` | `null` | `(n, id) => '#…'`: el enlace directo a una pestaña |

Lo propio de cada app de la suite ya viene en el módulo (`PERFILES`):

- **SciMetricsPro:** conserva su menú lateral y sus rutas `#/…`; el navegador agrega índice, modo enfocado y paleta. Desde la 1.1.0, con sus pestañas: la app da sus nombres (`App.tabs`), cómo abrirlas (`App.goTab`) y su enlace (`#/módulo/pestaña`, `App.tabHash`).
- **LeafPro:** el atlas (bloque 5) conserva su índice de categorías.

## 5. Enlaces directos

El formato es `#b3/varianza-explicada`. Usa el mismo `#bN` que ya leían GermplasmPro, LeafPro y ReviewPro.

- Cambiar de bloque **agrega** una entrada al historial, así que Atrás regresa al bloque anterior.
- Leer otra sección solo la **actualiza**, sin llenar el historial.
- Si la app reescribe la dirección al cambiar de bloque, el navegador repone la entrada anterior antes de agregar la nueva.
- «Copiar el enlace a esta sección» está en la paleta.
- En una app con sus propias rutas y pestañas (SciMetricsPro, `hash: false`), el enlace lo escribe la app: `#/sources/bradford`. La dirección sigue a la pestaña abierta sin llenar el historial, y la paleta tiene «Copiar el enlace a esta pestaña».

## 6. Teclado y accesibilidad

| Tecla | Acción |
|---|---|
| Ctrl+K (⌘K) | Paleta de comandos (↑ ↓ elegir, Enter ir, Esc cerrar) |
| `[` | Contraer o mostrar la barra de bloques |
| Alt+← / Alt+→ | En el modo enfocado, la sección anterior o la siguiente; en los extremos, el bloque (como siempre) |
| `?` | El panel de atajos de la app, ahora con «Dónde estás»: bloque, sección, su descripción y, si falta un paso, el botón para ir a él |

**Accesibilidad:**

- Barra lateral con `aria-current="step"` y bloques bloqueados con `aria-disabled`.
- Índice con `aria-current="location"`.
- Ruta como `nav` con `ol`.
- Paleta con el patrón de *combobox* + `listbox` (`aria-activedescendant`).
- Fichas del modo enfocado con `role="tab"`.
- El nombre accesible de cada botón contiene el texto que se ve en él (WCAG 2.5.3); en los de búsqueda, también la tecla «Ctrl K» (desde la 1.1.3).
- Foco visible en oro y todo operable sin ratón.
- Con `prefers-reduced-motion` no hay desplazamiento suave ni animaciones.
- Al imprimir no aparece nada del navegador y todas las secciones se ven.

## 7. Disposición por ancho de pantalla

| Ancho | Bloques | Secciones |
|---|---|---|
| ≥ 1280 px | Barra lateral con nombres (248 px) | Índice a la derecha (228 px) |
| 1200–1279 px | Barra lateral en números (60 px; se cambia con `[` y se recuerda) | Índice a la derecha |
| 1024–1199 px | Barra lateral | Botón «Secciones» en la ruta |
| < 1024 px | Pestañas abajo, desplazables | Botón «Secciones» en la ruta |

Funciona de 360 a 2560 px. La barra superior de la app se extiende sobre la barra lateral y su contenido usa todo el ancho.
