/* LABG — escena 3D de la portada (un solo contexto WebGL, fijo detrás de la página).

   Entrada: el logo LABG —idéntico al original: se dibuja como textura desde assets/marca/svg/labg-logo.svg—
   montado como un medallón con canto dorado, y a su alrededor corrientes de viento en espiral: cintas de oro
   que giran en anillos inclinados, con ráfagas que viajan por ellas y motas de polvo dorado. Pasan por detrás del
   medallón y, cuando pasan por delante, se desvanecen al llegar al borde del hexágono: lo envuelven sin taparlo.
   Todo el movimiento del viento se calcula en la tarjeta gráfica (cero trabajo por cuadro en el procesador).

   Intro (segundos, en T): el viento se dibuja desde un extremo, aparece el polvo y un brillo cruza el oro.

   Historia con el scroll (s, de chapters.js en window.LABG_STORY):
     0 → 1  el medallón sube con la página y el viento se abre y se disipa
     1 → 2  Datos: cada fila de la tabla se vuelve esferas (la nube)
     2 → 3  Análisis: la nube se ordena en el biplot de componentes principales, con sus ejes y vectores
     3 → 4  Modelos: las esferas caen sobre un terreno que se colorea como mapa de idoneidad
     4 → 5  Decisión: la cámara sube a una vista cenital encuadrada en el marco de la figura
   Los datos son los de assets/js/datos-ejemplo.js: el biplot es el ACP real de esa tabla. */

import * as THREE from 'three';

const T = { wind: [0.0, 1.8], dust: [0.9, 2.2], shine: [1.2, 2.6], end: 2.6 };
const SPHERES = { desktop: 70, mobile: 38, lite: 24 };
/* paleta de la marca: oro del logo, negro y grises cálidos */
const COLORS = {
  white: 0xffffff, gold: 0xd4a848, goldDark: 0x9c7128, goldText: 0x7d5b14, black: 0x111111,
  gA: 0xd4a848, gB: 0x1a1a1a, gC: 0x9b9488, occ: 0x111111, axis: 0x5c5750,
};
/* terreno del capítulo Modelos: 12 × 8 unidades (proporción 3:2, la del marco de la figura) */
const TERR = { w: 12, d: 8, y: -1.35 };

