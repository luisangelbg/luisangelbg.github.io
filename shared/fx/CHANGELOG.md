# Efectos LABG · cambios

## 1.0.0 · 3 de octubre de 2026

Primera versión. Sin sonido: el autor de la suite decidió dejarlo fuera.

- **Las esperas, sobre el panel de resultados.** `labg-fx.js` toma el lugar de la ventana de `LABG.work` (de `labg-core.js`) con la misma API, así que las esperas de las 14 apps pasan solas a la capa nueva:
  - la capa cubre solo la parte visible del panel del bloque activo; si no hay panel a la vista, sale una tarjeta al centro;
  - lleva la animación de la app, el título, el paso, la barra y el tiempo restante; Cancelar, donde la app lo da;
  - lo que dura menos de 300 ms no se ve;
  - al terminar: palomita breve sobre el isotipo LABG, desvanecido de 300 ms y aparición escalonada (60 ms) de lo que el cálculo dibujó;
  - con error: tache, mensaje y «Cerrar»;
  - como la ventana, un escudo transparente evita que se pulse algo a media cuenta, y el foco se queda en la espera.
- **Una animación por app** (120 px, de 2,6 a 3,4 s en bucle, en los colores de su tema): nube de puntos que gira (PCAPro), puntos que se agrupan (ClusteringPro), hélice de alelos (PopGeneticsPro), cladograma (PhylogenyPro), brote que crece (PhenologyPro), polen entre flores (PollinationPro), parcelas en bloques (AgriDesign), barras y red de citas (SciMetricsPro), curva logística (BioModelling Pro), oferta y demanda (EconomicsPro), cruza de progenitores (BreedingPro), histograma y campana (StatsPro, también para SigmaPro), semillas en el banco (GermplasmPro) y documentos por el embudo PRISMA (ReviewPro). CladisticsPro usa la de PhylogenyPro.
- **No se congelan:** solo `transform` y `opacity`, que el navegador anima aparte del cálculo.
- **`LABGfx.loading.start/step/done/fail/run`:** la misma espera, con pasos («Calculando componentes… paso 2 de 4»).
- **Botón «Animaciones»** junto al del tema: las apaga o las enciende en toda la suite (clave `labg.motion`). En el teléfono, el mismo interruptor queda en la ayuda («?»). Apagadas, o con «reducir movimiento» del sistema: un círculo que gira, sin escalonado ni microanimaciones.
- **Microanimaciones** de 150 a 200 ms: botones, paneles `<details>` y filas de tabla (`data-micro`).
- **SciMetricsPro:** su `ProgressOverlay` encuentra la capa nueva además de la ventana vieja, y su velo propio ya no alcanza a la capa.
- Ícono «sparkles» de Lucide 1.49.0 (ISC), anotado en `LICENSES-TERCEROS.md` de cada app.
- Página de demostración: `demo.html`. Pruebas: guía, sección 9.
- Copia fija en `v1.0.0/`.
