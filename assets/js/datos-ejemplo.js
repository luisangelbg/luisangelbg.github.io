/* LABG — datos de ejemplo de la portada: 70 parcelas ficticias de tres grupos y cinco variables
   agronómicas genéricas, con su análisis de componentes principales calculado aquí mismo.
   La tabla del capítulo «Tus datos», el biplot de «Análisis» y el porcentaje de varianza
   salen de estos números: no hay valores inventados a mano. Semilla fija: siempre los mismos. */
(function (root) {
  'use strict';
  function mulberry(a) {
    return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  var rnd = mulberry(20260930);
  function normal() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  var cols = [
    { k: 'rend', nombre: 'Rendimiento', unidad: 't/ha', dec: 2 },
    { k: 'alt', nombre: 'Altura', unidad: 'cm', dec: 0 },
    { k: 'flor', nombre: 'Floración', unidad: 'días', dec: 0 },
    { k: 'p100', nombre: 'Peso 100 s.', unidad: 'g', dec: 1 },
    { k: 'prot', nombre: 'Proteína', unidad: '%', dec: 1 },
  ];
  /* medias por grupo y desviaciones; el vigor común da la correlación entre variables */
  var grupos = [
    { g: 'A', m: [6.4, 212, 68, 34.0, 9.2] },
    { g: 'B', m: [4.1, 168, 79, 27.5, 11.4] },
    { g: 'C', m: [5.0, 240, 88, 30.5, 10.1] },
  ];
  var sd = [0.55, 14, 3.2, 1.9, 0.55];
  var carga = [0.8, 0.6, -0.3, 0.7, -0.5];   /* cuánto responde cada variable al vigor de la parcela */
  var n = 70, filas = [];
  for (var i = 0; i < n; i++) {
    var G = grupos[i % 3], vigor = normal(), fila = { parcela: 'P' + String(i + 1).padStart(2, '0'), grupo: G.g, v: [] };
    for (var j = 0; j < 5; j++) {
      var x = G.m[j] + sd[j] * (carga[j] * vigor + Math.sqrt(1 - carga[j] * carga[j]) * normal());
      fila.v.push(+x.toFixed(cols[j].dec));
    }
    filas.push(fila);
  }

  /* estandarizar, matriz de correlaciones y sus vectores propios (Jacobi) */
  var p = 5, med = [], des = [];
  for (var c = 0; c < p; c++) {
    var s = 0, s2 = 0;
    for (var r = 0; r < n; r++) { s += filas[r].v[c]; }
    med[c] = s / n;
    for (r = 0; r < n; r++) { s2 += Math.pow(filas[r].v[c] - med[c], 2); }
    des[c] = Math.sqrt(s2 / (n - 1));
  }
  var Z = filas.map(function (f) { return f.v.map(function (x, c) { return (x - med[c]) / des[c]; }); });
  var R = [];
  for (var a = 0; a < p; a++) { R[a] = []; for (var b = 0; b < p; b++) { var t = 0; for (r = 0; r < n; r++) t += Z[r][a] * Z[r][b]; R[a][b] = t / (n - 1); } }
  var A = R.map(function (row) { return row.slice(); }), V = [];
  for (a = 0; a < p; a++) { V[a] = []; for (b = 0; b < p; b++) V[a][b] = a === b ? 1 : 0; }
  for (var it = 0; it < 100; it++) {
    var off = 0;
    for (a = 0; a < p; a++) for (b = a + 1; b < p; b++) off += A[a][b] * A[a][b];
    if (off < 1e-14) break;
    for (var P = 0; P < p; P++) for (var Q = P + 1; Q < p; Q++) {
      if (Math.abs(A[P][Q]) < 1e-15) continue;
      var th = (A[Q][Q] - A[P][P]) / (2 * A[P][Q]);
      var tt = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), cs = 1 / Math.sqrt(tt * tt + 1), sn = tt * cs;
      for (var k = 0; k < p; k++) {
        var akp = A[k][P], akq = A[k][Q];
        A[k][P] = cs * akp - sn * akq; A[k][Q] = sn * akp + cs * akq;
      }
      for (k = 0; k < p; k++) {
        var apk = A[P][k], aqk = A[Q][k];
        A[P][k] = cs * apk - sn * aqk; A[Q][k] = sn * apk + cs * aqk;
      }
      for (k = 0; k < p; k++) {
        var vkp = V[k][P], vkq = V[k][Q];
        V[k][P] = cs * vkp - sn * vkq; V[k][Q] = sn * vkp + cs * vkq;
      }
    }
  }
  var orden = [0, 1, 2, 3, 4].sort(function (x, y) { return A[y][y] - A[x][x]; });
  var val = orden.map(function (o) { return A[o][o]; });
  var vec = orden.map(function (o) { return V.map(function (row) { return row[o]; }); });
  /* signo estable: el rendimiento carga en positivo en CP1 y en CP2 */
  vec = vec.map(function (v) { return v[0] < 0 ? v.map(function (x) { return -x; }) : v; });
  var total = val.reduce(function (x, y) { return x + y; }, 0);
  var scores = Z.map(function (z) { return [0, 1].map(function (k) { return z.reduce(function (s, x, c) { return s + x * vec[k][c]; }, 0); }); });
  var cargas = cols.map(function (_, c) { return [0, 1].map(function (k) { return vec[k][c] * Math.sqrt(val[k]); }); });

  root.LABG_EJEMPLO = {
    cols: cols, filas: filas, n: n,
    scores: scores,               /* CP1 y CP2 de cada parcela */
    cargas: cargas,               /* correlación de cada variable con CP1 y CP2 */
    varianza: [100 * val[0] / total, 100 * val[1] / total],
  };
})(typeof window !== 'undefined' ? window : globalThis);
