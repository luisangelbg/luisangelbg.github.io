/* =====================================================================
   ÍNDICE DEL BLOG
   Para publicar una entrada:
     1. Escribe el texto en Markdown en  blog/entradas/<slug>.md
     2. Agrega aquí un bloque con el mismo slug.
   La entrada más reciente aparece primero (se ordena por fecha).
   ===================================================================== */
window.LABG_BLOG = [
  {
    slug: "bienvenida",
    titulo: "Bienvenida a la suite LABG",
    fecha: "2026-09-26",
    etiquetas: ["Noticias"],
    resumen: "Un solo lugar para las aplicaciones científicas del laboratorio: qué son, cómo usarlas y cómo citarlas.",
    apps: []
  },
  {
    slug: "como-citar",
    titulo: "Cómo citar las aplicaciones en tu tesis o artículo",
    fecha: "2026-09-26",
    etiquetas: ["Guías", "Ciencia abierta"],
    resumen: "Cada aplicación publicada tiene un DOI de Zenodo. Aquí se explica cuál usar y dónde encontrar la cita lista.",
    apps: ["PCAPro", "ClusteringPro", "AgriDesign"]
  },
  {
    slug: "taller-modelado-distribucion",
    titulo: "Taller: modelado de distribución de especies y análisis de datos",
    fecha: "2026-09-25",
    etiquetas: ["Talleres"],
    resumen: "Seis horas para pasar de una pregunta de investigación a un mapa de idoneidad, con BioModelling Pro y las herramientas de análisis de la suite.",
    apps: ["BioModellingPro", "PCAPro", "ClusteringPro"]
  }
];
