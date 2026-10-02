// Texturas procedurais (canvas 2D → CanvasTexture). Nenhuma imagem externa.
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, LinearFilter, LinearMipmapLinearFilter } from 'three';

function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, rx = 1, ry = 1, srgb = true) {
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(rx, ry);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4; t.minFilter = LinearMipmapLinearFilter; t.magFilter = LinearFilter;
  return t;
}
function speckle(ctx, w, h, n, rnd, alpha, light = false) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = light ? `rgba(255,255,255,${rnd() * alpha})` : `rgba(0,0,0,${rnd() * alpha})`;
    ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
  }
}

/** telhas cerâmicas: fileiras com variação de cor; devolve [mapa de cor, mapa de relevo] */
export function roofTiles() {
  const W = 512, H = 512, rows = 10, cols = 8, rnd = seeded(7);
  const c = canvas(W, H), b = canvas(W, H);
  const x = c.getContext('2d'), y = b.getContext('2d');
  x.fillStyle = '#6e2f20'; x.fillRect(0, 0, W, H); y.fillStyle = '#000'; y.fillRect(0, 0, W, H);
  const th = H / rows, tw = W / cols;
  for (let r = 0; r < rows; r++) {
    for (let k = -1; k <= cols; k++) {
      const off = (r % 2) * tw * 0.5;
      const px = k * tw + off, py = r * th;
      const v = rnd();
      const hue = 12 + v * 10, sat = 52 + rnd() * 14, lig = 34 + v * 12;
      const g = x.createLinearGradient(0, py, 0, py + th * 1.25);
      g.addColorStop(0, `hsl(${hue},${sat}%,${lig + 6}%)`); g.addColorStop(0.7, `hsl(${hue},${sat}%,${lig}%)`); g.addColorStop(1, `hsl(${hue},${sat}%,${lig - 14}%)`);
      x.fillStyle = g; x.beginPath(); x.roundRect(px + 2, py, tw - 4, th * 1.22, [3, 3, tw * 0.45, tw * 0.45]); x.fill();
      x.strokeStyle = 'rgba(30,10,5,.55)'; x.lineWidth = 2; x.stroke();
      const gb = y.createLinearGradient(0, py, 0, py + th * 1.25);
      gb.addColorStop(0, '#444'); gb.addColorStop(0.8, '#fff'); gb.addColorStop(1, '#111');
      y.fillStyle = gb; y.beginPath(); y.roundRect(px + 2, py, tw - 4, th * 1.22, [3, 3, tw * 0.45, tw * 0.45]); y.fill();
    }
  }
  speckle(x, W, H, 1800, rnd, 0.28); speckle(x, W, H, 500, rnd, 0.12, true);
  return [tex(c), tex(b, 1, 1, false)];
}

/** reboco claro com leve sujeira */
export function plaster(base = '#e8e0d2') {
  const W = 256, c = canvas(W, W), x = c.getContext('2d'), rnd = seeded(11);
  x.fillStyle = base; x.fillRect(0, 0, W, W);
  speckle(x, W, W, 5000, rnd, 0.07); speckle(x, W, W, 2500, rnd, 0.1, true);
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(80,70,55,${rnd() * 0.035})`; x.fillRect(rnd() * W, 0, 6 + rnd() * 24, W); }
  return tex(c);
}

export function concrete() {
  const W = 256, c = canvas(W, W), x = c.getContext('2d'), rnd = seeded(5);
  x.fillStyle = '#7d8790'; x.fillRect(0, 0, W, W);
  speckle(x, W, W, 6000, rnd, 0.22); speckle(x, W, W, 3000, rnd, 0.14, true);
  return tex(c);
}

export function wood() {
  const W = 256, c = canvas(W, W), x = c.getContext('2d'), rnd = seeded(3);
  x.fillStyle = '#6b4630'; x.fillRect(0, 0, W, W);
  for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${rnd() > 0.5 ? '30,16,8' : '150,100,60'},${0.08 + rnd() * 0.18})`; x.lineWidth = 1 + rnd() * 2; const px = rnd() * W; x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + rnd() * 10 - 5, 80, px + rnd() * 10 - 5, 170, px + rnd() * 6 - 3, W); x.stroke(); }
  return tex(c);
}

