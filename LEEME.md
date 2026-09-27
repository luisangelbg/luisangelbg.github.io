# LABG Suite — portal web

Sitio estático (HTML + CSS + JavaScript, sin compilación) para GitHub Pages. Gratis.
Queda en **https://luisangelbg.github.io/** y cada app sigue en su dirección actual
(`https://luisangelbg.github.io/PCAPro/`, etc.).

## Publicarlo (una sola vez)

1. En GitHub: **New repository** → nombre exacto **`luisangelbg.github.io`** → Public → Create.
2. Sube el contenido de esta carpeta (no la carpeta en sí) con *Add file → Upload files*
   o con git:
   ```
   git init && git add . && git commit -m "Portal LABG"
   git branch -M main
   git remote add origin https://github.com/luisangelbg/luisangelbg.github.io.git
   git push -u origin main
   ```
3. *Settings → Pages → Source: Deploy from a branch → main / (root)*. En 1–2 minutos está en línea.

## Cómo está armado

- Páginas escritas a mano: `index.html`, `aplicaciones.html`, `descargas.html`, `publicaciones.html`, `blog.html`, `acerca.html`.
- Páginas **generadas** (no las edites, se regeneran solas): `apps/<id>/`, `blog/<slug>/`, `sitemap.xml`, `robots.txt`.
- `scripts/build.mjs` las genera a partir de `data/`. En GitHub se ejecuta sola al cambiar `data/` o `blog/entradas/`
  (workflow *Compilar portal*). En tu computadora: `node scripts/build.mjs`.
- `scripts/sync-apps.mjs` revisa cada noche tus repositorios (workflow *Sincronizar apps y revisar enlaces*):
  si una app ya está en GitHub Pages la marca "En línea", y actualiza versión, DOI y manual desde su `CITATION.cff`.
  Si no quieres que toque un campo, añade `// fijo` al final de esa línea en `data/apps.js`.
- `scripts/check-links.mjs` comprueba que apps, manuales y DOI respondan; si algo se rompe el workflow falla y GitHub te avisa por correo.
- Buscador: **Ctrl+K** (o la lupa) busca en apps, publicaciones y blog. `aplicaciones.html?q=texto` abre el catálogo ya filtrado.

## Mantenerlo — todo se edita en `data/`

| Quiero… | Archivo |
|---|---|
| Agregar o editar una app | `data/apps.js` (copia un bloque). Captura de 1200×750 en `assets/apps/<id>.webp` y, si quieres, imagen para redes de 1200×630 en `assets/og/<id>.jpg` |
| Publicar una app "Próximamente" | En `data/apps.js` cambia `estado: "proximamente"` → `"enlinea"` (después de subir su repositorio y activar Pages en él) |
| Escribir en el blog | Crea `blog/entradas/<slug>.md` (Markdown) y agrega su bloque en `data/blog.js` |
| Agregar una publicación | `data/publicaciones.js` |
| Cambiar nombre, ORCID, correo, formulario | `data/config.js` |

El software con DOI aparece solo en *Publicaciones* (se toma de `apps.js`).

## Formulario de contacto (opcional, gratis)

Crea un formulario en https://formspree.io (50 mensajes/mes gratis) y pega su dirección en
`formspree` dentro de `data/config.js`.

## Verlo en tu computadora antes de subir

El blog lee archivos `.md`, así que abre el sitio con un servidor local, por ejemplo:
`python -m http.server 8000` dentro de esta carpeta y visita `http://localhost:8000`.
