/* LABG — arranque del héroe 3D.
   El texto y los botones ya están pintados en HTML; la escena entra detrás.
   Sin WebGL, en equipos modestos o con «reducir movimiento» no se carga nada:
   se queda el logotipo en SVG (animado o estático). Si algo falla al cargar,
   también vuelve al SVG. */
const root = document.documentElement;
const mode = root.dataset.hero;

/* WebGL con tarjeta gráfica: sin él, o si se dibuja por software, se queda el SVG animado */
function webglOk() {
  try {
    const c = document.createElement('canvas'), x = c.getContext('webgl2') || c.getContext('webgl');
    if (!x) return false;
    const info = x.getExtension('WEBGL_debug_renderer_info');
    const soft = info && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(x.getParameter(info.UNMASKED_RENDERER_WEBGL) || '');
    const lose = x.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    return !soft;
  } catch (e) { return false; }
}

const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200));

function go() {
  if (!webglOk()) { root.dataset.hero = 'svg-anim'; return; }
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