/** porta de garagem em painéis */
export function garage() {
  const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d');
  x.fillStyle = '#9aa5ae'; x.fillRect(0, 0, W, H);
  const n = 5, ph = H / n;
  for (let i = 0; i < n; i++) {
    const g = x.createLinearGradient(0, i * ph, 0, (i + 1) * ph); g.addColorStop(0, '#b7c0c8'); g.addColorStop(1, '#8b969f');
    x.fillStyle = g; x.fillRect(4, i * ph + 3, W - 8, ph - 6);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, (i + 1) * ph - 3, W, 3);
  }
  return tex(c);
}

export function grass() {
  const W = 512, c = canvas(W, W), x = c.getContext('2d'), rnd = seeded(13);
  x.fillStyle = '#2b5a33'; x.fillRect(0, 0, W, W);
  for (let i = 0; i < 9000; i++) { const g = 30 + rnd() * 50; x.fillStyle = `rgba(${22 + rnd() * 26},${g + 62},${26 + rnd() * 20},${0.25 + rnd() * 0.5})`; x.fillRect(rnd() * W, rnd() * W, 1, 2 + rnd() * 4); }
  return tex(c, 6, 6);
}

/** corte do solo (lateral da plataforma): camadas */
export function soilSide() {
  const W = 256, H = 128, c = canvas(W, H), x = c.getContext('2d'), rnd = seeded(17);
  const layers = [['#2c4a2a', 0.1], ['#4a3624', 0.3], ['#5e4630', 0.28], ['#3d3a38', 0.32]];
  let y = 0;
  for (const [col, h] of layers) { x.fillStyle = col; x.fillRect(0, y, W, h * H + 1); y += h * H; }
  speckle(x, W, H, 3500, rnd, 0.3); speckle(x, W, H, 1200, rnd, 0.15, true);
  const t = tex(c, 8, 1); return t;
}

export function stoneTiles() {
  const W = 256, c = canvas(W, W), x = c.getContext('2d'), rnd = seeded(23);
  x.fillStyle = '#4a5058'; x.fillRect(0, 0, W, W);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { x.fillStyle = `hsl(210,8%,${44 + rnd() * 12}%)`; x.fillRect(k * 64 + 3, r * 64 + 3, 58, 58); }
  speckle(x, W, W, 1500, rnd, 0.2);
  return tex(c);
}

/** mancha de umidade sob o beiral (alpha) */
export function stain() {
  const W = 256, H = 128, c = canvas(W, H), x = c.getContext('2d'), rnd = seeded(29);
  const g = x.createRadialGradient(W / 2, 0, 4, W / 2, 0, W * 0.55);
  g.addColorStop(0, 'rgba(25,32,30,.85)'); g.addColorStop(0.55, 'rgba(30,38,34,.5)'); g.addColorStop(1, 'rgba(30,38,34,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(20,28,22,${0.15 + rnd() * 0.35})`; x.beginPath(); x.arc(W / 2 + (rnd() - 0.5) * W * 0.7, rnd() * H * 0.7, 0.8 + rnd() * 2.4, 0, 6.28); x.fill(); }
  return tex(c, 1, 1);
}

/** janela vista de fora: interior quente com cortina e luminária */
export function windowGlow() {
  const W = 128, H = 128, c = canvas(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffe6b0'); g.addColorStop(1, '#ffb866');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,248,230,.55)'; x.fillRect(0, 0, 26, H); x.fillRect(W - 26, 0, 26, H);
  x.fillStyle = 'rgba(120,70,30,.28)'; x.fillRect(0, H * 0.72, W, H * 0.28);
  x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc(W * 0.7, H * 0.38, 9, 0, 6.28); x.fill();
  return tex(c);
}

export function glowSprite() {
  const c = canvas(128, 128), x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,214,150,.95)'); g.addColorStop(0.35, 'rgba(255,190,110,.35)'); g.addColorStop(1, 'rgba(255,170,90,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return tex(c);
}
