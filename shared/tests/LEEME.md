# Pruebas de los módulos compartidos

Estas pruebas de Playwright revisan el **Navegador LABG** y el **Estudio de figuras LABG** en las 15 apps de la suite, en tres tamaños de pantalla:

- 1440 × 900;
- 1280 × 720;
- 390 × 844 (teléfono).

Usan el Edge que ya está instalado, así que no descargan navegadores.

## Qué revisan

- Que el navegador se arme sin errores y sin desplazamiento horizontal:
  - barra lateral en escritorio y pestañas abajo en el teléfono;
  - la barra original de la app, oculta.
- La paleta Ctrl+K: abre, se recorre con las flechas y cierra con Esc.
- Los modos Documento y Enfocado, y que `[` contraiga la barra lateral.
- Los enlaces directos `#bN` y el botón Atrás.
- El estudio de figuras:
  - abre sobre el escenario;
  - un cambio de paleta se deshace con Ctrl+Z;
  - cierra con Esc.
- Solo con teclado: Tab llega a la barra lateral y Ctrl+K + Enter cambia de bloque.
- La exportación desde el estudio: PNG con su resolución, SVG en mm, PDF completo y TIFF válido.

## Cómo correrlas

Hace falta Node.js 18 o más reciente.

```bash
cd "Documents/LABG Apps/luisangelbg.github.io/shared/tests"
npm i -D @playwright/test
npx playwright test
```

`servidor.mjs` sirve la carpeta «LABG Apps» en `http://127.0.0.1:8765`. Las capturas y el informe quedan en `test-results/` e `informe/`.

## Lo que ya se corrió

Las mismas comprobaciones se corrieron el 1 de octubre de 2026 con Edge sin ventana (por CDP), en las 15 apps y en los tres tamaños. Las 15 cargaron sin errores y sin desplazamiento horizontal.

Además se exportaron y validaron byte a byte cinco archivos del estudio:

- PNG a 600 ppp;
- SVG de 85 mm;
- PDF con transparencia;
- TIFF RGB a 300 ppp;
- TIFF RGBA a 1200 ppp.
