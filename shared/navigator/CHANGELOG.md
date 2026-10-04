# Navegador LABG · cambios

## 1.1.2 · 3 de octubre de 2026

- **Sin letras de otros ni peticiones a internet.** La hoja de estilo ya no declara «LABG Sans» ni «LABG Serif» (IBM Plex, que se pedían al portal de la suite). La interfaz va con la letra de palo seco del sistema y los títulos de bloque con la de remates, que es lo que ya se veía sin conexión. Así, una app abierta con doble clic no hace ninguna petición fuera del equipo y no lleva tipografías de terceros. CladisticsPro ya lo hacía así.
- Comprobado en las 14 apps de análisis abiertas con doble clic (en 11, también con el estudio abierto en una figura): ninguna petición fuera del equipo; antes eran tres por app, una por archivo de letra. La barra lateral, la ruta y la ayuda se ven bien con las letras del sistema, en escritorio y en teléfono.
- Copia fija en `v1.1.2/`.

## 1.1.1 · 3 de octubre de 2026

- **Los botones flotantes ya no tapan «Siguiente».** «Último cambio» y «Volver arriba» viven en la esquina inferior derecha, justo donde cada app pone el botón «Siguiente» de su pie de bloque; al llegar al final de la página quedaban encima de él. Ahora, cuando un pie visible (`.step-footer` o `.next-bar`) entra en pantalla, los flotantes suben lo necesario para quedar 10 px por encima, y vuelven a su lugar al subir la página. El ajuste se recalcula con el desplazamiento y al cambiar el tamaño de la ventana, y nunca sube más de media pantalla. Lo reportó el autor en CladisticsPro.
- Comprobado en las 17 apps con navegador (las 16 de la suite y CladisticsPro), en 1280 px y en teléfono (390 px), con «Último cambio» visible y la página al final: ningún botón del pie queda debajo de los flotantes. Sin errores de consola.
- Copia fija en `v1.1.1/`.

## 1.1.0 · 2 de octubre de 2026

- **Pestañas dentro de un bloque.** Opción nueva `tabs`: el selector de la lista de pestañas (`[role="tablist"]`) dentro del panel. Sirve cuando un bloque tiene pestañas y la app dibuja solo la abierta. Entonces:
  - el índice de la derecha muestra las pestañas y, debajo de la abierta, sus secciones. Un clic en otra pestaña la abre con el botón de la propia app y sube hasta las pestañas si quedaron arriba;
  - la ruta dice *App › Bloque › Pestaña › Sección* (sin la sección si se llama igual que la pestaña). El nombre del bloque es lo último que se recorta;
  - en pantallas medianas, el botón «Pestañas» abre ese mismo índice;
  - la paleta (Ctrl+K) tiene un grupo «Pestañas» con las de todos los bloques, si la app las da con `tabsOf`; y la acción «Copiar el enlace a esta pestaña», si la app da `tabLink`;
  - al cambiar de pestaña, el modo enfocado empieza por su primera sección, y «Contraer todas» solo toca las secciones de la pestaña abierta.

  Opciones `tabsOf`, `goTab` y `tabLink`; API `LABGNavigator.tabs()` y `LABGNavigator.tab(id, bloque)`; evento `tab`.
- **SciMetricsPro**, la primera app con pestañas en el navegador. Su perfil usa esas opciones con las funciones nuevas de la app (`App.tabs`, `App.goTab` y `App.tabHash`), que también acepta enlaces del tipo `#/sources/bradford`.
- **La paleta, sin secciones repetidas.** En una app donde todos los bloques comparten un mismo panel (SciMetricsPro), cada título se indexaba una vez por bloque; ahora, una sola vez y en el bloque activo. Los botones de pestaña ya no salen también como controles.
- Comprobado en SciMetricsPro: enlaces a una pestaña al abrir y al navegar, una pestaña que no existe, clics en la app, en el índice y en el menú «Pestañas», la paleta hacia otro módulo, Atrás, copiar el enlace, inglés, modo enfocado, 1100 px y teléfono, sin errores. Su batería pasa las 328 pruebas en el mismo tiempo que la versión anterior. En las 14 apps de análisis, el inventario de secciones da lo mismo que con la 1.0.2 (126 bloques), y en las que no tienen pestañas, contraer, expandir y la paleta funcionan igual.
- Copia fija en `v1.1.0/`.

## 1.0.2 · 1 de octubre de 2026

- **Títulos sueltos dentro de un envoltorio.** Si un envoltorio trae dos o más títulos sueltos del mismo rango (un `#bNBody` con «1 · …», «2 · …»), cada uno abre su sección. Antes, cuando el primero quedaba arriba del envoltorio, el envoltorio entero contaba como una sola sección. Una tarjeta con su `h2` arriba y subtítulos `h3` sigue siendo una sola sección.
- **Una tarjeta titulada seguida de un envoltorio de tarjetas.** Un envoltorio sin título propio que empieza con una tarjeta titulada y sigue con otro envoltorio de tarjetas (por ejemplo, las opciones del modelo y luego `#resultados`) ya no se toma entero por la primera tarjeta: cada tarjeta es su sección.
- Comprobado en las 14 apps de análisis con sus ejemplos: de 126 bloques solo cambiaron los que debían. En GermplasmPro, los bloques 6 y 8 pasan de 1 a 4 secciones, y el 7, con la caracterización cargada, de 1 a 3. En BioModellingPro, con los diez bloques calculados, el Bloque 9 pasa de 5 a 13 secciones (ya aparecen los resultados del modelo) y los bloques 8 y 10 separan sus resultados (de 10 a 15 y de 13 a 15). Sin errores de consola.
- Copia fija en `v1.0.2/`.

## 1.0.1 · 1 de octubre de 2026

- **El idioma, solo si cambia de verdad.** El observador del atributo `lang` rehacía etiquetas, barra lateral e índice cada vez que una app volvía a escribir el mismo idioma; por ejemplo, al traducir un panel. Ahora guarda el idioma vigente y reacciona solo cuando cambia, igual que el Estudio de figuras desde la 1.2.0.
- Comprobado en las 14 apps de análisis: reescribir el mismo `lang` cinco veces ya no cambia nada en el navegador (antes eran unos 320 cambios), y al pasar a otro idioma traduce igual que antes.
- Copia fija en `v1.0.1/`.

## 1.0.0 · 1 de octubre de 2026

Primera versión.

- **Bloques:** barra lateral con estados (activo, terminado, aviso, bloqueado) que se contrae con `[`; en pantallas angostas, pestañas abajo.
- **Secciones:**
  - se detectan solas en cada bloque, con su estado (pendiente, con resultados);
  - modo **Documento**: índice que sigue la lectura y barra de progreso;
  - modo **Enfocado**: una sección a la vez, con Anterior/Siguiente y Alt+←/→;
  - el modo se recuerda por app.
- **Paleta Ctrl+K:** búsqueda difusa sin acentos de bloques, secciones, controles, figuras y acciones, con recientes.
- **Además:**
  - ruta App › Bloque › Sección;
  - contraer y expandir con memoria;
  - botones para volver arriba y a lo último editado;
  - enlaces `#bN/seccion` con Atrás y Adelante;
  - «Ir al paso pendiente»;
  - ayuda en contexto con `?`;
  - abrir figuras en el estudio desde el índice.
- **Accesibilidad y compatibilidad:** roles ARIA, todo con teclado, sin movimiento si se pide, impresión limpia, de 360 a 2560 px.
- **Íconos:** de Lucide (ISC); ver `../LICENSES-TERCEROS.md`.