/* el medallón: 2 unidades de alto, con la geometría del hexágono del logo (assets/marca/geometria.json) */
const LOGO = { W: 828, H: 946.2, outer: [[414, 0], [828, 232.9], [828, 713.3], [414, 946.2], [0, 713.3], [0, 232.9]] };
const MED_H = 2.0, MED_K = MED_H / LOGO.H, MED_W = LOGO.W * MED_K;
const HEX = LOGO.outer.map(([x, y]) => [(x - LOGO.W / 2) * MED_K, (LOGO.H / 2 - y) * MED_K]);   // centrado, y hacia arriba
/* en el SVG de la entrada (assets/marca/svg/labg-viento.svg) el logo mide 600 de 1000 de alto, centrado */
const SVG_LOGO_FRAC = 0.6;

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
  const heroImg = document.getElementById('heroSvg');
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
  scene.fog = new THREE.FogExp2(COLORS.white, 0.03);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 160);

  /* reflejos del metal: un cielo en bandas de oro, champaña y negro */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = bandTexture();
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  envTex.dispose(); pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xfff6e4, 0.75));
  const key = new THREE.DirectionalLight(0xfff3dc, 1.5); key.position.set(-3, 5, 6); scene.add(key);
  const rimLight = new THREE.DirectionalLight(0xe6c470, 1.0); rimLight.position.set(4, 2, -5); scene.add(rimLight);
  await frame();

  /* ---------- la entrada: medallón + viento ---------- */
  const hero = new THREE.Group();
  scene.add(hero);
  const medal = new THREE.Group();
  hero.add(medal);

  /* aura champaña detrás del medallón */
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.6), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(243,223,168,0.85)', 'rgba(255,255,255,0)'), transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
  aura.position.z = -1.2;
  hero.add(aura);

  /* el logo como textura: se rasteriza el SVG de la marca al tamaño que pide la pantalla */
  const logoTex = await logoTexture('assets/marca/svg/labg-logo.svg', narrow ? 1024 : 2048);
  logoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const faceMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: true, fog: false,
    uniforms: { map: { value: logoTex }, uShine: { value: -1 }, uOpacity: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform sampler2D map; uniform float uShine; uniform float uOpacity; varying vec2 vUv;
      void main() {
        vec4 c = texture2D(map, vUv);
        if (c.a < 0.02) discard;
        /* brillo que cruza solo lo dorado (no el negro del fondo del hexágono) */
        float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        float gold = smoothstep(0.32, 0.55, lum) * step(c.b + 0.04, c.r);
        float band = exp(-pow((vUv.x * 0.75 + (1.0 - vUv.y) * 0.55 - uShine) * 7.0, 2.0));
        c.rgb += vec3(1.0, 0.93, 0.74) * band * gold * 0.5;
        gl_FragColor = vec4(c.rgb, c.a * uOpacity);
      }`,
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(MED_W, MED_H), faceMat);
  face.position.z = 0.001;
  medal.add(face);
  /* canto del medallón: el hexágono extruido en oro (se ve al inclinarse) */
  const hexShape = new THREE.Shape(HEX.map(([x, y]) => new THREE.Vector2(x, y)));
  const rimGeo = new THREE.ExtrudeGeometry(hexShape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 1 });
  rimGeo.translate(0, 0, -0.082);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd9b05c, metalness: 0.85, roughness: 0.28, envMapIntensity: 1.1 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  medal.add(rim);
  await frame();

  /* ---------- corrientes de viento: cintas en hélice calculadas en la GPU ---------- */
  const WIND_SCALE = 1 / 300;                  // unidades del SVG de la marca → mundo (el logo mide 600 ↔ 2)
  const streams = [];
  for (let k = 0; k < 7; k++) streams.push({ main: true, r0: 352 + k * 50, flat: 0.27 + 0.012 * k, tilt: -0.17 + 0.045 * Math.sin(k * 1.9), phase: 0.6 + k * 0.83, turns: 1.18 + 0.1 * (k % 3), grow: 0.3, rise: (k % 2 ? 1 : -1) * (26 + k * 9), w: 2.5 - k * 0.2, speed: 11 + k * 1.6 });
  for (let k = 0; k < 6; k++) streams.push({ main: false, r0: 345 + k * 70, flat: 0.25 + 0.02 * k, tilt: -0.12 + 0.05 * Math.sin(k * 2.3 + 1), phase: 2.2 + k * 1.1, turns: 0.95 + 0.12 * (k % 2), grow: 0.24, rise: (k % 2 ? -1 : 1) * 40, w: 0.85, speed: 15 + k * 2 });
  const SEG = narrow ? 120 : 200;
  const hexN = [], hexC = [];
  for (let i = 0; i < 6; i++) {
    const a = HEX[i], b = HEX[(i + 1) % 6];
    let nx = b[1] - a[1], ny = -(b[0] - a[0]);
    const l = Math.hypot(nx, ny); nx /= l; ny /= l;
    if (nx * a[0] + ny * a[1] < 0) { nx = -nx; ny = -ny; }       // normal hacia fuera
    hexN.push(new THREE.Vector2(nx, ny)); hexC.push(nx * a[0] + ny * a[1]);
  }
  const windUniforms = {
    uTime: { value: 0 }, uDraw: { value: 0 }, uOut: { value: 0 }, uFade: { value: 1 },
    uHexN: { value: hexN }, uHexC: { value: hexC }, uMed: { value: new THREE.Vector3() },
    uDark: { value: new THREE.Color(0x9c7128) }, uLight: { value: new THREE.Color(0xe2bf6a) }, uHead: { value: new THREE.Color(0x8a6418) },
    uPx: { value: 1 },
  };
  const HELIX = `
    attribute vec4 aS1;   // r0, inclinación hacia la cámara (rad), fase, vueltas
    attribute vec4 aS2;   // apertura, subida, inclinación en el plano (rad), ancho
    attribute vec4 aS3;   // velocidad de ráfagas, opacidad, frecuencia de ráfagas, principal (1) o fina (0)
    uniform float uTime; uniform float uOut;
    vec3 helix(float u) {
      float th = aS1.z + (u - 0.5) * aS1.w * 6.2831853 + uTime * 0.06 + uOut * 1.6;
      float r = aS1.x * (1.0 - aS2.x * 0.5 + aS2.x * u) * (1.0 + uOut * 0.9);
      vec3 p = vec3(r * cos(th), aS2.y * (u - 0.5), r * sin(th));
      float cb = cos(aS1.y), sb = sin(aS1.y);
      p = vec3(p.x, p.y * cb - p.z * sb, p.y * sb + p.z * cb);        // el anillo se inclina hacia quien mira
      float ct = cos(aS2.z), st = sin(aS2.z);
      return vec3(p.x * ct - p.y * st, p.x * st + p.y * ct, p.z);       // y se ladea en el plano
    }`;
  const HEXFADE = `
    uniform vec2 uHexN[6]; uniform float uHexC[6]; uniform vec3 uMed;
    /* distancia con signo al hexágono del medallón (positiva fuera) */
    float hexSd(vec2 p) { float d = -1e5; for (int i = 0; i < 6; i++) d = max(d, dot(uHexN[i], p) - uHexC[i]); return d; }`;
  const ribbonMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide,
    uniforms: windUniforms,
    vertexShader: `${HELIX}
      attribute float aU; attribute float aSide;
      varying float vU; varying float vTaper; varying vec3 vW; varying vec4 vS3; varying float vFront;
      void main() {
        vec3 P = helix(aU), Q = helix(aU + 0.003);
        vec4 w = modelMatrix * vec4(P, 1.0);
        vec3 tng = normalize(mat3(modelMatrix) * (Q - P));
        vec3 side = normalize(cross(tng, normalize(cameraPosition - w.xyz)));
        float taper = smoothstep(0.0, 0.14, aU) * smoothstep(1.0, 0.86, aU);
        w.xyz += side * aSide * aS2.w * 0.5 * (0.3 + 0.7 * taper);
        vU = aU; vTaper = taper; vW = w.xyz; vS3 = aS3; vFront = P.z;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `${HEXFADE}
      uniform float uTime; uniform float uDraw; uniform float uOut; uniform float uFade;
      uniform vec3 uDark; uniform vec3 uLight; uniform vec3 uHead;
      varying float vU; varying float vTaper; varying vec3 vW; varying vec4 vS3; varying float vFront;
      void main() {
        /* ráfaga: una cabeza más intensa con su estela, viajando a lo largo de la corriente */
        float f = fract(vU * vS3.z - uTime / vS3.x);
        float gust = pow(1.0 - f, 6.0);
        float a = vS3.y * (0.28 + 0.95 * gust) * vTaper;
        /* delante del medallón: se desvanece al entrar en el hexágono (lo envuelve sin taparlo) */
        if (vFront > 0.0) a *= smoothstep(0.0, 0.16, hexSd(vW.xy - uMed.xy));
        else a *= 0.62;                                   // la mitad de atrás, más tenue: profundidad
        a *= 1.0 - smoothstep(uDraw * 1.12 - 0.12, uDraw * 1.12, vU);   // la corriente se dibuja al entrar
        a *= (1.0 - uOut) * uFade;
        if (a < 0.003) discard;
        vec3 col = mix(uDark, uLight, clamp(vW.x * 0.2 + 0.5, 0.0, 1.0));
        col = mix(col, uHead, gust * 0.55);
        gl_FragColor = vec4(col, a);
      }`,
  });
  {
    const nV = streams.length * (SEG + 1) * 2;
    const aU = new Float32Array(nV), aSide = new Float32Array(nV), aS1 = new Float32Array(nV * 4), aS2 = new Float32Array(nV * 4), aS3 = new Float32Array(nV * 4);
    const idx = [];
    let v = 0;
    streams.forEach((s, k) => {
      const base = v;
      const S1 = [s.r0 * WIND_SCALE, Math.asin(Math.min(0.9, s.flat)), s.phase, s.turns];
      const S2 = [s.grow, s.rise * WIND_SCALE, s.tilt, (s.main ? s.w * 1.35 : s.w * 1.2) * WIND_SCALE * 2.2];
      const period = (s.main ? 380 + (k % 3) * 90 : 520) * WIND_SCALE;
      const len = 2 * Math.PI * s.r0 * WIND_SCALE * s.turns;
      const S3 = [s.speed * 0.55, s.main ? 0.85 : 0.5, len / period, s.main ? 1 : 0];
      for (let i = 0; i <= SEG; i++) {
        for (const sd of [-1, 1]) {
          aU[v] = i / SEG; aSide[v] = sd;
          aS1.set(S1, v * 4); aS2.set(S2, v * 4); aS3.set(S3, v * 4);
          v++;
        }
        if (i < SEG) { const a = base + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('aU', new THREE.BufferAttribute(aU, 1));
    g.setAttribute('aSide', new THREE.BufferAttribute(aSide, 1));
    g.setAttribute('aS1', new THREE.BufferAttribute(aS1, 4));
    g.setAttribute('aS2', new THREE.BufferAttribute(aS2, 4));
    g.setAttribute('aS3', new THREE.BufferAttribute(aS3, 4));
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nV * 3), 3));   // la posición real sale del sombreador
    g.setIndex(idx);
    const ribbons = new THREE.Mesh(g, ribbonMat);
    ribbons.frustumCulled = false;
    hero.add(ribbons);
  }
  /* polvo de oro: motas que viajan por las corrientes principales */
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: windUniforms,
    vertexShader: `${HELIX}
      attribute float aU0; attribute float aSpd; attribute float aSize;
      uniform float uPx;
      varying vec3 vW; varying float vFront; varying float vU;
      void main() {
        float u = fract(aU0 + uTime * aSpd);
        vec3 P = helix(u);
        vec4 w = modelMatrix * vec4(P, 1.0);
        vW = w.xyz; vFront = P.z; vU = u;
        vec4 mv = viewMatrix * w;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPx * (6.0 / -mv.z);
      }`,
    fragmentShader: `${HEXFADE}
      uniform float uDraw; uniform float uOut; uniform float uFade; uniform vec3 uHead;
      varying vec3 vW; varying float vFront; varying float vU;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        float a = smoothstep(0.5, 0.15, r) * 0.9;
        if (vFront > 0.0) a *= smoothstep(0.0, 0.16, hexSd(vW.xy - uMed.xy)); else a *= 0.6;
        a *= smoothstep(0.0, 0.1, vU) * smoothstep(1.0, 0.9, vU) * uDraw * (1.0 - uOut) * uFade;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uHead, a);
      }`,
  });
  {
    const mains = streams.filter((s) => s.main);
    const ND = narrow ? 36 : 64;
    const aS1 = new Float32Array(ND * 4), aS2 = new Float32Array(ND * 4), aS3 = new Float32Array(ND * 4), aU0 = new Float32Array(ND), aSpd = new Float32Array(ND), aSize = new Float32Array(ND);
    const rr = mulberry(4242);
    for (let i = 0; i < ND; i++) {
      const s = mains[i % mains.length];
      aS1.set([s.r0 * WIND_SCALE, Math.asin(Math.min(0.9, s.flat)), s.phase, s.turns], i * 4);
      aS2.set([s.grow, s.rise * WIND_SCALE, s.tilt, 0], i * 4);
      aS3.set([1, 1, 1, 1], i * 4);
      aU0[i] = rr(); aSpd[i] = (0.018 + rr() * 0.03); aSize[i] = 2.2 + rr() * 2.8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ND * 3), 3));
    g.setAttribute('aS1', new THREE.BufferAttribute(aS1, 4));
    g.setAttribute('aS2', new THREE.BufferAttribute(aS2, 4));
    g.setAttribute('aS3', new THREE.BufferAttribute(aS3, 4));
    g.setAttribute('aU0', new THREE.BufferAttribute(aU0, 1));
    g.setAttribute('aSpd', new THREE.BufferAttribute(aSpd, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    const dust = new THREE.Points(g, dustMat);
    dust.frustumCulled = false;
    hero.add(dust);
  }
  await frame();

  /* ---------- esferas: las parcelas de los datos de ejemplo (aparecen en el capítulo Datos) ---------- */
  const E = window.LABG_EJEMPLO;
  const N = Math.min(E ? E.n : 70, SPHERES[root.dataset.lite === '1' ? 'lite' : tier]);
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.62, roughness: 0.26, envMapIntensity: 1.15 });
  const spheres = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), sphereMat, N);
  spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  spheres.frustumCulled = false;
  const baseCol = new THREE.Color(COLORS.gold), tmpCol = new THREE.Color();
  const groupCols = [new THREE.Color(COLORS.gA), new THREE.Color(COLORS.gB), new THREE.Color(COLORS.gC)];
  const occCol = new THREE.Color(COLORS.occ);
  for (let i = 0; i < N; i++) spheres.setColorAt(i, baseCol);
  scene.add(spheres);
  const dummy = new THREE.Object3D();
  const SZ = narrow ? 0.1 : 0.085;              // tamaño de una parcela en los capítulos

  /* ---------- la historia: nube, biplot y terreno (se construyen una vez, ocultos) ---------- */
  const H = await buildStory();

  /* ---------- cámara y composición ---------- */
  let VW = 1, VH = 1, stillMode = false;
  const tanH = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  function layout() {
    const w = stillMode ? VW : (canvas.clientWidth || innerWidth), h = stillMode ? VH : (canvas.clientHeight || innerHeight);
    VW = w; VH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    windUniforms.uPx.value = renderer.getPixelRatio() * (h / 900);
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
  const cams = { hero: mkCam(), d1: mkCam(), d3: mkCam(), d4: mkCam(), out: mkCam() };
  function mkCam() { return { pos: new THREE.Vector3(), look: new THREE.Vector3(), off: new THREE.Vector2() }; }
  function mixCam(a, b, k, out) { out.pos.lerpVectors(a.pos, b.pos, k); out.look.lerpVectors(a.look, b.look, k); out.off.lerpVectors(a.off, b.off, k); return out; }
  /* la entrada: la cámara encuadra el medallón exactamente donde está el logo del SVG (relevo sin salto) */
  let heroBox = null;
  function heroCam() {
    const r = heroImg && !stillMode ? heroImg.getBoundingClientRect() : null;
    if (r && r.height > 0) heroBox = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height * SVG_LOGO_FRAC };
    const b = heroBox || { cx: VW / 2, cy: VH * 0.4, h: VH * 0.42 };
    const d = (MED_H * VH) / (2 * tanH() * b.h);
    cams.hero.pos.set(0, 0, d); cams.hero.look.set(0, 0, 0); cams.hero.off.set(b.cx - VW / 2, b.cy - VH / 2);
  }
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

  /* ---------- interacción: parallax (ratón o giroscopio) ---------- */
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    par.tx = (e.clientX / innerWidth) * 2 - 1;
    par.ty = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    par.tx = Math.max(-1, Math.min(1, e.gamma / 30));
    par.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  }, { passive: true });

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

  /* ---------- calidad adaptativa: si baja de 50 cuadros por segundo, menos píxeles ---------- */
  let last = performance.now(), fpsAcc = 0, fpsN = 0, degraded = false;
  function adapt(dt) {
    if (degraded || clock < endT) return;
    fpsAcc += dt; fpsN++;
    if (fpsN === 90) {
      const fps = 90 / fpsAcc;
      if (fps < 50) { degraded = true; pixelRatio = 1; renderer.setPixelRatio(1); layout(); }
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

    /* ---- la entrada: viento que se dibuja, polvo, brillo y parallax suave ---- */
    windUniforms.uTime.value = now;
    windUniforms.uDraw.value = easeOut(span(t, T.wind));
    windUniforms.uOut.value = easeIn(span(s, [0.05, 0.75]));
    hero.visible = s < 0.98 && !stillMode;
    par.x += (par.tx - par.x) * 0.05; par.y += (par.ty - par.y) * 0.05;
    medal.rotation.set(-par.y * 0.07, par.x * 0.09, 0);
    hero.rotation.set(0, par.x * 0.04, 0);
    /* el brillo cruza el oro al final de la intro y luego cada nueve segundos */
    const sh = t < endT ? span(t, T.shine) : ((now % 9) / 1.6);
    faceMat.uniforms.uShine.value = sh <= 1 ? -0.4 + sh * 1.9 : -1;
    windUniforms.uMed.value.set(0, 0, 0);

    /* cámara de la entrada y de los capítulos */
    heroCam();
    chapterCams();
    let c;
    if (s < 1) c = mixCam(cams.hero, cams.d1, easeInOut(span(s, [0.45, 1])), cams.out);
    else if (s < 3) c = cams.d1;
    else if (s < 4) c = mixCam(cams.d1, cams.d3, easeInOut(span(s, [3.02, 3.42])), cams.out);
    else c = mixCam(cams.d3, cams.d4, easeInOut(span(s, [4.02, 4.52])), cams.out);
    const calm = (s < 1 ? 0.35 : 1) * (1 - span(s, [4.0, 4.4]));   // en la figura final la cámara se queda quieta
    const yaw = THREE.MathUtils.degToRad(3) * par.x * calm, pitch = THREE.MathUtils.degToRad(3) * par.y * calm;
    const rel = vA.subVectors(c.pos, c.look);
    const r = rel.length();
    rel.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    camera.position.copy(c.look).add(rel).add(vB.set(0, Math.sin(pitch) * r * 0.5, 0));
    camera.up.set(0, 1, 0);
    camera.lookAt(c.look);
    camera.setViewOffset(VW, VH, -c.off.x, -c.off.y, VW, VH);
    camera.updateMatrixWorld();
    scene.fog.density = s < 1 ? 0.004 : 0.32 / Math.max(10, r * (s > 3 ? 1.6 : 1));
    if (s > 0.9 && s < 2.2) rowAnchors();

    /* ---- esferas ---- */
    const cloudSpin = now * 0.12 + (s - 1) * 1.1;
    const grow = easeOut(span(s, [3.0, 3.35]));
    spheres.visible = s >= 1.2 || stillMode;
    for (let i = 0; i < spheres.count; i++) {
      const D = H.D[i];
      let sc = 0;
      /* la nube: cada parcela gira despacio alrededor del centro */
      const ca = Math.cos(cloudSpin), sa = Math.sin(cloudSpin);
      vC.set(D.cloud.x * ca + D.cloud.z * sa, D.cloud.y + Math.sin(now * 0.6 + D.ph) * 0.05, -D.cloud.x * sa + D.cloud.z * ca);
      tmpCol.copy(baseCol);
      if (s < 1) {
        dummy.position.copy(vC); sc = 0;
      } else if (s < 2) {
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
      dummy.scale.setScalar(Math.max(0.0001, sc));
      dummy.updateMatrix();
      spheres.setMatrixAt(i, dummy.matrix);
      spheres.setColorAt(i, tmpCol);
    }
    spheres.instanceMatrix.needsUpdate = true;
    if (spheres.instanceColor) spheres.instanceColor.needsUpdate = true;

    /* ---- biplot: ejes, vectores de las variables y sus nombres ---- */
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

    /* ---- terreno: sube, se colorea como mapa de idoneidad y brillan sus curvas de nivel ---- */
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

  function loop(ms) {
    if (!shouldRun()) { running = false; return; }
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (ms - last) / 1000); last = ms;
    const now = ms / 1000;
    /* si alguien baja durante la intro, el viento se completa de inmediato */
    if (clock < endT && (story.s || 0) > 0.02) { t0 -= endT - clock; clock = endT; finishIntro(); }
    if (clock < endT) { clock = now - t0; if (clock >= endT) finishIntro(); }
    /* el scroll mueve la escena con un pequeño retraso: la historia fluye y nunca salta */
    const target = forcedS != null ? forcedS : (story.s || 0);
    sm += (target - sm) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - sm) < 1e-4) sm = target;
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
        /* idoneidad en la rampa de la marca: papel, champaña, oro, bronce y casi negro */
        vec3 ramp(float s) {
          vec3 c0 = vec3(0.957, 0.937, 0.894), c1 = vec3(0.945, 0.867, 0.659), c2 = vec3(0.851, 0.682, 0.322), c3 = vec3(0.612, 0.443, 0.157), c4 = vec3(0.227, 0.165, 0.063);
          if (s < 0.35) return mix(c0, c1, s / 0.35);
          if (s < 0.60) return mix(c1, c2, (s - 0.35) / 0.25);
          if (s < 0.82) return mix(c2, c3, (s - 0.60) / 0.22);
          return mix(c3, c4, (s - 0.82) / 0.18);
        }
        void main() {
          vec3 paper = vec3(0.976, 0.970, 0.955);
          float front = mix(-7.0, 7.0, uReveal);                       /* el cálculo avanza celda por celda, de oeste a este */
          float fill = smoothstep(vX - 0.8, vX + 0.8, front);
          vec3 col = mix(paper, ramp(vS), fill);
          float lam = 0.72 + 0.28 * max(dot(normalize(vN), normalize(vec3(-0.45, 1.0, 0.55))), 0.0);
          col *= lam;
          float hv = vH * 5.0;
          float d = abs(fract(hv - 0.5) - 0.5) / max(fwidth(hv), 1e-4);
          float line = 1.0 - min(d, 1.0);
          col = mix(col, vec3(0.353, 0.259, 0.078), line * uLines * 0.55);
          col += vec3(0.85, 0.68, 0.32) * line * uGlow * 0.3;
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
    const lx = textSprite(`CP1 (${pct[0].toFixed(1)} %)`, { font: '600 40px Manrope, system-ui, sans-serif', color: '#5C5750', h: 0.26 });
    lx.position.set(3.55, BY - 0.2, 0); lx.center.set(1, 0.5);
    const ly = textSprite(`CP2 (${pct[1].toFixed(1)} %)`, { font: '600 40px Manrope, system-ui, sans-serif', color: '#5C5750', h: 0.26 });
    ly.position.set(0.12, BY + 2.35, 0); ly.center.set(0, 0.5);
    bip.add(lx, ly);
    const vecMat = new THREE.MeshBasicMaterial({ color: COLORS.goldText, fog: false });
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
      /* la punta vive en un grupo con origen en el centro del biplot y avanza a lo largo del vector */
      const hg = new THREE.Group(); hg.position.set(0, BY, 0.02); hg.add(head);
      const label = textSprite(E.cols[i].nombre, { font: 'italic 500 44px Fraunces, Georgia, serif', color: '#7D5B14', h: 0.3 });
      label.position.set(dir.x * (len + 0.42), BY + dir.y * (len + 0.3), 0.05);
      bip.add(rodM, hg, label);
      return { rod: rodM, head, dir, len, label };
    });
    await frame();
    /* compilar los sombreadores ahora (con todo visible un instante) y no al llegar a cada capítulo */
    bip.visible = terr.visible = true;
    renderer.compile(scene, camera);
    bip.visible = terr.visible = false;
    return { D, bip, axes: [axX, axY], axisLabels: [lx, ly], vecs, terr, terrMat };
  }
}

