/* =====================================================================
   CATÁLOGO DE APLICACIONES LABG
   ---------------------------------------------------------------------
   Para agregar una app: copia un bloque { ... }, cambia los datos y guarda.
   Para publicar una app "próximamente": cambia  estado: "proximamente"
   por  estado: "enlinea"  cuando ya esté en GitHub Pages.

   Campos:
     id          nombre del repositorio en GitHub (luisangelbg/<id>)
     nombre      nombre visible
     lema        una línea
     descripcion párrafo breve
     categoria   una de las claves de LABG_CATEGORIAS (abajo)
     estado      "enlinea" | "proximamente"
     version     "1.0.0" o "" si no aplica
     doi         DOI de Zenodo (concept DOI) o ""
     licencia    "GPL-3.0", "AGPL-3.0"...
     manualPdf   nombre del PDF dentro de <repo>/manual/  ("" si no hay)
     manualMb    tamaño aproximado del PDF en MB
     manualHtml  true si existe manual/es/manual-completo.html
     datos       true si el repositorio trae datos de ejemplo
     puntos      3 o 4 cosas que hace (se muestran en la ficha)
     destacada   true para mostrarla en la portada
     anio        (opcional) año de la cita; si falta se usa el de publicación de la suite (2026)
   ===================================================================== */

window.LABG_CATEGORIAS = {
  estadistica: { nombre: "Estadística y análisis multivariado", corto: "Estadística" },
  agronomia:   { nombre: "Experimentación y agronomía", corto: "Agronomía" },
  genetica:    { nombre: "Genética, mejoramiento y recursos genéticos", corto: "Genética" },
  biogeografia:{ nombre: "Biogeografía y filogenia", corto: "Biogeografía" },
  botanica:    { nombre: "Botánica para el aula", corto: "Botánica" },
  ciencia:     { nombre: "Herramientas para la ciencia", corto: "Herramientas" }
};

