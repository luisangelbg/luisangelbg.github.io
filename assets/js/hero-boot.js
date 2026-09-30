/* LABG — arranque del héroe 3D.
   El texto y los botones ya están pintados en HTML; la escena entra detrás.
   Sin WebGL, en equipos modestos o con «reducir movimiento» no se carga nada:
   se queda el logotipo en SVG (animado o estático). Si algo falla al cargar,
   también vuelve al SVG. */
const root = document.documentElement;
const mode = root.dataset.hero;

const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200));

function go() {
  import('./hero-scene.js')
    .then((m) => m.start({ mode }))
    .catch((err) => {
      console.warn('LABG: la escena 3D no pudo iniciar; se muestra el logotipo en SVG.', err);
      root.dataset.hero = 'svg-anim';
      const skip = document.getElementById('skipIntro');
      if (skip) skip.hidden = true;
    });
}

if (mode === 'intro' || mode === 'composed') {
  /* después de la carga, en un momento libre: el primer pintado no espera a la escena */
  if (document.readyState === 'complete') idle(go);
  else addEventListener('load', () => idle(go), { once: true });
}
