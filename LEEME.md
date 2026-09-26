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

## Mantenerlo — todo se edita en `data/`

| Quiero… | Archivo |
|---|---|
| Agregar o editar una app | `data/apps.js` (copia un bloque). Captura de 1200×750 en `assets/apps/<id>.webp` |
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
