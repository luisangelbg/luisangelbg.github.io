# LABG · Identidad visual (negro y esmeralda)

Eslogan: **Del dato a la decisión.**

## Archivos

| Archivo | Uso |
|---|---|
| `svg/labg-logo-animado.svg` | Logo principal animado para el héroe del portal (fondo oscuro) |
| `svg/labg-logo.svg` | Misma versión, estática (usuarios con "reducir movimiento", documentos) |
| `svg/labg-isotipo-animado.svg` / `svg/labg-isotipo.svg` | Ícono (la A-biplot) para cada app, encabezados y tarjetas |
| `png/labg-logo-1920x800.png` / `-3840x1600.png` | Logo en PNG transparente (presentaciones, carteles) |
| `png/labg-logo-1920x800-fondo-negro.png` | Logo con fondo negro |
| `png/labg-isotipo-1024/512/192.png` | Ícono para apps, PWA y redes |
| `png/apple-touch-icon.png` | Ícono para iPhone/iPad (180×180) |
| `favicon.ico`, `png/favicon-16/32/48.png` | Favicon del navegador |
| `png/labg-redes-1200x630.png` | Imagen de vista previa al compartir el enlace (Open Graph) |

Las letras están convertidas a trazos: el logo se ve igual en cualquier navegador, sin depender de fuentes.

## Cómo insertarlo en el portal

Copia la carpeta a `assets/marca/` de tu repositorio `luisangelbg.github.io` y usa:

```html
<!-- En <head> -->
<link rel="icon" href="/assets/marca/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/assets/marca/svg/labg-isotipo.svg">
<link rel="apple-touch-icon" href="/assets/marca/png/apple-touch-icon.png">
<meta name="theme-color" content="#08090B">
<meta property="og:image" content="https://luisangelbg.github.io/assets/marca/png/labg-redes-1200x630.png">

<!-- Logo animado, con versión estática si el usuario pidió reducir movimiento -->
<picture>
  <source srcset="/assets/marca/svg/labg-logo.svg" media="(prefers-reduced-motion: reduce)">
  <img src="/assets/marca/svg/labg-logo-animado.svg" alt="LABG — Suite científica" width="960" height="400">
</picture>
```

## Paleta

| Token | Hex | Uso |
|---|---|---|
| Negro base | `#08090B` | Fondo |
| Verde profundo | `#0B2A1D` | Resplandores, tarjetas |
| Esmeralda | `#3ED68B` | Color principal, botones |
| Esmeralda claro | `#7BEDB5` | Texto de acento, enlaces |
| Menta brillante | `#A2F6CC` | Reflejos |
| Verde oscuro | `#0C6A44` | Sombras del metal |
| Verde grisáceo | `#5E9C80` | Texto secundario |
| Blanco | `#FFFFFF` | Titulares |

Tipografías: **Fraunces** (titulares, serif) y **Manrope** (texto, sans), ambas en Google Fonts.
