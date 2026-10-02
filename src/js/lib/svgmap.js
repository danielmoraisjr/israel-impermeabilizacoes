// Converte coordenadas de um SVG com preserveAspectRatio="xMidYMid slice"
// (viewBox quadrado) para pixels do elemento. Serve para alinhar o canvas da
// chuva e as etiquetas HTML com o desenho.
export function sliceMap(el, vb = 1000) {
  const r = el.getBoundingClientRect();
  const s = Math.max(r.width, r.height) / vb;
  const ox = (r.width - vb * s) / 2;
  const oy = (r.height - vb * s) / 2;
  return { w: r.width, h: r.height, s, ox, oy, X: (u) => ox + u * s, Y: (v) => oy + v * s };
}
