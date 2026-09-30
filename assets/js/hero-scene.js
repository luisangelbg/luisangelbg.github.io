/* LABG — escena 3D de la portada: el logotipo en tres dimensiones y, con el scroll, la historia
   «del dato a la decisión» en el mismo lienzo (un solo contexto WebGL, fijo detrás de la página).

   Logotipo (assets/marca/svg/labg-logo.svg): la «A» es un biplot — un origen del que salen dos vectores con
   punta de flecha y una barra de cinco puntos —; L, B y G son las letras del propio SVG extruidas; detrás, una
   campana de Gauss con μ y ±σ; debajo, un piso de cuadrícula; alrededor, esferas de datos.

   Intro (segundos) — tiempos en T:
     0–0.6 origen · 0.6–1.6 vectores · 1.6–2.4 letras · 2.4–3.2 campana y puntos · 3.2– piso y esferas

   Historia (s, lo publica chapters.js en window.LABG_STORY):
     0 → 1  el logotipo sube con la página         1 → 2  Datos: cada fila de la tabla se vuelve esferas (la nube)
     2 → 3  Análisis: la nube se ordena en el biplot de componentes principales, con sus ejes y vectores
     3 → 4  Modelos: las esferas caen sobre un terreno que se colorea como mapa de idoneidad
     4 → 5  Decisión: la cámara sube a una vista cenital encuadrada en el marco de la figura
   Los datos son los de assets/js/datos-ejemplo.js: el biplot es el ACP real de esa tabla. */

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const T = {
  origin: [0.0, 0.6], vectors: [0.6, 1.6], letters: [1.6, 2.4], gauss: [2.4, 3.2],
  floor: [3.2, 4.3], spheres: [3.2, 4.6], end: 4.6,
};
const SPHERES = { desktop: 70, mobile: 38, lite: 24 };
const COLORS = {
  white: 0xffffff, black: 0x08090b, deep: 0x0b2a1d, emerald: 0x3ed68b, light: 0x7bedb5, mint: 0xa2f6cc, dark: 0x0c6a44,
  gA: 0x3ed68b, gB: 0x0c6a44, gC: 0x7c9a8c, occ: 0x10241a, axis: 0x4a6157,
};

