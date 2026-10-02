# Navegador LABG · cambios

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
