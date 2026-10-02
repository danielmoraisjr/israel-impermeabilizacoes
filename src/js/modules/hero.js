// HERO — a casa se desenha, o arco da marca fecha em volta e só então a chuva começa.
// A água bate no arco e se espalha: o arco acende onde é atingido.
import { $, $$, mq, reduceMotion, lite, watchVisible, finePointer } from '../lib/dom.js';
import { createRain } from '../lib/rain.js';

const N = 120; // trechos do arco que guardam "energia" de impacto

export function initHero({ gsap, ScrollTrigger }) {
  const hero = $('[data-hero]');
  if (!hero) return;
  const canvas = $('.hero-rain', hero);
  const svg = $('.hero-svg', hero);
  const rest = $$('[data-gated]', hero);
  const lines = $$('.h-lines .d', svg);
  const win = $('.h-win', svg);
  const hatch = $('.h-hatch', svg);

  const S = { dome: reduceMotion ? 1 : 0, rain: 0 };
  const energy = new Float32Array(N);
  const g = { cx: 0, cy: 0, R: 0, gx0: 0, gx1: 0 };
  const small = mq('(max-width: 760px)');
  const stacked = mq('(max-width: 1000px)');

  function geometry() {
    const c = canvas.getBoundingClientRect();
    const r = svg.getBoundingClientRect();
    const s = r.width / 800;
    g.cx = r.left - c.left + 400 * s;
    g.cy = r.top - c.top + 620 * s;
    g.R = 330 * s;
    g.gx0 = r.left - c.left + 10 * s;
    g.gx1 = r.left - c.left + 790 * s;
  }

  const rain = createRain(canvas, {
    areaPerDrop: small.matches ? 4300 : 2500,
    maxDpr: small.matches ? 1.5 : 1.75,
    // a chuva fica discreta atrás do texto e plena sobre a casa
    mask(ctx, w, h) {
      const g = stacked.matches ? ctx.createLinearGradient(0, 0, 0, h) : ctx.createLinearGradient(0, 0, w, 0);
      const [a, b] = stacked.matches ? [0.42, 0.68] : [0.3, 0.58];
      g.addColorStop(0, 'rgba(0,0,0,.3)'); g.addColorStop(a, 'rgba(0,0,0,.3)'); g.addColorStop(b, '#000'); g.addColorStop(1, '#000');
      return g;
    },
    collide(d) {
      if (d.y < g.cy) {
        const dx = d.x - g.cx, dy = d.y - g.cy;
        const dist = Math.hypot(dx, dy);
        if (dist < g.R && dist > g.R * 0.5) {
          const nx = dx / dist, ny = dy / dist;
          return { x: g.cx + nx * g.R, y: g.cy + ny * g.R, nx, ny, kind: 'bounce', ang: Math.atan2(dy, dx) };
        }
        return null;
      }
      if (d.x > g.gx0 && d.x < g.gx1) return { x: d.x, y: g.cy, nx: 0, ny: -1, kind: 'absorb' };
      return null;
    },
    onHit(hit) {
      if (hit.ang === undefined) return;
      const i = Math.min(N - 1, Math.max(0, Math.floor(((hit.ang + Math.PI) / Math.PI) * N)));
      energy[i] = Math.min(1, energy[i] + 0.4);
      if (i > 0) energy[i - 1] = Math.min(1, energy[i - 1] + 0.16);
      if (i < N - 1) energy[i + 1] = Math.min(1, energy[i + 1] + 0.16);
    },
    draw(ctx, dt) {
      // o arco: linha fina que se desenha e acende onde a chuva bate
      const a0 = Math.PI;
      ctx.lineCap = 'round';
      if (S.dome > 0.001) {
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(47,200,255,.62)';
        ctx.beginPath();
        ctx.arc(g.cx, g.cy, g.R, a0, a0 + Math.PI * S.dome);
        ctx.stroke();
        if (S.dome < 0.999) {
          const t = a0 + Math.PI * S.dome;
          ctx.fillStyle = '#8fe3ff';
          ctx.beginPath();
          ctx.arc(g.cx + Math.cos(t) * g.R, g.cy + Math.sin(t) * g.R, 3.2, 0, 6.2832);
          ctx.fill();
        }
      }
      const k = Math.exp(-dt * 3.4);
      for (let i = 0; i < N; i++) {
        const e = energy[i];
        if (e < 0.02) { energy[i] = 0; continue; }
        const s0 = a0 + (i / N) * Math.PI, s1 = a0 + ((i + 1.4) / N) * Math.PI;
        ctx.lineWidth = 2 + e * 6;
        ctx.strokeStyle = `rgba(143,227,255,${(e * 0.85).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(g.cx, g.cy, g.R, s0, s1);
        ctx.stroke();
        energy[i] = e * k;
      }
    },
  });

  function layout() { rain.resize(); geometry(); if (reduceMotion || lite) { rain.still(small.matches ? 40 : 80); } }
  layout();
  addEventListener('resize', layout, { passive: true });
  document.fonts?.ready.then(layout);

  // ---- estado inicial e entrada ----
  const tick = () => rain.setIntensity(S.rain);

  if (reduceMotion || lite) {
    S.rain = 1; S.dome = 1;
    gsap.set(win, { opacity: 0.9 });
    rain.still(small.matches ? 40 : 80);
    document.documentElement.classList.add('ready');
  } else {
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(hatch, { opacity: 0 });
    gsap.set(win, { opacity: 0 });
    gsap.set(rest, { clipPath: 'inset(0 100% 0 0)' });
    document.documentElement.classList.add('ready');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(lines, { strokeDashoffset: 0, autoRound: false, duration: 1.5, stagger: 0.1, ease: 'power2.inOut' }, 0.05)
      .to(hatch, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.7)
      .to(rest, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, stagger: 0.12, ease: 'power3.inOut' }, 0.75)
      .to(S, { dome: 1, duration: 1.7, ease: 'power2.inOut' }, 1.15)
      .to(S, { rain: 1, duration: 1.8, ease: 'power1.in', onUpdate: tick }, 2.55)
      .to(win, { opacity: 0.92, duration: 1.4, ease: 'power1.inOut' }, 2.9)
      .set(rest, { clearProps: 'clipPath' });

    // chuva só enquanto o hero está na tela
    watchVisible(hero, (v) => rain.setVisible(v), '0px');

    // o vento acompanha o ponteiro: a chuva inclina para onde a pessoa olha
    if (finePointer) {
      hero.addEventListener('pointermove', (e) => {
        rain.setWindTarget((e.clientX / innerWidth - 0.5) * 220);
      }, { passive: true });
    }

    // o texto se afasta devagar quando a pessoa começa a rolar
    gsap.to($('.hero-in', hero), {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}
