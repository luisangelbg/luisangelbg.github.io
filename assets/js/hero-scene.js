/* LABG — escena 3D del héroe: el logotipo construido en tres dimensiones.

   Composición (la del logotipo, assets/marca/svg/labg-logo.svg):
   la «A» es un biplot — un origen (esfera) del que salen dos vectores con punta de
   flecha y una barra de cinco puntos de datos —; L, B y G son las letras del propio
   SVG extruidas; detrás, una campana de Gauss con μ bajo el vértice de la A y
   marcas ±σ; debajo, un piso de cuadrícula en perspectiva; alrededor, esferas de
   datos flotando.

   Intro (segundos) — ajusta los tiempos en T:
     0–0.6   aparece el origen          0.6–1.6  crecen los vectores y la cámara retrocede
     1.6–2.4 se levantan L, B y G       2.4–3.2  se traza la campana; μ, ±σ; laten los 5 puntos
     3.2–    se extiende el piso, lo barre una línea de luz y flotan las esferas
   Número de esferas: SPHERES (escritorio / móvil / modesto). */

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const T = {
  origin: [0.0, 0.6], vectors: [0.6, 1.6], letters: [1.6, 2.4], gauss: [2.4, 3.2],
  floor: [3.2, 4.3], spheres: [3.2, 4.6], end: 4.6,
};
const SPHERES = { desktop: 70, mobile: 38, lite: 24 };
const COLORS = {
  white: 0xffffff, black: 0x08090b, deep: 0x0b2a1d, emerald: 0x3ed68b, light: 0x7bedb5, mint: 0xa2f6cc, dark: 0x0c6a44,
};