/* coordenadas: unidades del SVG (960 × 400) → mundo. Centro de las letras en x ≈ 515 */
const S = 1 / 100, CX = 515, CY = 170;
const wx = (x) => (x - CX) * S;
const wy = (y) => -(y - CY) * S;
const FLOOR_Y = wy(262);
/* terreno del capítulo Modelos: 12 × 8 unidades (proporción 3:2, la del marco de la figura) */
const TERR = { w: 12, d: 8, y: -1.35 };

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const span = (t, [a, b]) => clamp01((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeIn = (x) => x * x * x;
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeBack = (x) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bounce = (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
const frame = () => new Promise((r) => requestAnimationFrame(() => r()));

export async function start({ mode }) {
  const root = document.documentElement;
  const canvas = document.getElementById('heroCanvas');
  const svgPic = document.querySelector('.hero-svg');
  const skipBtn = document.getElementById('skipIntro');
  const story = window.LABG_STORY || (window.LABG_STORY = { s: 0, fade: 0, rows: [], plot: null });
  const narrow = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const tier = narrow ? 'mobile' : 'desktop';

  /* ---------- renderizador ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !narrow, powerPreference: 'high-performance' });
  let pixelRatio = Math.min(devicePixelRatio || 1, narrow ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(COLORS.white, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.white, 0.055);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 160);

  /* reflejos del metal: el degradado del propio logotipo como cielo alrededor de la escena */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = bandTexture();
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  envTex.dispose(); pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xeafff4, 0.7));
  const key = new THREE.DirectionalLight(0xdfffee, 1.6); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(COLORS.emerald, 1.2); rim.position.set(4, 2, -5); scene.add(rim);
  await frame();

  /* todo lo del logotipo vive en un grupo que sube con la página al empezar el scroll */
  const logo = new THREE.Group();
  scene.add(logo);

  /* ---------- materiales ---------- */
  const metal = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.24, envMapIntensity: 0.75, emissive: 0x000000, emissiveIntensity: 1 });
  metal.userData.lift = { value: 0 };                   // el degradado viaja con las letras cuando el logotipo sube
  logoGradient(metal);
  const glow = (color, intensity) => new THREE.MeshStandardMaterial({ color: COLORS.mint, emissive: color, emissiveIntensity: intensity, roughness: 0.3, metalness: 0.2 });

  const haloTex = radialTexture('rgba(210,247,228,1)', 'rgba(255,255,255,0)');
  const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, opacity: 0.7, depthWrite: false, fog: false }));
  backGlow.position.set(0, 0.6, -3.5);
  logo.add(backGlow);

  /* ---------- letras L, B y G: los trazos del propio logotipo, extruidos ---------- */
  const svgText = await fetch('assets/marca/svg/labg-logo.svg').then((r) => { if (!r.ok) throw new Error('logo ' + r.status); return r.text(); });
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const letterPaths = [...doc.querySelectorAll('path[fill="url(#lgg)"]')].map((p) => p.getAttribute('d'));
  if (letterPaths.length !== 3) throw new Error('el logotipo no trae las tres letras esperadas');
  const loader = new SVGLoader();
  const letters = [];
  for (const d of letterPaths) {
    const data = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}" fill="#000" fill-rule="evenodd"/></svg>`);
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p)).map(cleanShape);
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 26, bevelEnabled: true, bevelThickness: 3.2, bevelSize: 1.6, bevelSegments: 3, curveSegments: 1 });
    geo.scale(S, -S, S);                       // el eje y del SVG apunta hacia abajo
    flipWinding(geo);
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const baseX = (bb.min.x + bb.max.x) / 2, baseY = bb.min.y;   // pivote en la base para «levantarla»
    geo.translate(-baseX, -baseY, -0.15);
    const m = new THREE.Mesh(geo, metal);
    m.position.set(baseX - CX * S, baseY + CY * S, 0);
    logo.add(m);
    letters.push(m);
    await frame();
  }
  letters.sort((a, b) => a.position.x - b.position.x);   // L, B, G

  /* ---------- la A: origen, dos vectores con punta de flecha y la barra de cinco puntos ---------- */
  const R = 0.107;
  const O = new THREE.Vector3(wx(400), wy(92), 0);
  const armEnds = [new THREE.Vector3(wx(334), wy(242), 0), new THREE.Vector3(wx(466), wy(242), 0)];
  const heads = [
    [[334, 242, 331.8, 216.6], [334, 242, 354.2, 226.4]],
    [[466, 242, 445.8, 226.4], [466, 242, 468.2, 216.6]],
  ];
  const cylGeo = new THREE.CylinderGeometry(R, R, 1, 20, 1, false);
  cylGeo.translate(0, 0.5, 0);                // de 0 a 1 en y: se estira desde su inicio
  const capGeo = new THREE.SphereGeometry(R, 20, 14);
  const arms = armEnds.map((end) => rod(O, end));
  const headRods = heads.map((pair) => pair.map(([x1, y1, x2, y2]) => rod(new THREE.Vector3(wx(x1), wy(y1), 0), new THREE.Vector3(wx(x2), wy(y2), 0))));
  const joints = armEnds.map((e) => { const c = new THREE.Mesh(capGeo, metal); c.position.copy(e); logo.add(c); return c; });
  const origin = new THREE.Mesh(new THREE.SphereGeometry(0.167, 40, 28), glow(COLORS.emerald, 1.4));
  origin.position.copy(O);
  logo.add(origin);
  const originHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(62,214,139,0.45)', 'rgba(62,214,139,0)'), transparent: true, depthWrite: false, fog: false }));
  originHalo.position.copy(O).add(new THREE.Vector3(0, 0, 0.05));
  logo.add(originHalo);
  const dotMats = [], glowSprites = [originHalo];
  const dotGlowTex = radialTexture('rgba(62,214,139,0.7)', 'rgba(62,214,139,0)');
  const dots = [359.1, 379.5, 400.0, 420.5, 440.9].map((x) => {
    const mat = glow(COLORS.emerald, 0.35); dotMats.push(mat);
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.088, 28, 20), mat);
    d.position.set(wx(x), wy(188), 0.02);
    logo.add(d);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotGlowTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    gl.position.copy(d.position).add(new THREE.Vector3(0, 0, 0.05)); gl.scale.setScalar(0.42);
    logo.add(gl); glowSprites.push(gl); d.userData.glow = gl;
    return d;
  });
  await frame();

  /* ---------- campana de Gauss, μ y ±σ ---------- */
  const gaussD = doc.querySelector('path[stroke="#7BEDB5"]') ? doc.querySelector('path[stroke="#7BEDB5"]').getAttribute('d') : doc.querySelector('path').getAttribute('d');
  const gpts = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${gaussD}" fill="none" stroke="#000"/></svg>`).paths[0].subPaths[0].getPoints(160);
  const gcurve = new THREE.CatmullRomCurve3(gpts.map((p) => new THREE.Vector3(wx(p.x), wy(p.y), -0.45)));
  const gaussGeo = new THREE.TubeGeometry(gcurve, 320, 0.011, 6, false);
  const gauss = new THREE.Mesh(gaussGeo, new THREE.MeshBasicMaterial({ color: COLORS.dark, transparent: true, opacity: 0.95, fog: false }));
  const gaussHaloGeo = new THREE.TubeGeometry(gcurve, 320, 0.05, 6, false);
  const gaussHalo = new THREE.Mesh(gaussHaloGeo, new THREE.MeshBasicMaterial({ color: COLORS.emerald, transparent: true, opacity: 0.18, depthWrite: false, fog: false }));
  gaussHaloGeo.setDrawRange(0, 0); logo.add(gaussHalo); glowSprites.push(gaussHalo);
  const gaussCount = gaussGeo.index.count;
  gaussGeo.setDrawRange(0, 0);
  logo.add(gauss);
  await document.fonts.load('italic 72px Fraunces').catch(() => {});
  const labels = [[160, '−2σ'], [280, '−σ'], [400, 'μ'], [520, '+σ'], [640, '+2σ']].map(([x, txt]) => {
    const sp = textSprite(txt, { h: 0.25 });
    sp.position.set(wx(x), wy(282), -0.45);
    logo.add(sp);
    return sp;
  });
  const dashMat = new THREE.LineDashedMaterial({ color: COLORS.dark, dashSize: 0.03, gapSize: 0.05, transparent: true, opacity: 0, fog: false });
  const dashTops = { 160: 223.9, 280: 140, 520: 140, 640: 223.9 };
  Object.entries(dashTops).forEach(([x, top]) => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(wx(+x), wy(top), -0.46), new THREE.Vector3(wx(+x), wy(250), -0.46)]);
    const l = new THREE.Line(g, dashMat); l.computeLineDistances(); logo.add(l);
  });
  await frame();

  /* ---------- piso de cuadrícula en perspectiva y la línea de luz que lo barre ---------- */
  const floor = new THREE.Group();
  floor.position.set(0, FLOOR_Y, 1.6);
  const gridPts = [];
  for (let x = -30; x <= 30; x += 0.6) gridPts.push(x, 0, 0, x, 0, -46);
  for (let z = 0; z >= -46; z -= 0.6) gridPts.push(-30, 0, z, 30, 0, z);
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
  const gridMat = new THREE.LineBasicMaterial({ color: 0x0c6a44, transparent: true, opacity: 0.2 });
  floor.add(new THREE.LineSegments(gridGeo, gridMat));
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.02), new THREE.MeshBasicMaterial({ color: COLORS.emerald, transparent: true, opacity: 0.9 }));
  edge.rotation.x = -Math.PI / 2; edge.position.set(0, 0.001, -1.6); floor.add(edge);
  const sweep = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.08), new THREE.MeshBasicMaterial({ color: COLORS.emerald, transparent: true, opacity: 0, depthWrite: false }));
  sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.004; floor.add(sweep);
  const shadowTex = radialTexture('rgba(13,31,23,0.35)', 'rgba(13,31,23,0)');
  [[248, 70], [400, 80], [568, 72], [712, 72]].forEach(([x, rx]) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2 * S, 0.3), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    s.rotation.x = -Math.PI / 2; s.position.set(wx(x), 0.003, -1.6); floor.add(s);
  });
  floor.scale.z = 0.0001;
  logo.add(floor);

  /* ---------- esferas: en la entrada flotan; después son las parcelas de los datos de ejemplo ---------- */
  const E = window.LABG_EJEMPLO;
  const N = Math.min(E ? E.n : 70, SPHERES[root.dataset.lite === '1' ? 'lite' : tier]);
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.55, roughness: 0.22, envMapIntensity: 1.2, emissive: COLORS.dark, emissiveIntensity: 0.2 });
  const spheres = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), sphereMat, N);
  spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  spheres.frustumCulled = false;
  const rnd = mulberry(20260929);
  const baseCol = new THREE.Color(COLORS.emerald), hotCol = new THREE.Color(0xe9fff4), tmpCol = new THREE.Color();
  const groupCols = [new THREE.Color(COLORS.gA), new THREE.Color(COLORS.gB), new THREE.Color(COLORS.gC)];
  const occCol = new THREE.Color(COLORS.occ);
  const P = [];
  while (P.length < N) {
    const p = { x: (rnd() * 2 - 1) * 6.2, y: -0.55 + rnd() * 3.4, z: -7 + rnd() * 8.4, r: 0.03 + Math.pow(rnd(), 2.2) * 0.13, ph: rnd() * Math.PI * 2, sp: 0.25 + rnd() * 0.5, hot: 0 };
    const inLogo = Math.abs(p.x) < 3.7 && p.y > -0.95 && p.y < 1.25 && p.z > -0.9 && p.z < 1.4;
    if (!inLogo) P.push(p);
  }
  P.forEach((p, i) => spheres.setColorAt(i, baseCol));
  scene.add(spheres);
  const dummy = new THREE.Object3D();
  const SZ = narrow ? 0.1 : 0.085;              // tamaño de una parcela en los capítulos

  /* ---------- la historia: nube, biplot y terreno (se construyen una vez, ocultos) ---------- */
  const H = await buildStory();

  /* ---------- cámara y composición ---------- */
  let VW = 1, VH = 1, stillMode = false;
  const view = { dist: 12, lookY: 0.3, baseY: 0.6 };
  const tanH = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  function layout() {
    const w = stillMode ? VW : (canvas.clientWidth || innerWidth), h = stillMode ? VH : (canvas.clientHeight || innerHeight);
    VW = w; VH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const t = tanH();
    const portrait = w / h < 0.8;
    /* ancho a encuadrar: el logotipo completo en horizontal; las letras más grandes en vertical */
    const fitW = portrait ? 6.5 : 8.4, fill = portrait ? 0.92 : 0.74;
    const distW = (fitW / 2) / (t * camera.aspect * fill);
    const distH = 3.4 / (t * 2 * 0.62);
    view.dist = Math.max(distW, distH * (portrait ? 0 : 1), 6);
    const halfH = t * view.dist;
    view.lookY = 0.55 - (portrait ? 0.14 : 0.31) * halfH;   // el logotipo arriba del centro: el texto ocupa la parte baja
    view.baseY = view.lookY + 0.25;
    view.visH = 2 * halfH;
  }
  layout();
  new ResizeObserver(() => { if (!stillMode) layout(); }).observe(canvas);

  /* dónde se encuadra cada capítulo: a la derecha del texto en pantallas anchas, abajo en vertical */
  function region() {
    if (stillMode) return { cx: VW / 2, cy: VH / 2, w: VW, h: VH };
    if (VW / VH < 0.8) return { cx: VW / 2, cy: VH * 0.69, w: VW * 0.96, h: VH * 0.5 };
    return { cx: VW * 0.715, cy: VH * 0.56, w: VW * 0.5, h: VH * 0.72 };
  }
  function fitDist(bw, bh, Rg) {
    const t = tanH();
    return Math.max((bw / (2 * t * camera.aspect)) * (VW / Rg.w), (bh / (2 * t)) * (VH / Rg.h));
  }
  const cams = { hero: mkCam(), d1: mkCam(), d3: mkCam(), d4: mkCam(), out: mkCam(), a: mkCam() };
  function mkCam() { return { pos: new THREE.Vector3(), look: new THREE.Vector3(), off: new THREE.Vector2() }; }
  function mixCam(a, b, k, out) { out.pos.lerpVectors(a.pos, b.pos, k); out.look.lerpVectors(a.look, b.look, k); out.off.lerpVectors(a.off, b.off, k); return out; }
  function chapterCams() {
    const Rg = region();
    const off = [Rg.cx - VW / 2, Rg.cy - VH / 2];
    /* Datos y Análisis: la nube y el biplot de frente */
    const d1 = fitDist(VW / VH < 0.8 ? 9.6 : 8.4, 5.4, Rg);   /* con margen para los nombres de las variables */
    cams.d1.look.set(0, 0.4, 0); cams.d1.pos.set(0, 0.4 + d1 * 0.06, d1); cams.d1.off.set(off[0], off[1]);
    /* Modelos: el terreno en vista oblicua */
    const el = THREE.MathUtils.degToRad(38), d3 = fitDist(12.6, 6.2, Rg) * 0.98;
    cams.d3.look.set(0, TERR.y + 0.2, 0.3); cams.d3.pos.set(0, TERR.y + 0.2 + Math.sin(el) * d3, 0.3 + Math.cos(el) * d3); cams.d3.off.set(off[0], off[1]);
    /* Decisión: vista cenital con el terreno justo dentro del marco de la figura */
    const pl = stillMode ? { x: 0, y: 0, w: VW, h: VH } : (story.plot || { x: VW * 0.5, y: VH * 0.3, w: VW * 0.4, h: VW * 0.4 / 1.5 });
    const d4 = (TERR.w / (2 * tanH() * camera.aspect)) * (VW / pl.w);
    cams.d4.look.set(0, TERR.y + 0.35, 0); cams.d4.pos.set(0, TERR.y + 0.35 + d4, d4 * 0.0006);
    cams.d4.off.set(pl.x + pl.w / 2 - VW / 2, pl.y + pl.h / 2 - VH / 2);
  }

  /* ---------- interacción: parallax (ratón o giroscopio), cursor sobre las esferas ---------- */
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  const pointer = new THREE.Vector2(9, 9);
  let pointerMoved = false;
  addEventListener('pointermove', (e) => {
    par.tx = (e.clientX / innerWidth) * 2 - 1;
    par.ty = (e.clientY / innerHeight) * 2 - 1;
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    pointerMoved = true;
  }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    par.tx = Math.max(-1, Math.min(1, e.gamma / 30));
    par.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  }, { passive: true });
  const raycaster = new THREE.Raycaster();

  /* ---------- reloj de la intro ---------- */
  let t0 = performance.now() / 1000;
  const endT = T.end;
  let clock = mode === 'composed' ? endT : 0;
  function finishIntro() {
    try { sessionStorage.setItem('labg-intro', '1'); } catch (e) {}
    if (skipBtn) skipBtn.hidden = true;
  }
  if (mode === 'intro' && skipBtn) {
    skipBtn.hidden = false;
    skipBtn.addEventListener('click', () => { t0 -= Math.max(0, endT - clock); finishIntro(); skipBtn.blur(); });
  } else finishIntro();

  /* ---------- pausa: pestaña oculta o escenario ya desvanecido (después de la figura) ---------- */
  let running = true, rafId = 0;
  const shouldRun = () => !document.hidden && (story.fade || 0) < 1;
  function wake() {
    if (shouldRun() && !running) { running = true; last = performance.now(); rafId = requestAnimationFrame(loop); }
  }
  document.addEventListener('visibilitychange', wake);
  addEventListener('scroll', wake, { passive: true });

  /* ---------- calidad adaptativa: si baja de 50 cuadros por segundo, sin halos, menos esferas y menos píxeles ---------- */
  let last = performance.now(), fpsAcc = 0, fpsN = 0, degraded = false;
  function adapt(dt) {
    if (degraded || clock < endT) return;
    fpsAcc += dt; fpsN++;
    if (fpsN === 90) {
      const fps = 90 / fpsAcc;
      if (fps < 50) {
        degraded = true;
        glowSprites.forEach((g) => { g.visible = false; });
        if (sm < 1) spheres.count = Math.round(N * 0.6);
        pixelRatio = 1; renderer.setPixelRatio(1); layout();
      }
      fpsAcc = 0; fpsN = 0;
    }
  }

  /* ---------- un cuadro ---------- */
  let sm = story.s || 0, forcedS = null;
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3(), ray = new THREE.Vector3();
  const anchors = [];
  function rowAnchors() {
    /* cada fila de la tabla, llevada al plano z = 0 de la escena por el rayo de la cámara */
    anchors.length = 0;
    (story.rows || []).forEach((r) => {
      ray.set((r.x / VW) * 2 - 1, -(r.y / VH) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
      const k = -camera.position.z / (ray.z || -1e-6);
      anchors.push(new THREE.Vector3().copy(camera.position).addScaledVector(ray, k));
    });
  }

  function update(now) {
    const t = clock;
    const s = sm;
    /* origen */
    const o = easeBack(span(t, T.origin));
    origin.scale.setScalar(Math.max(0.0001, o));
    originHalo.scale.setScalar(1.1 * o + 0.12 * Math.sin(now * 1.6) * o);
    /* vectores y puntas de flecha */
    const v = easeInOut(span(t, T.vectors));
    arms.forEach((a) => { a.scale.y = Math.max(0.0001, a.userData.len * v); });
    const hv = easeOut(span(t, [T.vectors[0] + 0.75, T.vectors[1] + 0.1]));
    headRods.flat().forEach((h) => { h.scale.y = Math.max(0.0001, h.userData.len * hv); });
    joints.forEach((j) => j.scale.setScalar(Math.max(0.0001, hv)));
    /* letras que se levantan desde el piso */
    letters.forEach((m, i) => {
      const a = T.letters[0] + i * 0.14, k = span(t, [a, a + 0.56]);
      m.rotation.x = -Math.PI / 2 * (1 - easeBack(k));
      m.scale.setScalar(Math.max(0.0001, 0.6 + 0.4 * easeOut(k)));
      m.visible = k > 0;
    });
    /* campana, marcas y latido de los cinco puntos */
    const g = span(t, [T.gauss[0], T.gauss[1] - 0.1]);
    gaussGeo.setDrawRange(0, Math.floor(gaussCount * easeInOut(g) / 3) * 3);
    gaussHaloGeo.setDrawRange(0, Math.floor(gaussHaloGeo.index.count * easeInOut(g) / 3) * 3);
    const lab = span(t, [T.gauss[0] + 0.4, T.gauss[1]]);
    labels.forEach((l) => { l.material.opacity = lab * 0.85; });
    dashMat.opacity = lab * 0.35;
    dots.forEach((d, i) => {
      const a = T.gauss[0] + 0.2 + i * 0.1;
      const intro = span(t, [a, a + 0.25]);
      d.scale.setScalar(Math.max(0.0001, easeBack(intro)));
      const wave = Math.max(0, Math.sin((now - i * 0.16) * 1.4)) ** 12;
      const e = 0.35 + 1.4 * (1 - span(t, [a + 0.25, a + 0.7])) * intro + 1.1 * wave * (t >= endT ? 1 : 0);
      dotMats[i].emissiveIntensity = e;
      d.userData.glow.material.opacity = Math.min(1, 0.15 * intro + 0.45 * (e - 0.35));
    });
    /* piso y línea de luz */
    const f = easeOut(span(t, T.floor));
    floor.scale.z = Math.max(0.0001, f);
    gridMat.opacity = 0.2 * f;
    if (t > T.floor[0] + 0.4) {
      const cyc = ((now * 0.11) % 1);
      sweep.position.z = 1.6 - cyc * 40;
      sweep.material.opacity = 0.55 * Math.sin(Math.PI * cyc) * f;
    }

    /* el logotipo sube con la página mientras la entrada sale de la pantalla */
    const up = s < 1 ? s : 1;
    logo.position.y = up * view.visH * 1.08;
    metal.userData.lift.value = logo.position.y;
    logo.visible = up < 0.98;

    /* cámara de la entrada: retrocede en la intro con parallax de ±3° */
    const back = easeInOut(span(t, [T.vectors[0], T.letters[1] + 0.4]));
    const dist = THREE.MathUtils.lerp(view.dist * 0.82, view.dist, back);
    const focusY = THREE.MathUtils.lerp(view.lookY + 0.35, view.lookY, back);   /* la A crece arriba, sin tocar el texto */
    par.x += (par.tx - par.x) * 0.05; par.y += (par.ty - par.y) * 0.05;
    const calm = 1 - span(s, [4.0, 4.4]);                    // en la figura final la cámara se queda quieta
    const yaw = THREE.MathUtils.degToRad(3) * par.x * calm, pitch = THREE.MathUtils.degToRad(3) * par.y * calm;
    cams.hero.pos.set(0, focusY + (view.baseY - view.lookY) * back, dist);
    cams.hero.look.set(0, focusY, 0);
    cams.hero.off.set(0, 0);

    /* cámara de los capítulos */
    chapterCams();
    let c;
    if (s < 1) c = mixCam(cams.hero, cams.d1, easeInOut(span(s, [0.42, 1])), cams.out);
    else if (s < 3) c = cams.d1;
    else if (s < 4) c = mixCam(cams.d1, cams.d3, easeInOut(span(s, [3.02, 3.42])), cams.out);
    else c = mixCam(cams.d3, cams.d4, easeInOut(span(s, [4.02, 4.52])), cams.out);
    const rel = vA.subVectors(c.pos, c.look);
    const r = rel.length();
    rel.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    camera.position.copy(c.look).add(rel).add(vB.set(0, Math.sin(pitch) * r * 0.5, 0));
    camera.up.set(0, 1, 0);
    camera.lookAt(c.look);
    camera.setViewOffset(VW, VH, -c.off.x, -c.off.y, VW, VH);
    camera.updateMatrixWorld();
    scene.fog.density = s < 1 ? 0.32 / view.dist : 0.32 / Math.max(view.dist, r * (s > 3 ? 1.6 : 1));
    if (s > 0.9 && s < 2.2) rowAnchors();

    /* esferas */
    const sAppear = span(t, T.spheres);
    const heroOut = easeIn(span(s, [0.2, 0.62]));
    const cloudSpin = now * 0.12 + (s - 1) * 1.1;
    const grow = easeOut(span(s, [3.0, 3.35]));
    for (let i = 0; i < spheres.count; i++) {
      const p = P[i], D = H.D[i];
      let sc;
      if (s < 1) {
        const k = easeBack(clamp01(sAppear * 1.6 - (i / N) * 0.6));
        dummy.position.set(p.x + Math.sin(now * p.sp * 0.5 + p.ph) * 0.08, p.y + Math.sin(now * p.sp + p.ph) * 0.12 + logo.position.y, p.z);
        sc = p.r * k * (1 + p.hot * 0.35) * (1 - heroOut);
        p.hot *= 0.93;
        tmpCol.copy(baseCol).lerp(hotCol, p.hot);
      } else {
        /* la nube: cada parcela gira despacio alrededor del centro */
        const ca = Math.cos(cloudSpin), sa = Math.sin(cloudSpin);
        vC.set(D.cloud.x * ca + D.cloud.z * sa, D.cloud.y + Math.sin(now * 0.6 + D.ph) * 0.05, -D.cloud.x * sa + D.cloud.z * ca);
        tmpCol.copy(baseCol);
        if (s < 2) {
          /* Datos: nacen en su fila de la tabla y vuelan a la nube */
          const a0 = 1.4 + D.row * 0.045 + D.j * 0.003, kk = easeOut(span(s, [a0, a0 + 0.24]));
          const an = anchors[D.row];
          if (an) vB.copy(an).add(D.jit); else vB.set(0, 0, 0);
          dummy.position.lerpVectors(vB, vC, kk);
          sc = kk > 0 ? SZ * easeBack(Math.min(1, kk * 2.5)) : 0;
        } else if (s < 3) {
          /* Análisis: de la nube al biplot; se tiñen con el color de su grupo */
          const k2 = easeInOut(span(s, [2.04 + D.j * 0.004, 2.5 + D.j * 0.004]));
          dummy.position.lerpVectors(vC, D.bip, k2);
          tmpCol.lerp(groupCols[D.g], span(s, [2.22, 2.52]));
          sc = SZ;
        } else {
          /* Modelos y Decisión: suben sobre su sitio y caen al terreno */
          const st = D.fall;
          const kA = easeInOut(span(s, [3.04 + st, 3.3 + st])), kB = span(s, [3.28 + st, 3.52 + st]);
          vB.set(D.occ.x, TERR.y + D.occH * grow + SZ * 0.8, D.occ.z);
          vA.copy(vB); vA.y += 2.6;
          if (kB > 0) dummy.position.lerpVectors(vA, vB, bounce(kB));
          else dummy.position.lerpVectors(D.bip, vA, kA);
          tmpCol.copy(groupCols[D.g]).lerp(occCol, span(s, [3.3, 3.6]));
          sc = SZ * (1 - 0.25 * span(s, [4.0, 4.4]));
        }
      }
      dummy.scale.setScalar(Math.max(0.0001, sc));
      dummy.updateMatrix();
      spheres.setMatrixAt(i, dummy.matrix);
      spheres.setColorAt(i, tmpCol);
    }
    spheres.instanceMatrix.needsUpdate = true;
    if (spheres.instanceColor) spheres.instanceColor.needsUpdate = true;
    sphereMat.emissiveIntensity = s < 3.3 ? 0.2 : 0.2 * (1 - span(s, [3.3, 3.6]));

    /* biplot: ejes, vectores de las variables y sus nombres */
    const out = 1 - span(s, [3.0, 3.2]);
    H.bip.visible = s > 2.05 && s < 3.22;
    if (H.bip.visible) {
      const ax = easeOut(span(s, [2.1, 2.4])) * out;
      H.axes.forEach((a) => { a.scale.x = Math.max(0.0001, ax); });
      H.axisLabels.forEach((l) => { l.material.opacity = span(s, [2.3, 2.5]) * out; });
      H.vecs.forEach((vv, i) => {
        const k = easeOut(span(s, [2.38 + i * 0.04, 2.66 + i * 0.04])) * out;
        vv.rod.scale.set(1, Math.max(0.0001, vv.len * k), 1);
        vv.head.position.copy(vv.dir).multiplyScalar(vv.len * k);
        vv.head.scale.setScalar(Math.max(0.0001, Math.min(1, k * 3)));
        vv.label.material.opacity = span(s, [2.6 + i * 0.03, 2.8 + i * 0.03]) * out;
      });
    }

    /* terreno: sube, se colorea como mapa de idoneidad y brillan sus curvas de nivel */
    H.terr.visible = s > 2.98;
    if (H.terr.visible) {
      const u = H.terrMat.uniforms;
      u.uGrow.value = grow;
      u.uOpacity.value = span(s, [2.98, 3.15]);
      u.uReveal.value = span(s, [3.45, 3.86]);
      u.uLines.value = 0.55 * span(s, [3.05, 3.3]) + 0.45 * span(s, [3.55, 3.9]);
      u.uGlow.value = span(s, [3.55, 3.9]) * (0.55 + 0.45 * Math.sin(now * 1.8)) * (1 - 0.7 * span(s, [4.1, 4.4]));
      u.uEdge.value = 1 - span(s, [4.15, 4.5]);
    }
  }

  function hover() {
    if (!pointerMoved || clock < T.spheres[0] || sm > 0.2) return;
    pointerMoved = false;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(spheres, false)[0];
    if (hit && hit.instanceId != null) P[hit.instanceId].hot = 1;
  }

  function loop(ms) {
    if (!shouldRun()) { running = false; return; }
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (ms - last) / 1000); last = ms;
    const now = ms / 1000;
    /* si alguien baja durante la intro, el logotipo se completa de inmediato */
    if (clock < endT && (story.s || 0) > 0.02) { t0 -= endT - clock; clock = endT; finishIntro(); }
    if (clock < endT) { clock = now - t0; if (clock >= endT) finishIntro(); }
    /* el scroll mueve la escena con un pequeño retraso: la historia fluye y nunca salta */
    const target = forcedS != null ? forcedS : (story.s || 0);
    sm += (target - sm) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - sm) < 1e-4) sm = target;
    hover();
    update(now);
    renderer.render(scene, camera);
    adapt(dt);
  }

  /* ---------- API para la página: exportar la figura e imágenes fijas de cada capítulo ---------- */
  window.LABG_SCENE = {
    exportFigure() {
      const plotEl = document.getElementById('figPlot');
      if (!plotEl) return;
      update(performance.now() / 1000);
      renderer.render(scene, camera);
      const r = plotEl.getBoundingClientRect(), k = canvas.width / canvas.clientWidth;
      composeFigure(canvas, { x: r.left * k, y: r.top * k, w: r.width * k, h: r.height * k }, (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'labg-figura-ejemplo.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      });
    },
    /* imagen fija de un momento de la historia (para las versiones sin WebGL o con movimiento reducido) */
    still(s, w = 1200, h = 800, type = 'image/webp', q = 0.86) {
      stillMode = true; VW = w; VH = h;
      renderer.setPixelRatio(1); layout();
      clock = endT; sm = s; forcedS = s;
      const now = performance.now() / 1000;
      if (s > 0.9 && s < 2.2) rowAnchors();
      update(now); renderer.render(scene, camera);
      const url = canvas.toDataURL(type, q);
      stillMode = false; forcedS = null;
      renderer.setPixelRatio(pixelRatio); layout();
      return url;
    },
  };

  /* primera imagen y relevo del SVG */
  if (mode === 'composed') clock = endT;
  t0 = performance.now() / 1000 - clock;
  update(performance.now() / 1000);
  renderer.render(scene, camera);
  canvas.classList.add('ready');
  if (svgPic) svgPic.classList.add('gone');
  root.classList.add('scene-on', 'scrolly');
  last = performance.now();
  rafId = requestAnimationFrame(loop);

  /* ---------- piezas ---------- */
  function rod(a, b) {
    const m = new THREE.Mesh(cylGeo, metal);
    const dir = new THREE.Vector3().subVectors(b, a);
    m.userData.len = dir.length();
    m.position.copy(a);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    m.scale.y = 0.0001;
    logo.add(m);
    return m;
  }

  /* nube, biplot y terreno; cada parcela sabe su fila, su lugar en el biplot y su sitio en el mapa */
  async function buildStory() {
    const rs = mulberry(7031);
    const gauss = () => { const u = 1 - rs(), w = rs(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); };
    const scores = E ? E.scores : Array.from({ length: N }, () => [gauss() * 1.5, gauss()]);
    const maxAbs = Math.max(...scores.map((x) => Math.abs(x[0])), ...scores.map((x) => Math.abs(x[1]) * 1.55));
    const kb = 3.2 / maxAbs;                               // misma escala en los dos ejes: el biplot no se deforma
    const BY = 0.4;

    /* terreno: colinas suaves; la idoneidad es mayor a media altura y hacia el este */
    const g2 = (x, z, cx, cz, sg) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * sg * sg));
    const height = (x, z) => 1.35 * g2(x, z, -2.4, -0.7, 2.1) + 1.0 * g2(x, z, 2.9, 1.2, 1.7) + 0.7 * g2(x, z, 0.6, -2.4, 1.3) + 0.45 * g2(x, z, -4.2, 2.4, 1.2) + 0.12 * Math.sin(x * 1.7) * Math.cos(z * 1.3);
    const suitRaw = (x, z) => { const h = height(x, z); return Math.exp(-(((h - 0.72) / 0.32) ** 2)) * (0.45 + 0.55 / (1 + Math.exp(-(x * 0.5 + z * 0.25)))); };
    const segX = narrow ? 96 : 168, segZ = Math.round(segX * TERR.d / TERR.w);
    const geo = new THREE.PlaneGeometry(TERR.w, TERR.d, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, nV = pos.count;
    const aH = new Float32Array(nV), aS = new Float32Array(nV);
    let smax = 0;
    for (let i = 0; i < nV; i++) { const x = pos.getX(i), z = pos.getZ(i); aH[i] = height(x, z); aS[i] = suitRaw(x, z); smax = Math.max(smax, aS[i]); pos.setY(i, aH[i]); }
    for (let i = 0; i < nV; i++) aS[i] /= smax;
    geo.computeVertexNormals();
    geo.setAttribute('aH', new THREE.BufferAttribute(aH, 1));
    geo.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
    const terrMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: true, fog: false,
      uniforms: { uGrow: { value: 0 }, uReveal: { value: 0 }, uLines: { value: 0 }, uGlow: { value: 0 }, uOpacity: { value: 0 }, uEdge: { value: 1 } },
      vertexShader: `
        attribute float aH; attribute float aS;
        uniform float uGrow;
        varying float vH; varying float vS; varying vec3 vN; varying vec2 vUv; varying float vX;
        void main() {
          vec3 p = position; p.y = aH * uGrow;
          vH = aH; vS = aS; vUv = uv; vX = position.x;
          vN = normalize(vec3(normal.x * uGrow, normal.y, normal.z * uGrow));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        uniform float uReveal; uniform float uLines; uniform float uGlow; uniform float uOpacity; uniform float uEdge;
        varying float vH; varying float vS; varying vec3 vN; varying vec2 vUv; varying float vX;
        vec3 ramp(float s) {
          vec3 c0 = vec3(0.933, 0.957, 0.941), c1 = vec3(0.635, 0.965, 0.800), c2 = vec3(0.243, 0.839, 0.545), c3 = vec3(0.047, 0.416, 0.267), c4 = vec3(0.020, 0.247, 0.161);
          if (s < 0.35) return mix(c0, c1, s / 0.35);
          if (s < 0.60) return mix(c1, c2, (s - 0.35) / 0.25);
          if (s < 0.82) return mix(c2, c3, (s - 0.60) / 0.22);
          return mix(c3, c4, (s - 0.82) / 0.18);
        }
        void main() {
          vec3 paper = vec3(0.968, 0.982, 0.973);
          float front = mix(-7.0, 7.0, uReveal);                       /* el cálculo avanza celda por celda, de oeste a este */
          float fill = smoothstep(vX - 0.8, vX + 0.8, front);
          vec3 col = mix(paper, ramp(vS), fill);
          float lam = 0.72 + 0.28 * max(dot(normalize(vN), normalize(vec3(-0.45, 1.0, 0.55))), 0.0);
          col *= lam;
          float hv = vH * 5.0;
          float d = abs(fract(hv - 0.5) - 0.5) / max(fwidth(hv), 1e-4);
          float line = 1.0 - min(d, 1.0);
          col = mix(col, vec3(0.047, 0.416, 0.267), line * uLines * 0.55);
          col += vec3(0.30, 0.90, 0.60) * line * uGlow * 0.35;
          float e = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x) * smoothstep(0.0, 0.07, vUv.y) * smoothstep(1.0, 0.93, vUv.y);
          gl_FragColor = vec4(col, mix(1.0, e, uEdge) * uOpacity);
        }`,
    });
    const terr = new THREE.Mesh(geo, terrMat);
    terr.position.y = TERR.y;
    terr.visible = false;
    scene.add(terr);
    await frame();

    /* registros de presencia: sitios idóneos del terreno (muestreo con semilla) */
    const occ = [];
    let guard = 0;
    while (occ.length < N && guard++ < 20000) {
      const x = (rs() - 0.5) * TERR.w * 0.86, z = (rs() - 0.5) * TERR.d * 0.84;
      if (suitRaw(x, z) / smax > 0.55 + rs() * 0.3) occ.push([x, z]);
    }
    while (occ.length < N) occ.push([(rs() - 0.5) * 6, (rs() - 0.5) * 4]);

    const D = [];
    for (let i = 0; i < N; i++) {
      const sc = scores[i] || [0, 0];
      const grp = E ? ['A', 'B', 'C'].indexOf(E.filas[i].grupo) : i % 3;
      D.push({
        row: i % 8, j: Math.floor(i / 8), g: Math.max(0, grp), ph: rs() * 6.28,
        jit: new THREE.Vector3((rs() - 0.5) * 0.5, (rs() - 0.5) * 0.12, (rs() - 0.5) * 0.3),
        cloud: new THREE.Vector3(gauss() * 1.9, 0.4 + gauss() * 1.0, gauss() * 1.1),
        bip: new THREE.Vector3(sc[0] * kb, BY + sc[1] * kb, 0),
        occ: new THREE.Vector3(occ[i][0], 0, occ[i][1]), occH: height(occ[i][0], occ[i][1]),
        fall: (i / N) * 0.12,
      });
    }

    /* biplot */
    const bip = new THREE.Group();
    bip.visible = false;
    scene.add(bip);
    const axisMat = new THREE.MeshBasicMaterial({ color: COLORS.axis, transparent: true, opacity: 0.55, fog: false });
    const axX = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.012, 0.012), axisMat); axX.position.set(0, BY, -0.02);
    const axY = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.012, 0.012), axisMat); axY.rotation.z = Math.PI / 2; axY.position.set(0, BY, -0.02);
    bip.add(axX, axY);
    const pct = E ? E.varianza : [0, 0];
    const lx = textSprite(`CP1 (${pct[0].toFixed(1)} %)`, { font: '600 40px Manrope, system-ui, sans-serif', color: '#4A6157', h: 0.26 });
    lx.position.set(3.55, BY - 0.2, 0); lx.center.set(1, 0.5);
    const ly = textSprite(`CP2 (${pct[1].toFixed(1)} %)`, { font: '600 40px Manrope, system-ui, sans-serif', color: '#4A6157', h: 0.26 });
    ly.position.set(0.12, BY + 2.35, 0); ly.center.set(0, 0.5);
    bip.add(lx, ly);
    const vecMat = new THREE.MeshBasicMaterial({ color: COLORS.dark, fog: false });
    const vGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 10); vGeo.translate(0, 0.5, 0);
    const hGeo = new THREE.ConeGeometry(0.07, 0.2, 14); hGeo.translate(0, -0.1, 0);
    const vs = 2.55;
    const vecs = (E ? E.cargas : []).map((cg, i) => {
      const dir = new THREE.Vector3(cg[0], cg[1], 0);
      const len = dir.length() * vs; dir.normalize();
      const rodM = new THREE.Mesh(vGeo, vecMat); rodM.position.set(0, BY, 0.02);
      rodM.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      const head = new THREE.Mesh(hGeo, vecMat);
      head.quaternion.copy(rodM.quaternion);
      const hg = new THREE.Group(); hg.position.set(0, BY, 0.02); hg.add(head);
      const label = textSprite(E.cols[i].nombre, { font: 'italic 500 44px Fraunces, Georgia, serif', color: '#0C6A44', h: 0.3 });
      label.position.set(dir.x * (len + 0.42), BY + dir.y * (len + 0.3), 0.05);
      bip.add(rodM, hg, label);
      return { rod: rodM, head, dir, len, label };
    });
    /* la punta de cada flecha vive en un grupo con origen en el centro del biplot y avanza a lo largo del vector */
    await frame();
    /* compilar los sombreadores ahora (con todo visible un instante) y no al llegar a cada capítulo */
    bip.visible = terr.visible = true;
    renderer.compile(scene, camera);
    bip.visible = terr.visible = false;
    return { D, bip, axes: [axX, axY], axisLabels: [lx, ly], vecs, terr, terrMat };
  }
}

