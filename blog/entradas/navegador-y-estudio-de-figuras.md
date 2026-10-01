Las aplicaciones de la suite estrenan dos piezas comunes. Una cambia la manera de moverse dentro de cada app; la otra, la de preparar las figuras para publicarlas. Las dos funcionan sin conexión, en el navegador y sin instalar nada, igual que el resto de la suite.

## El navegador: bloques, secciones y una búsqueda

Los bloques de cada app ahora viven en una **barra lateral a la izquierda**. Ahí se ve de un vistazo:

- en qué bloque estás (en oro);
- cuáles terminaste (con una palomita);
- cuáles esperan un paso anterior (con un candado).

Con la tecla `[` la barra se reduce a sus números para dejar más espacio. En el teléfono se convierte en una fila de pestañas abajo.

Dentro de cada bloque hay dos maneras de leer:

- **Documento.** Todas las secciones, una tras otra. A la derecha, un índice sigue tu lectura y una barra fina marca cuánto llevas.
- **Enfocado.** Una sección a la vez, con *Anterior* y *Siguiente*, o con Alt + ← y Alt + →. Es útil en clase o cuando un bloque tiene muchas partes.

Y una búsqueda que lo encuentra todo. Con **Ctrl + K** puedes escribir el nombre de un bloque, de una sección, de un control («nivel de confianza», «paleta») o de una acción («tema oscuro», «copiar el enlace»), y llegar ahí con Enter. No importan los acentos ni los errores de dedo.

Además:

- **Enlaces a una sección.** La dirección del navegador cambia al moverte (`#b3/varianza-explicada`), así que puedes mandar un enlace a una parte exacta de una app. Atrás y Adelante funcionan como en cualquier página.
- **Ir al paso pendiente.** Cuando un bloque necesita algo de un paso anterior (cargar datos, correr un análisis), un botón te lleva directo a ese paso.
- **Volver a lo último que editaste**, contraer secciones que no necesitas y, con `?`, una ayuda que te dice dónde estás.

## El estudio de figuras: edita a pantalla dividida

Cada figura tiene ahora un pequeño botón con un lápiz y una regla. Al pulsarlo, la figura se abre en una **pantalla dividida**:

- a la izquierda, la figura siempre a la vista, sobre un «papel» del tamaño en que la vas a publicar;
- a la derecha, todas sus opciones, ordenadas y con un buscador.

Lo que cambias se ve al instante.

En el estudio puedes:

- **Ajustar la figura** con las opciones propias de cada app, ahora juntas y a la vista mientras editas.
- **Probar paletas científicas** y ver cómo la verá una persona con daltonismo. La simulación solo cambia la vista; no se exporta.
- **Preparar la figura para la revista.** El estudio te dice cuánto mide el texto más chico *al tamaño de salida* y te avisa si queda por debajo de 6 puntos, lo que piden muchas revistas. Un preajuste lo corrige de un clic.
- **Comparar antes y ahora** con una cortina que se desliza sobre la figura.
- **Deshacer** cualquier paso (Ctrl + Z) y volver a cualquier punto del historial.
- **Exportar** en PNG, SVG, PDF o TIFF, en milímetros o pulgadas, a 300, 600 o 1200 ppp y con fondo transparente si lo necesitas.

Los preajustes de un clic cubren los casos más comunes:

- artículo a una, una y media o dos columnas;
- dibujo de líneas;
- presentación;
- póster;
- web;
- impresión en gris.

También puedes guardar los tuyos y compartirlos en un archivo.

## Para quien programa

Las dos piezas son **módulos compartidos y versionados** (1.0.0) que cualquier app de la suite carga con una línea. Su código, las guías de integración, las pruebas y el mapa de cómo están hechas las apps están en la carpeta [`shared/`](https://github.com/luisangelbg/luisangelbg.github.io/tree/main/shared) del repositorio del sitio. Los íconos son de línea fina y tienen licencia libre compatible con la GPL-3.0. Su licencia va declarada en `LICENSES-TERCEROS.md`.