window.LABG_APPS = [
  {
    id: "LABGStat", nombre: "LABG Stat",
    lema: "Estadística completa, sin salir de tu navegador",
    descripcion: "119 métodos estadísticos en 14 áreas, desde la limpieza de datos hasta modelos mixtos, series de tiempo, supervivencia y evaluación sensorial. Cada análisis entrega la tabla, una figura editable, una lectura en lenguaje claro y un párrafo listo para el artículo.",
    categoria: "estadistica", estado: "proximamente", version: "1.2.0", doi: "", licencia: "AGPL-3.0",
    manualPdf: "", manualMb: 0, manualHtml: false, datos: true,
    puntos: ["119 métodos en 14 áreas", "Interpretación en lenguaje claro de cada resultado", "Párrafo de resultados con estadístico, gl, p y tamaño del efecto", "Motor de cálculo incluido: no se conecta a internet"],
    destacada: true
  },
  {
    id: "PCAPro", nombre: "PCAPro",
    lema: "Análisis de componentes principales guiado",
    descripcion: "Preparación de datos, supuestos, extracción, rotación, mapas factoriales e interpretación, hasta un informe listo para publicar. Incluye además AC, ACM, FAMD, AFM y agrupamiento HCPC sobre las coordenadas factoriales.",
    categoria: "estadistica", estado: "enlinea", version: "1.1.0", doi: "10.5281/zenodo.22649709", licencia: "GPL-3.0",
    manualPdf: "PCAPro User's Manual.pdf", manualMb: 16, manualHtml: true, datos: true,
    puntos: ["PCA, AC, ACM, FAMD y AFM con un mismo núcleo", "Recomendador del método según tu tabla", "HCPC sobre las coordenadas factoriales", "Informe bilingüe listo para publicar"],
    destacada: true
  },
  {
    id: "ClusteringPro", nombre: "ClusteringPro",
    lema: "Grupos naturales en datos biológicos, ecológicos y agronómicos",
    descripcion: "Del cuadro de datos al dendrograma listo para publicar: tendencia de agrupamiento, coeficientes de similitud para todo tipo de variables, métodos jerárquicos y de partición, número óptimo de grupos, validación y perfil de cada grupo.",
    categoria: "estadistica", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.22682795", licencia: "GPL-3.0",
    manualPdf: "ClusteringPro User's Manual.pdf", manualMb: 25, manualHtml: true, datos: true,
    puntos: ["Datos cuantitativos, binarios, nominales, mixtos y ecológicos", "k-means, PAM, CLARA, c-means difuso, DBSCAN y mezclas gaussianas", "Validación y estabilidad de los grupos", "Dendrogramas y mapas editables"],
    destacada: false
  },
  {
    id: "AnalizaR", nombre: "StatsPro",
    lema: "Estadística rigurosa para el aula, sin código",
    descripcion: "Sube una hoja de cálculo y obtén estadística descriptiva, supuestos del ANOVA, regresión, comparación de medias, correlación y análisis multivariado, con gráficas editables de calidad para publicación.",
    categoria: "estadistica", estado: "enlinea", version: "", doi: "", licencia: "GPL-3.0",
    manualPdf: "", manualMb: 0, manualHtml: false, datos: true,
    puntos: ["Descriptiva, ANOVA y comparación de medias", "Regresión y correlación", "PCA y agrupamiento", "Todo el cálculo dentro del navegador"],
    destacada: false
  },
  {
    id: "AgriDesign", nombre: "AgriDesign",
    lema: "Diseña y analiza experimentos agrícolas",
    descripcion: "De la libreta de campo a resultados listos para publicar: importación y revisión de datos, descriptiva, supuestos del ANOVA, los diseños experimentales clásicos con sus pruebas de comparación de medias, figuras editables e informe automático.",
    categoria: "agronomia", estado: "enlinea", version: "1.0", doi: "10.5281/zenodo.22683046", licencia: "GPL-3.0",
    manualPdf: "AgriDesign User's Manual.pdf", manualMb: 20, manualHtml: true, datos: true,
    puntos: ["DCA, bloques, cuadro latino, factoriales y parcelas divididas", "Tukey, Duncan, LSD y otras pruebas de medias", "Generador de croquis de campo", "Informe automático"],
    destacada: true
  },
  {
    id: "PhenologyPro", nombre: "PhenologyPro",
    lema: "¿Cuánto calor, cuánta agua y para cuándo?",
    descripcion: "Agroclimatología y fenología de cultivos, de la serie de la estación al informe: control de calidad de los datos, clima del sitio con climograma y heladas, grados-día con seis métodos, evapotranspiración de referencia por FAO-56 Penman–Monteith y cuatro métodos simples, balance hídrico diario de la zona radical, calendario de riego, etapas BBCH calibrables, frío invernal, fotoperiodo, ventana de siembra y escenarios de calentamiento. Todo con escalas de lectura y figuras editables hasta 900 ppp.",
    categoria: "agronomia", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.23004710", licencia: "GPL-3.0",
    manualPdf: "PhenologyPro User's Manual.pdf", manualMb: 13, manualHtml: true, datos: true,
    puntos: ["Grados-día y etapas BBCH fechadas por tiempo térmico, con calibración", "ETo por FAO-56 Penman–Monteith y cuatro métodos simples, con lo que la estación mida", "Balance hídrico diario, calendario de riego y capacidad de diseño", "Heladas, frío invernal, ventana de siembra y escenarios de +1, +2 y +3 °C"],
    destacada: true
  },
  {
    id: "EconomicsPro", nombre: "EconomicsPro",
    lema: "¿Conviene el proyecto, y cuánto aguanta?",
    descripcion: "Evaluación económica y financiera de proyectos agrícolas y agroindustriales, del supuesto al informe: horizonte, precios constantes o corrientes y tasa de descuento por TREMA, CPPC o CAPM; series deflactadas con cinco métodos de proyección; inversión con reposición automática, costos y capital de trabajo; créditos y estados proforma con los dos flujos; VAN, TIR con todas sus raíces, TIRM, B/C, recuperación y valor anual equivalente; análisis marginal del CIMMYT; valores límite, escenarios y Monte Carlo con correlación; precios cuenta con el puente exacto al VAN económico; y comparación de alternativas, reemplazo, turno de Faustmann y comprar o rentar.",
    categoria: "agronomia", estado: "enlinea", version: "1.0.7", doi: "10.5281/zenodo.23005974", licencia: "GPL-3.0",
    manualPdf: "EconomicsPro User's Manual.pdf", manualMb: 12, manualHtml: true, datos: true,
    puntos: ["VAN, TIR y todos los indicadores de los dos flujos, con el dictamen redactado", "Riesgo: valores límite, escenarios, Monte Carlo con correlación y árbol de decisión", "Evaluación social con precios cuenta y un puente exacto del VAN privado al económico", "Informe que se lee solo y paquete .zip que permite rehacer todos los cálculos"],
    destacada: true
  },
  {
    id: "BreedingPro", nombre: "BreedingPro",
    lema: "De los progenitores al mejor híbrido",
    descripcion: "Cruzas dialélicas, diseños de apareamiento, medias generacionales, índices de selección, interacción genotipo × ambiente, modelo animal, predicción genómica y de híbridos, para mejoramiento vegetal y animal.",
    categoria: "genetica", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.23005938", licencia: "GPL-3.0",
    manualPdf: "BreedingPro User's Manual.pdf", manualMb: 25, manualHtml: true, datos: true,
    puntos: ["Griffing, Hayman–Jinks y Gardner–Eberhart", "Heredabilidad, heterosis e índices de selección", "Interacción G×A: AMMI y estabilidad", "BLUP y predicción genómica"],
    destacada: true
  },
  {
    id: "PopGeneticsPro", nombre: "PopGeneticsPro",
    lema: "Genética de poblaciones de plantas, del campo al artículo",
    descripcion: "Microsatélites, SNP, isoenzimas, bandas AFLP/ISSR/RAPD, secuencias y caracteres morfológicos: diversidad, Hardy–Weinberg, AMOVA y estadísticos F, distancias, agrupamiento bayesiano, redes de haplotipos e historia demográfica.",
    categoria: "genetica", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.22740171", licencia: "GPL-3.0",
    manualPdf: "PopGeneticsPro_Manual_de_usuario_ES.pdf", manualMb: 30, manualHtml: true, datos: true,
    puntos: ["Marcadores codominantes, dominantes y secuencias", "AMOVA jerárquico y estadísticos F", "Agrupamiento bayesiano y redes de haplotipos", "Sistema de apareamiento y QST vs FST"],
    destacada: false
  },
  {
    id: "GermplasmPro", nombre: "GermplasmPro",
    lema: "El banco de germoplasma, accesión por accesión",
    descripcion: "Para el trabajo diario de una colección de recursos fitogenéticos de cualquier especie y forma de conservación: pasaporte MCPD v2.1, control de duplicados, mapas de colecta sin internet, diversidad geográfica, vacíos de colecta, existencias, germinación y regeneración.",
    categoria: "genetica", estado: "proximamente", version: "", doi: "", licencia: "GPL-3.0",
    manualPdf: "", manualMb: 0, manualHtml: false, datos: true,
    puntos: ["Pasaporte con los descriptores multicultivo MCPD v2.1", "Control de duplicados y etiquetas", "Mapas de colecta y vacíos de colecta", "Semillas, campo, in vitro y criopreservación"],
    destacada: false
  },
  {
    id: "BioModellingPro", nombre: "BioModelling Pro",
    lema: "De los registros al mapa de idoneidad",
    descripcion: "Descarga registros de presencia de portales abiertos de biodiversidad, depúralos, extrae variables bioclimáticas, de clima y de suelo, explóralas y modela la distribución de la especie con diez algoritmos y un ensamble, con validación, umbrales y proyecciones a escenarios climáticos.",
    categoria: "biogeografia", estado: "enlinea", version: "1.1.1", doi: "10.5281/zenodo.22907825", licencia: "GPL-3.0",
    manualPdf: "BioModelling Pro User's Manual.pdf", manualMb: 13, manualHtml: true, datos: true,
    puntos: ["Registros de presencia abiertos y su depuración", "Máxima entropía y otros nueve algoritmos, más ensamble", "Validación, umbrales e importancia de variables", "Proyección a escenarios de cambio climático"],
    destacada: true
  },
  {
    id: "PollinationPro", nombre: "PollinationPro",
    lema: "¿Coinciden la flor y su polinizador?",
    descripcion: "Plantas, polinizadores y su solapamiento con datos de presencia, para cualquier cultivo, pariente silvestre o planta nativa: registros de presencia abiertos e interacciones publicadas, depuración y taxonomía, mapas, coocurrencia corregida por esfuerzo de muestreo, fenología con estadística circular, nicho ambiental, desajuste de distribución con clima futuro y redes de visitas.",
    categoria: "biogeografia", estado: "enlinea", version: "1.2.1", doi: "10.5281/zenodo.23004694", licencia: "GPL-3.0",
    manualPdf: "PollinationPro User's Manual.pdf", manualMb: 17, manualHtml: true, datos: true,
    puntos: ["Registros de presencia abiertos, interacciones publicadas y tus visitas", "Coocurrencia de Veech con grupo objetivo y fenología circular", "Nicho ambiental y desajuste planta–polinizador con clima futuro", "Red de visitas contra modelos nulos, informe y paquete"],
    destacada: true
  },
  {
    id: "PhylogenyPro", nombre: "PhylogenyPro",
    lema: "Del alineamiento al árbol fechado",
    descripcion: "Filogenia molecular completa: alineamiento, selección del modelo de sustitución, parsimonia, máxima verosimilitud e inferencia bayesiana, soporte de ramas, reloj molecular con fósiles, diversificación, caracteres y áreas ancestrales.",
    categoria: "biogeografia", estado: "enlinea", version: "1.4.0", doi: "10.5281/zenodo.23005815", licencia: "GPL-3.0",
    manualPdf: "PhylogenyPro_Manual_de_usuario_ES.pdf", manualMb: 4, manualHtml: true, datos: true,
    puntos: ["ADN, aminoácidos, codones y morfología", "Parsimonia, máxima verosimilitud y MCMC bayesiano", "Reloj molecular y calibración con fósiles", "Reconstrucción de caracteres y áreas ancestrales"],
    destacada: false
  },
  {
    id: "FloralPro", nombre: "FloralPro",
    lema: "La flor, verticilo por verticilo",
    descripcion: "Para enseñar y aprender la estructura de la flor: fórmulas y diagramas florales, la flor en 3D y en corte, un atlas de verticilos, 82 familias de angiospermas con énfasis en México, clave interactiva, autoevaluación y modo clase.",
    categoria: "botanica", estado: "proximamente", version: "1.2.0", doi: "", licencia: "GPL-3.0",
    manualPdf: "", manualMb: 0, manualHtml: false, datos: false,
    puntos: ["Fórmulas y diagramas florales", "82 familias de angiospermas", "Clave interactiva y autoevaluación", "Modo clase para proyectar e imprimir"],
    destacada: false
  },
  {
    id: "LeafPro", nombre: "LeafPro",
    lema: "La hoja, carácter por carácter",
    descripcion: "Morfología de la hoja para el aula: partes, haz y envés con un corte anatómico interactivo, filotaxia con simulador del ángulo de oro, un atlas de más de 140 términos ilustrados y un constructor de hojas con descripción botánica.",
    categoria: "botanica", estado: "proximamente", version: "1.2.0", doi: "", licencia: "GPL-3.0",
    manualPdf: "", manualMb: 0, manualHtml: false, datos: false,
    puntos: ["Corte anatómico interactivo", "Atlas de más de 140 términos ilustrados", "Constructor de hojas con descripción redactada", "Autoevaluación generativa y modo clase"],
    destacada: false
  },
  {
    id: "SciMetricsPro", nombre: "SciMetricsPro",
    lema: "De tu búsqueda bibliográfica a un artículo bibliométrico",
    descripcion: "Importa las exportaciones de las bases de datos, une duplicados, normaliza autores, instituciones y países, calcula los indicadores clásicos, dibuja las estructuras conceptual, intelectual y social y registra una revisión sistemática PRISMA 2020.",
    categoria: "ciencia", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.22879993", licencia: "GPL-3.0",
    manualPdf: "SciMetricsPro User's Manual.pdf", manualMb: 26, manualHtml: true, datos: true,
    puntos: ["Lee exportaciones de las principales bases", "Redes de coautoría, cocitación y temas", "Diagrama PRISMA 2020", "Texto metodológico redactado con tus datos"],
    destacada: true
  },
  {
    id: "PDFPro", nombre: "PDFPro",
    lema: "Tus PDF, completos, sin pagar licencias",
    descripcion: "Lector y editor de PDF con un motor propio basado en la norma ISO 32000: lee, busca, anota, organiza páginas, edita texto e imágenes, llena formularios y protege con contraseña. Nada sale de tu computadora.",
    categoria: "ciencia", estado: "proximamente", version: "", doi: "", licencia: "GPL-3.0",
    manualPdf: "", manualMb: 0, manualHtml: false, datos: false,
    puntos: ["Leer, buscar y anotar", "Unir, dividir y reordenar páginas", "Editar texto e imágenes", "Formularios y contraseñas"],
    destacada: false
  }
];