/* invierte el orden de los vértices de cada triángulo (tras reflejar el eje y) */
function flipWinding(geo) {
  if (geo.index) { const ix = geo.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } return; }
  for (const name of Object.keys(geo.attributes)) {
    const a = geo.attributes[name], n = a.itemSize, arr = a.array;
    for (let i = 0; i < a.count; i += 3) {
      for (let k = 0; k < n; k++) { const j1 = (i + 1) * n + k, j2 = (i + 2) * n + k, t = arr[j1]; arr[j1] = arr[j2]; arr[j2] = t; }
    }
  }
}

/* el color del metal es el degradado del logotipo (gradiente «lgg» del SVG, de y = 70 a y = 250),
   evaluado por altura en cada fragmento; encima quedan los reflejos y el barniz */
function logoGradient(mat) {
  const stops = [[70, '#EAFFF4'], [120.4, '#62E6A5'], [160, '#0C6A44'], [181.6, '#A2F6CC'], [250, '#053F29']];
  mat.onBeforeCompile = (sh) => {
    stops.forEach(([y, c], i) => { sh.uniforms['uGy' + i] = { value: y }; sh.uniforms['uGc' + i] = { value: new THREE.Color(c) }; });
    sh.uniforms.uS = { value: S }; sh.uniforms.uCY = { value: CY };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;');
    const uni = stops.map((_, i) => `uniform float uGy${i}; uniform vec3 uGc${i};`).join('\n');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying float vWY; uniform float uS; uniform float uCY; uniform float uLift;
${uni}
vec3 labgGrad(float y) {
  if (y <= uGy0) return uGc0;
  if (y <= uGy1) return mix(uGc0, uGc1, (y - uGy0) / (uGy1 - uGy0));
  if (y <= uGy2) return mix(uGc1, uGc2, (y - uGy1) / (uGy2 - uGy1));
  if (y <= uGy3) return mix(uGc2, uGc3, (y - uGy2) / (uGy3 - uGy2));
  if (y <= uGy4) return mix(uGc3, uGc4, (y - uGy3) / (uGy4 - uGy3));
  return uGc4;
}`).replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( labgGrad(uCY - (vWY - uLift) / uS), opacity );')
      .replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive + labgGrad(uCY - (vWY - uLift) / uS) * 0.2;');
    sh.uniforms.uLift = mat.userData.lift || (mat.userData.lift = { value: 0 });
  };
}

/* contornos sin puntos repetidos: evita cuñas al triangular los huecos */
function cleanShape(shape) {
  const { shape: outer, holes } = shape.extractPoints(10);
  const tidy = (pts) => {
    const out = pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > 1e-4);
    if (out.length > 2 && out[0].distanceTo(out[out.length - 1]) < 1e-4) out.pop();
    return out;
  };
  const s2 = new THREE.Shape(tidy(outer));
  s2.holes = holes.map((h) => new THREE.Path(tidy(h)));
  return s2;
}

function bandTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'), grd = g.createLinearGradient(0, 0, 0, 256);
  [[0, '#EAFFF4'], [0.3, '#62E6A5'], [0.47, '#0C6A44'], [0.5, '#08090B'], [0.56, '#0C6A44'], [0.66, '#A2F6CC'], [1, '#053F29']].forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function radialTexture(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* texto como sprite: se mide para que el lienzo le quede justo */
function textSprite(txt, { font = 'italic 64px Fraunces, Georgia, serif', color = '#0C6A44', h = 0.25 } = {}) {
  const c = document.createElement('canvas');
  let g = c.getContext('2d');
  g.font = font;
  const tw = Math.ceil(g.measureText(txt).width) + 24;
  c.width = Math.max(64, tw); c.height = 96;
  g = c.getContext('2d');
  g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(txt, c.width / 2, 50);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false }));
  sp.scale.set(h * c.width / c.height, h, 1);
  sp.renderOrder = 5;
  return sp;
}

/* figura para publicar: el mapa del marco con ejes, norte, escala, leyenda y pie */
function composeFigure(src, r, done) {
  const W = 1800, pad = { l: 150, t: 90, r: 60 }, pw = W - pad.l - pad.r, ph = Math.round(pw / 1.5), H = pad.t + ph + 300;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.drawImage(src, r.x, r.y, r.w, r.h, pad.l, pad.t, pw, ph);
  g.strokeStyle = '#0D1F17'; g.lineWidth = 2; g.strokeRect(pad.l, pad.t, pw, ph);
  g.fillStyle = '#20352B'; g.font = '500 26px Manrope, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
  for (let i = 0; i <= 6; i++) { const x = pad.l + (pw * i) / 6; g.beginPath(); g.moveTo(x, pad.t + ph); g.lineTo(x, pad.t + ph + 12); g.stroke(); g.fillText(String(i * 20), x, pad.t + ph + 18); }
  g.textAlign = 'right'; g.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) { const y = pad.t + ph - (ph * i) / 4; g.beginPath(); g.moveTo(pad.l - 12, y); g.lineTo(pad.l, y); g.stroke(); g.fillText(String(i * 20), pad.l - 20, y); }
  g.textAlign = 'center'; g.font = '600 28px Manrope, system-ui, sans-serif';
  g.fillText('Este (km)', pad.l + pw / 2, pad.t + ph + 68);
  g.save(); g.translate(52, pad.t + ph / 2); g.rotate(-Math.PI / 2); g.fillText('Norte (km)', 0, 0); g.restore();
  /* norte */
  g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(pad.l + pw - 78, pad.t + 16, 58, 86);
  g.fillStyle = '#0D1F17'; g.beginPath(); g.moveTo(pad.l + pw - 49, pad.t + 26); g.lineTo(pad.l + pw - 63, pad.t + 64); g.lineTo(pad.l + pw - 35, pad.t + 64); g.closePath(); g.fill();
  g.font = '700 26px Manrope, system-ui, sans-serif'; g.fillText('N', pad.l + pw - 49, pad.t + 84);
  /* leyenda */
  const lx = pad.l, ly = pad.t + ph + 130, lw = 420;
  const grd = g.createLinearGradient(lx, 0, lx + lw, 0);
  [[0, '#EEF4F0'], [0.35, '#A2F6CC'], [0.6, '#3ED68B'], [0.82, '#0C6A44'], [1, '#053F29']].forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(lx, ly, lw, 22); g.strokeRect(lx, ly, lw, 22);
  g.fillStyle = '#20352B'; g.font = '500 24px Manrope, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top';
  g.fillText('0', lx, ly + 30); g.textAlign = 'right'; g.fillText('1', lx + lw, ly + 30);
  g.textAlign = 'left'; g.font = '600 26px Manrope, system-ui, sans-serif'; g.fillText('Idoneidad', lx + lw + 24, ly - 2);
  g.fillStyle = '#10241A'; g.beginPath(); g.arc(lx + lw + 40, ly + 44, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#20352B'; g.font = '500 24px Manrope, system-ui, sans-serif'; g.fillText('Registro de presencia', lx + lw + 60, ly + 32);
  g.font = '400 26px Manrope, system-ui, sans-serif'; g.fillStyle = '#0D1F17';
  g.fillText('Figura 1. Idoneidad modelada y registros de presencia (datos de ejemplo). Hecha con LABG.', pad.l, ly + 96);
  c.toBlob(done, 'image/png');
}

/* números pseudoaleatorios con semilla: la misma nube en cada visita */
function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
