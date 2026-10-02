# Navegador LABG · cambios

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
