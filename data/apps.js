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
     idiomas     (opcional) ["es", "en"] cuando la app está traducida: añade la
                 insignia ES · EN y el botón que la abre en inglés
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
    id: "SigmaPro", nombre: "SigmaPro",
    lema: "Del experimento a la conclusión, con cifras que se pueden comprobar",
    descripcion: "Estadística para la investigación agronómica y biológica, del archivo de campo a la tabla y la figura publicadas: diseños experimentales con comparaciones de medias, contrastes y polinomios ortogonales; regresión, correlación y tablas de contingencia; modelos lineales mixtos, componentes de varianza y heredabilidad; modelos generalizados y no lineales; superficies de respuesta, mezclas y deseabilidad; ensayos multiambiente con estabilidad, AMMI y GGE; tamaño de muestra, muestreo, supervivencia, series de tiempo y multivariado. Cada uno de sus 78 análisis da la conclusión en palabras, revisa sus supuestos, explica cómo leer cada número, escribe el párrafo de métodos y el código R equivalente, y tiene su ficha de fundamentos. Validada contra R.",
    categoria: "estadistica", estado: "enlinea", version: "1.0.0", doi: "10.5281/zenodo.23935865", licencia: "GPL-3.0",
    manualPdf: "SigmaPro_Manual_de_usuario_ES.pdf", manualMb: 18, manualHtml: true, datos: true,
    manualEn: { pdf: "SigmaPro User's Manual (English).pdf", mb: 18, html: true },
    idiomas: ["es", "en"],
    puntos: ["78 análisis, de los diseños experimentales a los modelos mixtos y multiambiente", "Conclusión en palabras, supuestos con semáforo y guía para leer cada número", "Reporte en .docx, PDF y Markdown con métodos, código R y apéndice metodológico", "Validada contra R: 849 casos y 93 169 valores"],
    destacada: false
  },
  {
    id: "PCAPro", nombre: "PCAPro",
    lema: "Análisis de componentes principales guiado",
    descripcion: "Preparación de datos, supuestos, extracción, rotación, mapas factoriales e interpretación, hasta un informe listo para publicar. Incluye además AC, ACM, FAMD, AFM y agrupamiento HCPC sobre las coordenadas factoriales.",
    categoria: "estadistica", estado: "enlinea", version: "1.1.0", doi: "10.5281/zenodo.22649709", licencia: "GPL-3.0",
    manualPdf: "PCAPro User's Manual.pdf", manualMb: 16, manualHtml: true, datos: true,
    manualEn: { pdf: "PCAPro User's Manual (English).pdf", mb: 16, html: true },
    idiomas: ["es", "en"],
    puntos: ["PCA, AC, ACM, FAMD y AFM con un mismo núcleo", "Recomendador del método según tu tabla", "HCPC sobre las coordenadas factoriales", "Informe bilingüe listo para publicar"],
    destacada: true
  },
  {
    id: "ClusteringPro", nombre: "ClusteringPro",
    lema: "Grupos naturales en datos biológicos, ecológicos y agronómicos",
    descripcion: "Del cuadro de datos al dendrograma listo para publicar: tendencia de agrupamiento, coeficientes de similitud para todo tipo de variables, métodos jerárquicos y de partición, número óptimo de grupos, validación y perfil de cada grupo.",
    categoria: "estadistica", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.22682795", licencia: "GPL-3.0",
    manualPdf: "ClusteringPro User's Manual.pdf", manualMb: 25, manualHtml: true, datos: true,
    manualEn: { pdf: "ClusteringPro User's Manual (English).pdf", mb: 26, html: true },
    puntos: ["Datos cuantitativos, binarios, nominales, mixtos y ecológicos", "k-means, PAM, CLARA, c-means difuso, DBSCAN y mezclas gaussianas", "Validación y estabilidad de los grupos", "Dendrogramas y mapas editables"],
    destacada: false
  },
  {
    id: "CorrelationPro", nombre: "CorrelationPro",
    lema: "Correlación de todo tipo, con su teoría",
    descripcion: "Del cuadro de datos a la correlación bien elegida y bien reportada: coeficientes clásicos, robustos y no lineales, correlación parcial y entre conjuntos, medidas para variables categóricas, ordinales y latentes, acuerdo y fiabilidad, datos agrupados, repetidos, en el tiempo, el espacio o el círculo, redes de correlación, comparación de correlaciones, potencia y metaanálisis, con cada fórmula explicada y figuras listas para publicar.",
    categoria: "estadistica", estado: "enlinea", version: "1.0.0", doi: "10.5281/zenodo.23867439", licencia: "GPL-3.0",
    manualPdf: "CorrelationPro_Manual_de_usuario_ES.pdf", manualMb: 18, manualHtml: true, datos: true,
    manualEn: { pdf: "CorrelationPro User's Manual (English).pdf", mb: 18, html: true },
    idiomas: ["es", "en"],
    puntos: ["Más de ochenta medidas, de Pearson a la dependencia no lineal", "Parcial, canónica, categóricas, policóricas y acuerdo", "Datos con grupos, series, espacio, filogenia y ángulos", "Redes, comparación de correlaciones, potencia y metaanálisis"],
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
    manualEn: { pdf: "AgriDesign User's Manual (English).pdf", mb: 21, html: true },
    puntos: ["DCA, bloques, cuadro latino, factoriales y parcelas divididas", "Tukey, Duncan, LSD y otras pruebas de medias", "Generador de croquis de campo", "Informe automático"],
    destacada: true
  },
  {
    id: "PhenologyPro", nombre: "PhenologyPro",
    lema: "¿Cuánto calor, cuánta agua y para cuándo?",
    descripcion: "Agroclimatología y fenología de cultivos, de la serie de la estación al informe: control de calidad de los datos, clima del sitio con climograma y heladas, grados-día con seis métodos, evapotranspiración de referencia por FAO-56 Penman–Monteith y cuatro métodos simples, balance hídrico diario de la zona radical, calendario de riego, etapas BBCH calibrables, frío invernal, fotoperiodo, ventana de siembra y escenarios de calentamiento. Todo con escalas de lectura y figuras editables hasta 900 ppp.",
    categoria: "agronomia", estado: "enlinea", version: "1.2.0", doi: "10.5281/zenodo.23004710", licencia: "GPL-3.0",
    manualPdf: "PhenologyPro User's Manual.pdf", manualMb: 14, manualHtml: true, datos: true,
    manualEn: { pdf: "PhenologyPro User's Manual (English).pdf", mb: 14, html: true },
    puntos: ["Grados-día y etapas BBCH fechadas por tiempo térmico, con calibración", "ETo por FAO-56 Penman–Monteith y cuatro métodos simples, con lo que la estación mida", "Balance hídrico diario, calendario de riego y capacidad de diseño", "Heladas, frío invernal, ventana de siembra y escenarios de +1, +2 y +3 °C"],
    destacada: true
  },
  {
    id: "EconomicsPro", nombre: "EconomicsPro",
    lema: "¿Conviene el proyecto, y cuánto aguanta?",
    descripcion: "Evaluación económica y financiera de proyectos agrícolas y agroindustriales, del supuesto al informe: horizonte, precios constantes o corrientes y tasa de descuento por TREMA, CPPC o CAPM; series deflactadas con cinco métodos de proyección; inversión con reposición automática, costos y capital de trabajo; créditos y estados proforma con los dos flujos; VAN, TIR con todas sus raíces, TIRM, B/C, recuperación y valor anual equivalente; análisis marginal del CIMMYT; valores límite, escenarios y Monte Carlo con correlación; precios cuenta con el puente exacto al VAN económico; y comparación de alternativas, reemplazo, turno de Faustmann y comprar o rentar.",
    categoria: "agronomia", estado: "enlinea", version: "1.0.7", doi: "10.5281/zenodo.23005974", licencia: "GPL-3.0",
    manualPdf: "EconomicsPro User's Manual.pdf", manualMb: 12, manualHtml: true, datos: true,
    manualEn: { pdf: "EconomicsPro User's Manual (English).pdf", mb: 13, html: true },
    puntos: ["VAN, TIR y todos los indicadores de los dos flujos, con el dictamen redactado", "Riesgo: valores límite, escenarios, Monte Carlo con correlación y árbol de decisión", "Evaluación social con precios cuenta y un puente exacto del VAN privado al económico", "Informe que se lee solo y paquete .zip que permite rehacer todos los cálculos"],
    destacada: true
  },
  {
    id: "ForestPro", nombre: "ForestPro",
    lema: "Del árbol medido a la tonelada de carbono",
    descripcion: "Inventario forestal y agroforestal, de la hoja de campo al informe: dasometría con ecuaciones de volumen, ahusamiento y altura–diámetro; diseños de muestreo con su error, relascopía, tablas de rodal y distribución de Weibull; biomasa y carbono con 31 ecuaciones alométricas, densidad de la madera e incertidumbre por Monte Carlo; crecimiento, índice de sitio y tabla de producción; diversidad, ordenación y patrón espacial; sombra y diseño de cafetales y sistemas agroforestales; mapas con cuadrícula de muestreo, GPX, KML, GeoJSON y kriging; y las cuentas del aserradero y de la plantación. Validada contra implementaciones independientes.",
    categoria: "agronomia", estado: "enlinea", version: "1.0.0", doi: "10.5281/zenodo.23876374", licencia: "GPL-3.0",
    manualPdf: "ForestPro_Manual_de_usuario_ES.pdf", manualMb: 18, manualHtml: true, datos: true,
    manualEn: { pdf: "ForestPro User's Manual (English).pdf", mb: 18, html: true },
    idiomas: ["es", "en"],
    puntos: ["Volumen, ahusamiento y altura por ajuste no lineal; inventario con su error de muestreo", "Biomasa y carbono con densidad de la madera, Monte Carlo y todos los reservorios", "Crecimiento, índice de sitio, diversidad, ordenación y patrón espacial", "Sombra y diseño agroforestal, mapas con kriging y GPX, informe autocontenido"],
    destacada: false
  },
  {
    id: "PostHarvestPro", nombre: "PostHarvestPro",
    lema: "Del campo al consumidor: calidad, vida de anaquel y sensorial con datos",
    descripcion: "Fisiología y tecnología poscosecha en el navegador: índices de calidad y color CIELAB con ΔE00, cinética de deterioro con Arrhenius, Q10 y vida de anaquel, tiempo hasta el rechazo con censura, respiración, etileno y atmósferas modificadas, preenfriamiento, pérdidas en la cadena de valor con Sankey, daño mecánico, evaluación sensorial discriminativa, afectiva y descriptiva con desempeño del panel, ensayos factoriales y de medidas repetidas, calculadoras de empaque y almacén, e informe autocontenido. Tus datos no salen de tu computadora. Validada contra implementaciones independientes.",
    categoria: "agronomia", estado: "enlinea", version: "1.0.0", doi: "10.5281/zenodo.23935616", licencia: "GPL-3.0",
    manualPdf: "PostHarvestPro_Manual_de_usuario_ES.pdf", manualMb: 17, manualHtml: true, datos: true,
    manualEn: { pdf: "PostHarvestPro User's Manual (English).pdf", mb: 17, html: true },
    idiomas: ["es", "en"],
    puntos: ["Cinética de orden 0, 1 y 2 con AIC, Arrhenius, Q10 y vida de anaquel a cualquier temperatura", "Kaplan–Meier, Weibull y log-normal para el tiempo hasta el rechazo", "Respiración, climaterio, atmósfera modificada y carga de refrigeración", "Sensorial con d′ de Thurstone, penalidades JAR, CATA y desempeño del panel"],
    destacada: false
  },
  {
    id: "BreedingPro", nombre: "BreedingPro",
    lema: "De los progenitores al mejor híbrido",
    descripcion: "Cruzas dialélicas, diseños de apareamiento, medias generacionales, índices de selección, interacción genotipo × ambiente, modelo animal, predicción genómica y de híbridos, para mejoramiento vegetal y animal.",
    categoria: "genetica", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.23005938", licencia: "GPL-3.0",
    manualPdf: "BreedingPro User's Manual.pdf", manualMb: 24, manualHtml: true, datos: true,
    manualEn: { pdf: "BreedingPro User's Manual (English).pdf", mb: 24, html: true },
    puntos: ["Griffing, Hayman–Jinks y Gardner–Eberhart", "Heredabilidad, heterosis e índices de selección", "Interacción G×A: AMMI y estabilidad", "BLUP y predicción genómica"],
    destacada: true
  },
  {
    id: "PopGeneticsPro", nombre: "PopGeneticsPro",
    lema: "Genética de poblaciones de plantas, del campo al artículo",
    descripcion: "Microsatélites, SNP, isoenzimas, bandas AFLP/ISSR/RAPD, secuencias y caracteres morfológicos: diversidad, Hardy–Weinberg, AMOVA y estadísticos F, distancias, agrupamiento bayesiano, redes de haplotipos e historia demográfica.",
    categoria: "genetica", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.22740171", licencia: "GPL-3.0",
    manualPdf: "PopGeneticsPro User's Manual.pdf", manualMb: 30, manualHtml: true, datos: true,
    manualEn: { pdf: "PopGeneticsPro User's Manual (English).pdf", mb: 30, html: true },
    puntos: ["Marcadores codominantes, dominantes y secuencias", "AMOVA jerárquico y estadísticos F", "Agrupamiento bayesiano y redes de haplotipos", "Sistema de apareamiento y QST vs FST"],
    destacada: false
  },
  {
    id: "GermplasmPro", nombre: "GermplasmPro",
    lema: "El banco de germoplasma, accesión por accesión",
    descripcion: "Para el trabajo diario de una colección de recursos fitogenéticos de cualquier especie y forma de conservación —semillas, campo, in vitro, criopreservación e in situ—: pasaporte MCPD v2.1, control de duplicados, mapas de colecta sin internet, diversidad geográfica, vacíos de colecta, colección núcleo, viabilidad, existencias y regeneración, etiquetas con código QR o de barras, e informe con exportación a MCPD y Darwin Core.",
    categoria: "genetica", estado: "enlinea", version: "1.0.0", doi: "", licencia: "GPL-3.0",
    manualPdf: "GermplasmPro User's Manual.pdf", manualMb: 21, manualHtml: true, datos: true,
    manualEn: { pdf: "GermplasmPro User's Manual (English).pdf", mb: 21, html: true },
    puntos: ["Pasaporte MCPD v2.1 con validación y control de duplicados", "Mapas, diversidad geográfica y vacíos de colecta, sin internet", "Colección núcleo validada y viabilidad proyectada lote por lote", "Etiquetas con QR o Code 128 e informe con MCPD y Darwin Core"],
    destacada: false
  },
  {
    id: "CytogeneticsPro", nombre: "CytogeneticsPro",
    lema: "Del conteo cromosómico al cariotipo publicable",
    descripcion: "Citogenética vegetal en el navegador, de la fotomicrografía al informe: medición de cromosomas sobre imágenes calibradas, cariotipo con su fórmula e idiograma a escala, índices de asimetría y categorías de Stebbins, meiosis con las configuraciones esperadas según la ploidía, conteos, citometría de flujo y prueba de Allium, bandeo y FISH, comparación entre taxones con distancias, ACP y evolución del número cromosómico sobre un árbol, docencia con simuladores de mitosis y meiosis, y un informe con métodos redactados y paquete reproducible. Validada contra implementaciones independientes.",
    categoria: "genetica", estado: "enlinea", version: "1.0.0", doi: "10.5281/zenodo.23873606", licencia: "GPL-3.0",
    manualPdf: "CytogeneticsPro_Manual_de_usuario_ES.pdf", manualMb: 22, manualHtml: true, datos: true,
    manualEn: { pdf: "CytogeneticsPro User's Manual (English).pdf", mb: 22, html: true },
    idiomas: ["es", "en"],
    puntos: ["Medición sobre la imagen, cariotipo, fórmula e idiograma a escala", "Asimetría, meiosis con configuraciones esperadas y citometría de flujo", "Bandeo y FISH, distancias, ACP y evolución del número sobre un árbol", "Simuladores de mitosis y meiosis, ejercicios, informe y .zip reproducible"],
    destacada: false
  },
  {
    id: "BioModellingPro", nombre: "BioModelling Pro",
    lema: "De los registros al mapa de idoneidad",
    descripcion: "Descarga registros de presencia de portales abiertos de biodiversidad, depúralos, extrae variables bioclimáticas, de clima y de suelo, explóralas y modela la distribución de la especie con diez algoritmos y un ensamble, con validación, umbrales y proyecciones a escenarios climáticos.",
    categoria: "biogeografia", estado: "enlinea", version: "1.1.1", doi: "10.5281/zenodo.22907825", licencia: "GPL-3.0",
    manualPdf: "BioModelling Pro User's Manual.pdf", manualMb: 13, manualHtml: true, datos: true,
    manualEn: { pdf: "BioModelling Pro User's Manual (English).pdf", mb: 13, html: true },
    puntos: ["Registros de presencia abiertos y su depuración", "Máxima entropía y otros nueve algoritmos, más ensamble", "Validación, umbrales e importancia de variables", "Proyección a escenarios de cambio climático"],
    destacada: true
  },
  {
    id: "PollinationPro", nombre: "PollinationPro",
    lema: "¿Coinciden la flor y su polinizador?",
    descripcion: "Plantas, polinizadores y su solapamiento con datos de presencia, para cualquier cultivo, pariente silvestre o planta nativa: registros de presencia abiertos e interacciones publicadas, depuración y taxonomía, mapas, coocurrencia corregida por esfuerzo de muestreo, fenología con estadística circular, nicho ambiental, desajuste de distribución con clima futuro y redes de visitas.",
    categoria: "biogeografia", estado: "enlinea", version: "1.2.5", doi: "10.5281/zenodo.23004694", licencia: "GPL-3.0",
    manualPdf: "PollinationPro User's Manual.pdf", manualMb: 17, manualHtml: true, datos: true,
    manualEn: { pdf: "PollinationPro User's Manual (English).pdf", mb: 18, html: true },
    puntos: ["Registros de presencia abiertos, interacciones publicadas y tus visitas", "Coocurrencia de Veech con grupo objetivo y fenología circular", "Nicho ambiental y desajuste planta–polinizador con clima futuro", "Red de visitas contra modelos nulos, informe y paquete"],
    destacada: true
  },
  {
    id: "PhylogenyPro", nombre: "PhylogenyPro",
    lema: "Del alineamiento al árbol fechado",
    descripcion: "Filogenia molecular completa: alineamiento, selección del modelo de sustitución, parsimonia, máxima verosimilitud e inferencia bayesiana, soporte de ramas, reloj molecular con fósiles, diversificación, caracteres y áreas ancestrales.",
    categoria: "biogeografia", estado: "enlinea", version: "1.4.0", doi: "10.5281/zenodo.23005815", licencia: "GPL-3.0",
    manualPdf: "PhylogenyPro_Manual_de_usuario_ES.pdf", manualMb: 4, manualHtml: true, datos: true,
    manualEn: { pdf: "PhylogenyPro User's Manual (English).pdf", mb: 4, html: true },
    puntos: ["ADN, aminoácidos, codones y morfología", "Parsimonia, máxima verosimilitud y MCMC bayesiano", "Reloj molecular y calibración con fósiles", "Reconstrucción de caracteres y áreas ancestrales"],
    destacada: false
  },
  {
    id: "CladisticsPro", nombre: "CladisticsPro",
    lema: "Caracteres, homología y árboles",
    descripcion: "Cladística con caracteres morfológicos, de la matriz al cladograma diagnosticado: matriz con enunciados y estados, polimorfismos, inaplicables, continuos e imágenes de cada taxón; los árboles más parsimoniosos por búsqueda exacta, TBR y ratchet; pesos implícitos y sucesivos; cada cambio dibujado sobre su rama y el cladograma editable con el ratón; apoyo de Bremer y remuestreos; consensos, taxones comodín y pruebas de hipótesis.",
    categoria: "biogeografia", estado: "enlinea", version: "1.0.1", doi: "10.5281/zenodo.23147012", licencia: "GPL-3.0",
    manualPdf: "CladisticsPro User's Manual.pdf", manualMb: 13, manualHtml: true, datos: true,
    manualEn: { pdf: "CladisticsPro User's Manual (English).pdf", mb: 13, html: true },
    puntos: ["Matriz morfológica con inaplicables, continuos e imágenes", "Búsqueda exacta, TBR, ratchet y pesos implícitos", "Cada cambio sobre su rama, editable con el ratón", "Bremer, remuestreos, consensos y pruebas de hipótesis"],
    destacada: false
  },
  {
    id: "PalynoPro", nombre: "PalynoPro",
    lema: "De la micrografía electrónica a la clave polínica",
    descripcion: "Morfometría polínica cuantitativa en micrografías electrónicas de barrido, de la carpeta de imágenes al informe: cada imagen calibrada por la magnificación y comprobada contra su barra de escala; el contorno leído en 720 direcciones, el cuerpo medido sin las espinas, los anchos de Feret, el alargamiento y la circularidad; espinas contadas y medidas, lúmenes del retículo y textura de la superficie; granos turgentes y colapsados en las panorámicas con intervalos de Wilson; análisis de varianza con letras de Tukey, Kruskal–Wallis, componentes principales, PERMANOVA, discriminante y bosque aleatorio, siempre con el grano como unidad; y un informe con los métodos y sus fuentes. Las imágenes no salen de tu computadora. Validada contra implementaciones independientes.",
    categoria: "biogeografia", estado: "enlinea", version: "1.0.0", doi: "10.5281/zenodo.23883213", licencia: "GPL-3.0",
    manualPdf: "PalynoPro_Manual_de_usuario_ES.pdf", manualMb: 16, manualHtml: true, datos: true,
    manualEn: { pdf: "PalynoPro User's Manual (English).pdf", mb: 16, html: true },
    idiomas: ["es", "en"],
    puntos: ["Calibración por la magnificación, comprobada contra la barra de escala", "Cuerpo sin espinas, anchos de Feret, espinas, lúmenes del retículo y textura", "Fertilidad en las panorámicas por la solidez del cuerpo, con intervalos de Wilson", "ANOVA, PERMANOVA, discriminante y bosque aleatorio con el grano como unidad"],
    destacada: false
  },
  {
    id: "FloralPro", nombre: "FloralPro",
    lema: "La flor, verticilo por verticilo",
    descripcion: "Para enseñar y aprender la estructura de la flor: fórmulas y diagramas florales, la flor en 3D y en corte, un atlas de verticilos, 82 familias de angiospermas con énfasis en México, clave interactiva, autoevaluación y modo clase.",
    categoria: "botanica", estado: "enlinea", version: "1.0.0", doi: "", licencia: "GPL-3.0",
    manualPdf: "", manualMb: 0, manualHtml: false, datos: false,
    puntos: ["Fórmulas y diagramas florales", "82 familias de angiospermas", "Clave interactiva y autoevaluación", "Modo clase para proyectar e imprimir"],
    destacada: false
  },
  {
    id: "LeafPro", nombre: "LeafPro",
    lema: "La hoja, carácter por carácter",
    descripcion: "Morfología de la hoja para el aula: partes, haz y envés con un corte anatómico interactivo, filotaxia con simulador del ángulo de oro, un atlas de más de 140 términos ilustrados y un constructor de hojas con descripción botánica.",
    categoria: "botanica", estado: "enlinea", version: "1.2.0", doi: "", licencia: "GPL-3.0",
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
    manualEn: { pdf: "SciMetricsPro User's Manual (English).pdf", mb: 26, html: true },
    puntos: ["Lee exportaciones de las principales bases", "Redes de coautoría, cocitación y temas", "Diagrama PRISMA 2020", "Texto metodológico redactado con tus datos"],
    destacada: true
  },
  {
    id: "ReviewPro", nombre: "ReviewPro",
    lema: "Del montón de artículos a una revisión que se sostiene",
    descripcion: "Un artículo de revisión de principio a fin, narrativo, exploratorio, sistemático o con meta-análisis: protocolo y registro, cadenas de búsqueda, importación y duplicados, cribado priorizado con acuerdo entre revisores, texto completo y diagrama PRISMA, extracción con calculadora de tamaños del efecto, calidad y riesgo de sesgo con GRADE, meta-análisis multinivel y escritura orientada que liga cada afirmación con su evidencia.",
    categoria: "ciencia", estado: "enlinea", version: "1.0.0", doi: "", licencia: "GPL-3.0",
    manualPdf: "ReviewPro User's Manual.pdf", manualMb: 13, manualHtml: true, datos: true,
    manualEn: { pdf: "ReviewPro User's Manual (English).pdf", mb: 13, html: true },
    puntos: ["Protocolo con PRISMA-P y plantillas de registro PROSPERO y OSF", "Cribado priorizado, regla de paro y acuerdo entre revisores", "Riesgo de sesgo, GRADE y meta-análisis multinivel de tres niveles", "Escritura orientada con verificador de afirmaciones, informe y paquete"],
    destacada: false
  }
];