/* coordenadas: unidades del SVG (960 × 400) → mundo. Centro de las letras en x ≈ 515 */
const S = 1 / 100, CX = 515, CY = 170;
const wx = (x) => (x - CX) * S;
const wy = (y) => -(y - CY) * S;
const FLOOR_Y = wy(262);

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const span = (t, [a, b]) => clamp01((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeBack = (x) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const frame = () => new Promise((r) => requestAnimationFrame(() => r()));

export async function start({ mode }) {
  const root = document.documentElement;
  const canvas = document.getElementById('heroCanvas');
  const hero = document.getElementById('hero');
  const svgPic = document.querySelector('.hero-svg');
  const skipBtn = document.getElementById('skipIntro');
  const narrow = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  let tier = narrow ? 'mobile' : 'desktop';

  /* ---------- renderizador ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !narrow, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, narrow ? 1.5 : 2));
  renderer.setClearColor(COLORS.white, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.white, 0.055);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);

  /* reflejos del metal: el degradado del propio logotipo (#EAFFF4 → #62E6A5 → #0C6A44 → #A2F6CC → #053F29)
     como cielo alrededor de la escena; el metal lo refleja en bandas, igual que el cromado del SVG */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = bandTexture();
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  envTex.dispose(); pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xeafff4, 0.7));
  const key = new THREE.DirectionalLight(0xdfffee, 1.6); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(COLORS.emerald, 1.2); rim.position.set(4, 2, -5); scene.add(rim);
  await frame();

  /* ---------- materiales ---------- */
  const metal = new THREE.MeshStandardMaterial({
    color: 0xffffff, metalness: 0.3, roughness: 0.24,
    envMapIntensity: 0.75, emissive: 0x000000, emissiveIntensity: 1,
  });
  logoGradient(metal);
  const glow = (color, intensity) => new THREE.MeshStandardMaterial({ color: COLORS.mint, emissive: color, emissiveIntensity: intensity, roughness: 0.3, metalness: 0.2 });

  /* resplandor verde profundo detrás del logotipo (el fondo es opaco) */
  const haloTex = radialTexture('rgba(210,247,228,1)', 'rgba(255,255,255,0)');
  const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, opacity: 0.7, depthWrite: false, fog: false }));
  backGlow.position.set(0, 0.6, -3.5);
  scene.add(backGlow);

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
    /* pivote en la base de la letra para «levantarla» */
    const baseX = (bb.min.x + bb.max.x) / 2, baseY = bb.min.y;
    geo.translate(-baseX, -baseY, -0.15);
    const m = new THREE.Mesh(geo, metal);
    m.position.set(baseX - CX * S, baseY + CY * S, 0);
    scene.add(m);
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
  const joints = armEnds.map((e) => { const c = new THREE.Mesh(capGeo, metal); c.position.copy(e); scene.add(c); return c; });
  const origin = new THREE.Mesh(new THREE.SphereGeometry(0.167, 40, 28), glow(COLORS.emerald, 1.4));
  origin.position.copy(O);
  scene.add(origin);
  const originHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(62,214,139,0.45)', 'rgba(62,214,139,0)'), transparent: true, depthWrite: false, fog: false }));
  originHalo.position.copy(O).add(new THREE.Vector3(0, 0, 0.05));
  scene.add(originHalo);
  const dotMats = [], glowSprites = [originHalo];
  const dotGlowTex = radialTexture('rgba(62,214,139,0.7)', 'rgba(62,214,139,0)');
  const dots = [359.1, 379.5, 400.0, 420.5, 440.9].map((x) => {
    const mat = glow(COLORS.emerald, 0.35); dotMats.push(mat);
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.088, 28, 20), mat);
    d.position.set(wx(x), wy(188), 0.02);
    scene.add(d);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotGlowTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    gl.position.copy(d.position).add(new THREE.Vector3(0, 0, 0.05)); gl.scale.setScalar(0.42);
    scene.add(gl); glowSprites.push(gl); d.userData.glow = gl;
    return d;
  });
  await frame();

  /* ---------- campana de Gauss, μ y ±σ ---------- */
  const gaussD = doc.querySelector('path[stroke="#7BEDB5"]') ? doc.querySelector('path[stroke="#7BEDB5"]').getAttribute('d') : doc.querySelector('path').getAttribute('d');
  const gpts = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${gaussD}" fill="none" stroke="#000"/></svg>`).paths[0].subPaths[0].getPoints(160);
  const gcurve = new THREE.CatmullRomCurve3(gpts.map((p) => new THREE.Vector3(wx(p.x), wy(p.y), -0.45)));
  const gaussGeo = new THREE.TubeGeometry(gcurve, 320, 0.011, 6, false);
  const gaussMat = new THREE.MeshBasicMaterial({ color: COLORS.dark, transparent: true, opacity: 0.95, fog: false });
  const gauss = new THREE.Mesh(gaussGeo, gaussMat);
  const gaussHaloGeo = new THREE.TubeGeometry(gcurve, 320, 0.05, 6, false);
  const gaussHalo = new THREE.Mesh(gaussHaloGeo, new THREE.MeshBasicMaterial({ color: COLORS.emerald, transparent: true, opacity: 0.18, depthWrite: false, fog: false }));
  gaussHaloGeo.setDrawRange(0, 0); scene.add(gaussHalo); glowSprites.push(gaussHalo);
  const gaussCount = gaussGeo.index.count;
  gaussGeo.setDrawRange(0, 0);
  scene.add(gauss);
  await document.fonts.load('italic 72px Fraunces').catch(() => {});
  const labels = [[160, '−2σ'], [280, '−σ'], [400, 'μ'], [520, '+σ'], [640, '+2σ']].map(([x, txt]) => {
    const sp = textSprite(txt);
    sp.position.set(wx(x), wy(282), -0.45);
    scene.add(sp);
    return sp;
  });
  const dashMat = new THREE.LineDashedMaterial({ color: COLORS.dark, dashSize: 0.03, gapSize: 0.05, transparent: true, opacity: 0, fog: false });
  const dashTops = { 160: 223.9, 280: 140, 520: 140, 640: 223.9 };
  Object.entries(dashTops).forEach(([x, top]) => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(wx(+x), wy(top), -0.46), new THREE.Vector3(wx(+x), wy(250), -0.46)]);
    const l = new THREE.Line(g, dashMat); l.computeLineDistances(); scene.add(l);
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
  scene.add(floor);

  /* ---------- esferas de datos: un diagrama de dispersión que flota ---------- */
  const N = SPHERES[root.dataset.lite === '1' ? 'lite' : tier];
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.55, roughness: 0.22, envMapIntensity: 1.2, emissive: COLORS.dark, emissiveIntensity: 0.2 });
  const spheres = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), sphereMat, N);
  spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const rnd = mulberry(20260929);
  const baseCol = new THREE.Color(COLORS.emerald), hotCol = new THREE.Color(0xe9fff4), tmpCol = new THREE.Color();
  const P = [];
  while (P.length < N) {
    const p = { x: (rnd() * 2 - 1) * 6.2, y: -0.55 + rnd() * 3.4, z: -7 + rnd() * 8.4, r: 0.03 + Math.pow(rnd(), 2.2) * 0.13, ph: rnd() * Math.PI * 2, sp: 0.25 + rnd() * 0.5, hot: 0 };
    const inLogo = Math.abs(p.x) < 3.7 && p.y > -0.95 && p.y < 1.25 && p.z > -0.9 && p.z < 1.4;
    if (!inLogo) P.push(p);
  }
  P.forEach((p, i) => spheres.setColorAt(i, baseCol));
  scene.add(spheres);
  const dummy = new THREE.Object3D();

  /* ---------- cámara y composición ----------
     Sin cadena de posprocesado: el resplandor son halos aditivos solo en lo que emite luz
     (origen, cinco puntos, campana), y la viñeta y el grano los pone el CSS. Así el negro
     del fondo es el negro de la marca y la escena cuesta menos. */

  const view = { dist: 12, lookY: 0.3, baseY: 0.6 };
  function layout() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const portrait = w / h < 0.8;
    /* ancho a encuadrar: el logotipo completo en horizontal; las letras más grandes en vertical */
    const fitW = portrait ? 6.5 : 8.4, fill = portrait ? 0.92 : 0.74;
    const distW = (fitW / 2) / (tanH * camera.aspect * fill);
    const distH = 3.4 / (tanH * 2 * 0.62);
    view.dist = Math.max(distW, distH * (portrait ? 0 : 1), 6);
    /* el logotipo arriba del centro: el texto del héroe ocupa la parte baja */
    const halfH = tanH * view.dist;
    const logoCenterY = 0.55;
    view.lookY = logoCenterY - (portrait ? 0.14 : 0.31) * halfH;
    view.baseY = view.lookY + 0.25;
    /* niebla según la distancia: el logotipo queda nítido y el piso se funde con el horizonte */
    scene.fog.density = 0.32 / view.dist;
  }
  layout();
  new ResizeObserver(layout).observe(canvas);

  /* ---------- interacción: parallax (ratón o giroscopio), cursor sobre las esferas, scroll ---------- */
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  const pointer = new THREE.Vector2(9, 9);
  let pointerMoved = false;
  addEventListener('pointermove', (e) => {
    par.tx = (e.clientX / innerWidth) * 2 - 1;
    par.ty = (e.clientY / innerHeight) * 2 - 1;
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerMoved = true;
  }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    par.tx = Math.max(-1, Math.min(1, e.gamma / 30));
    par.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  }, { passive: true });
  const raycaster = new THREE.Raycaster();
  let scrollP = 0;
  const onScroll = () => { scrollP = clamp01(scrollY / (hero.offsetHeight * 0.85)); canvas.style.opacity = String(1 - Math.pow(scrollP, 1.4)); };
  addEventListener('scroll', onScroll, { passive: true });

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

  /* ---------- pausa fuera de pantalla o con la pestaña oculta ---------- */
  let visible = true, running = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; wake(); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', wake);
  let rafId = 0;
  function wake() {
    const should = visible && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); rafId = requestAnimationFrame(loop); }
    if (!should) { running = false; cancelAnimationFrame(rafId); }
  }

  /* ---------- calidad adaptativa: si baja de 50 cuadros por segundo, sin bloom y menos esferas ---------- */
  let last = performance.now(), fpsAcc = 0, fpsN = 0, degraded = false;
  function adapt(dt) {
    if (degraded || clock < endT) return;
    fpsAcc += dt; fpsN++;
    if (fpsN === 90) {
      const fps = 90 / fpsAcc;
      if (fps < 50) {
        degraded = true;
        glowSprites.forEach((g) => { g.visible = false; });
        spheres.count = Math.round(N / 2);
        renderer.setPixelRatio(1); layout();
      }
      fpsAcc = 0; fpsN = 0;
    }
  }

  /* ---------- un cuadro ---------- */
  function update(now) {
    const t = clock;
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
      /* después, un latido en ola cada pocos segundos */
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
    /* esferas flotando; se iluminan al pasar el cursor */
    const sAppear = span(t, T.spheres);
    for (let i = 0; i < spheres.count; i++) {
      const p = P[i];
      const k = easeBack(clamp01(sAppear * 1.6 - (i / N) * 0.6));
      dummy.position.set(p.x + Math.sin(now * p.sp * 0.5 + p.ph) * 0.08, p.y + Math.sin(now * p.sp + p.ph) * 0.12, p.z);
      dummy.scale.setScalar(Math.max(0.0001, p.r * k * (1 + p.hot * 0.35)));
      dummy.updateMatrix();
      spheres.setMatrixAt(i, dummy.matrix);
      p.hot *= 0.93;
      tmpCol.copy(baseCol).lerp(hotCol, p.hot);
      spheres.setColorAt(i, tmpCol);
    }
    spheres.instanceMatrix.needsUpdate = true;
    if (spheres.instanceColor) spheres.instanceColor.needsUpdate = true;

    /* cámara: retrocede en la intro, parallax de ±3° y se eleva al bajar */
    const back = easeInOut(span(t, [T.vectors[0], T.letters[1] + 0.4]));
    const dist = THREE.MathUtils.lerp(view.dist * 0.82, view.dist, back);
    const focusY = THREE.MathUtils.lerp(view.lookY + 0.35, view.lookY, back);   /* la A crece arriba, sin tocar el texto */
    par.x += (par.tx - par.x) * 0.05; par.y += (par.ty - par.y) * 0.05;
    const yaw = THREE.MathUtils.degToRad(3) * par.x, pitch = THREE.MathUtils.degToRad(3) * par.y;
    const rise = scrollP * 3.2;
    camera.position.set(Math.sin(yaw) * dist, focusY + (view.baseY - view.lookY) * back + Math.sin(pitch) * dist * 0.5 + rise, Math.cos(yaw) * dist);
    camera.lookAt(0, focusY + rise * 0.35, 0);
  }

  function hover() {
    if (!pointerMoved || clock < T.spheres[0]) return;
    pointerMoved = false;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(spheres, false)[0];
    if (hit && hit.instanceId != null) P[hit.instanceId].hot = 1;
  }

  function loop(ms) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (ms - last) / 1000); last = ms;
    const now = ms / 1000;
    if (clock < endT) { clock = now - t0; if (clock >= endT) finishIntro(); }
    hover();
    update(now);
    renderer.render(scene, camera);
    adapt(dt);
  }


  /* primera imagen y relevo del SVG */
  if (mode === 'composed') clock = endT;
  t0 = performance.now() / 1000 - clock;
  update(performance.now() / 1000);
  renderer.render(scene, camera);
  canvas.classList.add('ready');
  if (svgPic) svgPic.classList.add('gone');
  last = performance.now();
  rafId = requestAnimationFrame(loop);
  onScroll();

  /* ---------- piezas ---------- */
  function rod(a, b) {
    const m = new THREE.Mesh(cylGeo, metal);
    const dir = new THREE.Vector3().subVectors(b, a);
    m.userData.len = dir.length();
    m.position.copy(a);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    m.scale.y = 0.0001;
    scene.add(m);
    return m;
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
varying float vWY; uniform float uS; uniform float uCY;
${uni}
vec3 labgGrad(float y) {
  if (y <= uGy0) return uGc0;
  if (y <= uGy1) return mix(uGc0, uGc1, (y - uGy0) / (uGy1 - uGy0));
  if (y <= uGy2) return mix(uGc1, uGc2, (y - uGy1) / (uGy2 - uGy1));
  if (y <= uGy3) return mix(uGc2, uGc3, (y - uGy2) / (uGy3 - uGy2));
  if (y <= uGy4) return mix(uGc3, uGc4, (y - uGy3) / (uGy4 - uGy3));
  return uGc4;
}`).replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( labgGrad(uCY - vWY / uS), opacity );')
      .replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive + labgGrad(uCY - vWY / uS) * 0.2;');
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

function textSprite(txt) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#0C6A44'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'italic 64px Fraunces, Georgia, serif';
  g.fillText(txt, 128, 64);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  sp.scale.set(0.5, 0.25, 1);
  return sp;
}

/* números pseudoaleatorios con semilla: la misma nube de esferas en cada visita */
function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