/* el logo de la marca rasterizado en un lienzo (colores exactos: sin conversión de color en el sombreador) */
async function logoTexture(src, h) {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.height = h; c.width = Math.round(h * LOGO.W / LOGO.H);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

function bandTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'), grd = g.createLinearGradient(0, 0, 0, 256);
  [[0, '#FFF8E6'], [0.3, '#F1D58E'], [0.47, '#9C7128'], [0.5, '#1A1A1A'], [0.56, '#9C7128'], [0.66, '#F6D985'], [1, '#5A4214']].forEach(([o, col]) => grd.addColorStop(o, col));
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
function textSprite(txt, { font = 'italic 64px Fraunces, Georgia, serif', color = '#7D5B14', h = 0.25 } = {}) {
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
  g.strokeStyle = '#111111'; g.lineWidth = 2; g.strokeRect(pad.l, pad.t, pw, ph);
  g.fillStyle = '#2A2A2A'; g.font = '500 26px Manrope, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
  for (let i = 0; i <= 6; i++) { const x = pad.l + (pw * i) / 6; g.beginPath(); g.moveTo(x, pad.t + ph); g.lineTo(x, pad.t + ph + 12); g.stroke(); g.fillText(String(i * 20), x, pad.t + ph + 18); }
  g.textAlign = 'right'; g.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) { const y = pad.t + ph - (ph * i) / 4; g.beginPath(); g.moveTo(pad.l - 12, y); g.lineTo(pad.l, y); g.stroke(); g.fillText(String(i * 20), pad.l - 20, y); }
  g.textAlign = 'center'; g.font = '600 28px Manrope, system-ui, sans-serif';
  g.fillText('Este (km)', pad.l + pw / 2, pad.t + ph + 68);
  g.save(); g.translate(52, pad.t + ph / 2); g.rotate(-Math.PI / 2); g.fillText('Norte (km)', 0, 0); g.restore();
  /* norte */
  g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(pad.l + pw - 78, pad.t + 16, 58, 86);
  g.fillStyle = '#111111'; g.beginPath(); g.moveTo(pad.l + pw - 49, pad.t + 26); g.lineTo(pad.l + pw - 63, pad.t + 64); g.lineTo(pad.l + pw - 35, pad.t + 64); g.closePath(); g.fill();
  g.font = '700 26px Manrope, system-ui, sans-serif'; g.fillText('N', pad.l + pw - 49, pad.t + 84);
  /* leyenda */
  const lx = pad.l, ly = pad.t + ph + 130, lw = 420;
  const grd = g.createLinearGradient(lx, 0, lx + lw, 0);
  [[0, '#F4EFE4'], [0.35, '#F1DDA8'], [0.6, '#D9AE52'], [0.82, '#9C7128'], [1, '#3A2A10']].forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(lx, ly, lw, 22); g.strokeRect(lx, ly, lw, 22);
  g.fillStyle = '#2A2A2A'; g.font = '500 24px Manrope, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top';
  g.fillText('0', lx, ly + 30); g.textAlign = 'right'; g.fillText('1', lx + lw, ly + 30);
  g.textAlign = 'left'; g.font = '600 26px Manrope, system-ui, sans-serif'; g.fillText('Idoneidad', lx + lw + 24, ly - 2);
  g.fillStyle = '#111111'; g.beginPath(); g.arc(lx + lw + 40, ly + 44, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2A2A2A'; g.font = '500 24px Manrope, system-ui, sans-serif'; g.fillText('Registro de presencia', lx + lw + 60, ly + 32);
  g.font = '400 26px Manrope, system-ui, sans-serif'; g.fillStyle = '#111111';
  g.fillText('Figura 1. Idoneidad modelada y registros de presencia (datos de ejemplo). Hecha con LABG.', pad.l, ly + 96);
  c.toBlob(done, 'image/png');
}

/* números pseudoaleatorios con semilla */
function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
