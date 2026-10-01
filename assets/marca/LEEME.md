# LABG · Identidad visual (oro y negro)

Eslogan: **Del dato a la decisión.**

El logo es un hexágono con banda de oro y fondo negro; dentro, un cubo isométrico de datos formado por las
letras **A** y **B** (la cara superior son filas de datos, la izquierda la A con sus barras y la derecha la B),
y debajo **LABG**. Esta versión en vector se reconstruyó con geometría exacta a partir del logo original:
las aristas del cubo siguen los ángulos isométricos (30°, 90° y 150°) y las letras se redibujaron con sus
medidas (fustes de 11 y trazos horizontales de 9.5 en un logo de 946 de alto).

## Archivos

| Archivo | Uso |
|---|---|
| `svg/labg-logo.svg` | Logo completo (hexágono, cubo y letras), fondo transparente |
| `svg/labg-isotipo.svg` | Ícono sin letras, con el cubo centrado y algo más grande: barras de las apps, favicon, tarjetas |
| `svg/labg-logo-una-tinta.svg` | Logo a una tinta (`currentColor`), interior transparente: sellos, grabado, documentos |
| `svg/labg-viento.svg` | Logo envuelto en corrientes de viento en espiral, animado (héroe del portal) |
| `svg/labg-viento-estatico.svg` | La misma composición sin movimiento (usuarios con «reducir movimiento», documentos) |
| `png/labg-logo-1024.png` | Logo en PNG transparente, 1024 de alto |
| `png/labg-isotipo-1024/512/192.png` | Ícono en PNG transparente (apps, PWA, redes) |
| `png/apple-touch-icon.png` | Ícono para iPhone/iPad (180 × 180, fondo negro) |
| `favicon.ico`, `png/favicon-16/32/48.png` | Favicon del navegador |
| `png/labg-redes-1200x630.png` | Imagen de vista previa al compartir el enlace (Open Graph) |
| `geometria.json` | Vértices del hexágono, trazos del cubo y de las letras y degradado (para la escena 3D y los íconos en línea) |

Las letras están convertidas a trazos: el logo se ve igual en cualquier navegador, sin depender de fuentes.

## El viento

Las corrientes son anillos inclinados que giran en el mismo sentido y se abren en espiral alrededor del
hexágono. Pasan por detrás del logo y, al llegar a su borde, desaparecen: **lo envuelven sin taparlo**.
La mitad cercana (delante) es más gruesa y brillante; la lejana (detrás), más tenue. Por ellas viajan
ráfagas y motas de polvo de oro. En el portal, con tarjeta gráfica, la misma idea vive en 3D
(`assets/js/hero-scene.js`): el logo es un medallón con canto dorado y el viento se calcula en la GPU.

## Cómo insertarlo

```html
<!-- En <head> -->
<link rel="icon" href="assets/marca/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="assets/marca/svg/labg-isotipo.svg">
<link rel="apple-touch-icon" href="assets/marca/png/apple-touch-icon.png">
<meta property="og:image" content="https://luisangelbg.github.io/assets/marca/png/labg-redes-1200x630.png">

<!-- Logo con su viento, con versión estática si el usuario pidió reducir movimiento -->
<picture>
  <source srcset="assets/marca/svg/labg-viento-estatico.svg" media="(prefers-reduced-motion: reduce)">
  <img src="assets/marca/svg/labg-viento.svg" alt="LABG" width="1600" height="1000">
</picture>
```

En las apps, el ícono del enlace «LABG Suite» y el final de las esperas salen de `LABG.isotipo()`
(`labg-core.js`), que dibuja el isotipo en vector con un brillo que cruza el cubo.

## Paleta

| Token | Hex | Uso |
|---|---|---|
| Oro | `#D4A848` | Color de la marca: botones, indicadores, acentos |
| Oro claro | `#E6C470` | Reflejos, oro sobre fondo oscuro |
| Champaña | `#F1DDA8` | Resplandores, fondos suaves |
| Oro oscuro (texto) | `#7D5B14` | Enlaces y texto de acento sobre blanco (6:1) |
| Bronce | `#9C7128` | Sombras del oro, viento |
| Negro | `#000000` / `#111111` | Fondo del hexágono / titulares |
| Gris cálido | `#5B5750` | Texto secundario sobre blanco (6.9:1) |
| Blanco | `#FFFFFF` | Fondo |

Degradado del oro del logo (de izquierda a derecha): `#BF8B3C` → `#C99C49` → `#D9B05C` → `#E6C470` → `#F6D985`.

Tipografías del portal: **Fraunces** (titulares, serif) y **Manrope** (texto, sans), ambas en Google Fonts.
