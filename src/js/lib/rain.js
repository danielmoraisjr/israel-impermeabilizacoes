// Motor de chuva em canvas 2D.
// Cada cena entrega um "colisor": dado o ponto da gota, diz se ela bateu em algo
// ({x, y, nx, ny, kind}) e como reagir:
//   'bounce' → respinga e ricocheteia (barreira)      'absorb' → vira uma ondulação (superfície que bebe a água)
//   'kill'   → some sem efeito
// O motor só desenha enquanto a cena está visível.
import { clamp, lerp } from './dom.js';

export function createRain(canvas, opts = {}) {
  const o = {
    areaPerDrop: 2600, // px² por gota com intensidade 1 (maior = menos gotas)
    maxDpr: 1.75,
    speed: 1,
    fall: 1.0, // segundos que uma gota leva para atravessar a tela (define a taxa de nascimento)
    collide: () => null,
    draw: null, // gancho extra: (ctx, dt, w, h)
    mask: null, // (ctx, w, h) => gradiente: esmaece a chuva (feito no canvas, sem máscara CSS)
    ...opts,
  };
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  const drops = [], parts = [], rips = [];
  let intensity = 0, wind = 0, windTarget = 0, spawnAcc = 0;
  let color = [200, 228, 245];
  let visible = false, raf = 0, last = 0, wanted = false, maskGrad = null;

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    w = r.width; h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskGrad = o.mask ? o.mask(ctx, w, h) : null;
  }

  function spawn(initial) {
    const z = Math.random();
    const sp = lerp(560, 1100, z) * o.speed;
    const ang = (wind * 0.0016) + (Math.random() - 0.5) * 0.04; // inclinação lateral
    const len = lerp(8, 22, z);
    drops.push({
      x: Math.random() * (w + 160) - 80 - wind * 0.35,
      y: initial ? Math.random() * h : -len - Math.random() * 40,
      vx: Math.sin(ang) * sp, vy: Math.cos(ang) * sp, z, len,
    });
  }

  function splash(hit, d) {
    const n = 3 + ((Math.random() * 3) | 0);
    const dot = d.vx * hit.nx + d.vy * hit.ny;
    for (let i = 0; i < n; i++) {
      // reflexão suavizada + um pouco de abertura lateral
      let vx = (d.vx - 2 * dot * hit.nx) * lerp(0.1, 0.26, Math.random()) + (Math.random() - 0.5) * 150;
      let vy = (d.vy - 2 * dot * hit.ny) * lerp(0.1, 0.26, Math.random()) + (Math.random() - 0.5) * 60;
      if (vx * hit.nx + vy * hit.ny < 30) { vx += hit.nx * 90; vy += hit.ny * 90; }
      parts.push({ x: hit.x, y: hit.y, vx, vy, age: 0, life: 0.32 + Math.random() * 0.36, r: 0.8 + Math.random() * 0.9 });
    }
  }

  function step(dt) {
    // nascimento proporcional à intensidade
    const cap = (w * h) / o.areaPerDrop;
    spawnAcc += (cap * intensity / o.fall) * dt;
    while (spawnAcc >= 1) { spawn(false); spawnAcc -= 1; }
    wind += (windTarget - wind) * Math.min(1, dt * 2.2);

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.x += d.vx * dt; d.y += d.vy * dt;
      const hit = o.collide(d);
      if (hit) {
        if (hit.kind === 'bounce') splash(hit, d);
        else if (hit.kind === 'absorb') rips.push({ x: hit.x, y: hit.y, age: 0, life: 0.5 });
        if (o.onHit) o.onHit(hit);
        drops[i] = drops[drops.length - 1]; drops.pop();
      } else if (d.y > h + 30 || d.x < -120 || d.x > w + 120) {
        drops[i] = drops[drops.length - 1]; drops.pop();
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      if (p.age >= p.life) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
      p.vy += 1500 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (let i = rips.length - 1; i >= 0; i--) {
      rips[i].age += dt;
      if (rips[i].age >= rips[i].life) { rips[i] = rips[rips.length - 1]; rips.pop(); }
    }
  }

  function render(dt) {
    ctx.clearRect(0, 0, w, h);
    const [r, g, b] = color;
    // gotas em três faixas de profundidade (um traçado por faixa)
    for (let band = 0; band < 3; band++) {
      const z0 = band / 3, z1 = (band + 1) / 3;
      const zc = (z0 + z1) / 2;
      ctx.beginPath();
      for (const d of drops) {
        if (d.z < z0 || d.z >= z1) continue;
        const sp = Math.hypot(d.vx, d.vy);
        ctx.moveTo(d.x - (d.vx / sp) * d.len, d.y - (d.vy / sp) * d.len);
        ctx.lineTo(d.x, d.y);
      }
      ctx.lineWidth = lerp(0.8, 1.5, zc);
      ctx.strokeStyle = `rgba(${r},${g},${b},${lerp(0.14, 0.42, zc).toFixed(3)})`;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    // respingos
    if (parts.length) {
      for (const p of parts) {
        const a = 1 - p.age / p.life;
        ctx.fillStyle = `rgba(${r},${g},${b},${(a * 0.8).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
    }
    // ondulações
    if (rips.length) {
      ctx.lineWidth = 1;
      for (const p of rips) {
        const t = p.age / p.life;
        ctx.strokeStyle = `rgba(${r},${g},${b},${((1 - t) * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 2 + t * 13, 0.6 + t * 2.6, 0, 0, 6.2832);
        ctx.stroke();
      }
    }
    if (maskGrad) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = maskGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (o.draw) o.draw(ctx, dt, w, h);
  }

  function frame(t) {
    raf = 0;
    if (!visible) return;
    const dt = clamp((t - last) / 1000, 0, 0.034);
    last = t;
    step(dt);
    render(dt);
    raf = requestAnimationFrame(frame);
  }

  // só anima quando a cena está na tela E a aba está visível
  function sync() {
    const on = wanted && !document.hidden;
    if (on === visible) return;
    visible = on;
    if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  document.addEventListener('visibilitychange', sync);

  const api = {
    resize,
    setIntensity(v) { intensity = clamp(v); },
    setColor(c) { color = c; },
    setWindTarget(v) { windTarget = v; },
    get size() { return { w, h }; },
    setVisible(v) {
      wanted = v;
      sync();
    },
    /** um quadro parado (movimento reduzido) */
    still(n = 70) {
      drops.length = 0;
      for (let i = 0; i < n; i++) spawn(true);
      render(0);
    },
    renderOnce() { render(0); },
    destroy() { visible = false; cancelAnimationFrame(raf); },
  };
  resize();
  return api;
}
