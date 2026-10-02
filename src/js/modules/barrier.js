// A BARREIRA — o momento central do site.
// Uma laje em corte, fixada na tela. A rolagem conduz cinco estados:
//   chuva → infiltração → danos → barreira → protegido.
// Tudo é função do progresso (0–1) da timeline, então funciona de ida e volta.
import { $, $$, mq, reduceMotion, lerp, smooth, seg, seeded, watchVisible } from '../lib/dom.js';
import { createRain } from '../lib/rain.js';
import { sliceMap } from '../lib/svgmap.js';

const DY = 120; // o desenho foi feito com a laje em y=300 e depois deslocado para dar mais céu
const SLAB_BARE = 300 + DY; // topo da laje sem proteção
const SLAB_TOP = 262 + DY; // topo da proteção mecânica
const BEAT_AT = [0, 0.18, 0.4, 0.6, 0.84]; // onde cada passo do texto começa

const RAIN_DARK = [200, 228, 245];
const RAIN_LIGHT = [74, 122, 152];

export function initBarrier({ gsap, ScrollTrigger }) {
  const root = $('[data-barrier]');
  if (!root) return;
  const sheet = $('[data-sheet]', root);
  const svg = $('.sheet-svg', sheet);
  const canvas = $('.sheet-rain', sheet);
  const beats = $$('.beat', root);
  const meter = $$('.beat-meter i', root);
  const tags = $$('.tag', sheet);
  const cta = $('[data-beat-cta]', root);
  const drips = $('.sv-drips', svg);
  const stain = $('.sv-stain', svg);
  const mobile = mq('(max-width: 900px)');

  buildMold(svg);

  let map = sliceMap(svg);
  const state = { front: -100, p: 0 };
  const rain = createRain(canvas, {
    areaPerDrop: mobile.matches ? 1700 : 1900,
    maxDpr: mobile.matches ? 1.5 : 1.75,
    speed: mobile.matches ? 0.85 : 1,
    collide(d) {
      const ux = (d.x - map.ox) / map.s;
      if (ux <= state.front) {
        const y = map.Y(SLAB_TOP);
        if (d.y >= y) return { x: d.x, y, nx: 0, ny: -1, kind: 'bounce' };
      } else {
        const y = map.Y(SLAB_BARE);
        if (d.y >= y) return { x: d.x, y, nx: 0, ny: -1, kind: 'absorb' };
      }
      return null;
    },
  });

  function place() {
    map = sliceMap(svg);
    rain.resize();
    for (const t of tags) {
      t.style.setProperty('--tx', `${map.X(+t.dataset.x)}px`);
      t.style.setProperty('--ty', `${map.Y(+t.dataset.y + DY)}px`);
      // etiquetas verticais não podem vazar da prancha: o "chip" desliza, a bolinha fica no ponto
      if (t.dataset.side === 'u' || t.dataset.side === 'd') {
        const half = (t.offsetWidth || 0) / 2;
        const x = map.X(+t.dataset.x);
        const shift = Math.max(6 - (x - half), 0) - Math.max(x + half - (map.w - 6), 0);
        t.style.setProperty('--sx', `${shift}px`);
      }
    }
  }
  place();
  addEventListener('resize', place, { passive: true });
  ScrollTrigger.addEventListener('refresh', place);

  // ---------------- versão estática (movimento reduzido) ----------------
  if (reduceMotion) {
    root.classList.add('is-static');
    gsap.set('.sv-crack-w', { opacity: 0 });
    state.front = 1200;
    rain.setColor(RAIN_LIGHT);
    rain.setIntensity(0);
    place();
    rain.still(mobile.matches ? 30 : 60);
    tags.forEach((t) => t.classList.toggle('is-on', t.classList.contains('tag-b')));
    beats.forEach((b) => b.classList.add('is-active'));
    return;
  }

  // ---------------- estado inicial ----------------
  gsap.set($$('.cp-a, .cp-b', svg), { attr: { width: 0 } });
  gsap.set('.sv-crack-w', { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1 });
  gsap.set($$('.sv-pores, .sv-hair, .sv-film, .sv-wet', svg), { opacity: 0 });
  gsap.set(stain, { opacity: 1 });
  gsap.set('.cp-s', { attr: { r: 0 } });
  gsap.set($$('.sv-mold circle', svg), { opacity: 0 });

  // ---------------- a timeline (0 → 1) ----------------
  const ease = gsap.parseEase('power1.inOut');
  const len = () => (mobile.matches ? 3.3 : 4.4) * window.innerHeight;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${len()}`,
      pin: $('.barrier-pin', root),
      anticipatePin: 1,
      scrub: 0.7,
      invalidateOnRefresh: true,
      onToggle: (self) => document.body.classList.toggle('in-pin', self.isActive),
    },
    onUpdate: update,
  });

  tl.fromTo('.sv-film', { opacity: 0 }, { opacity: 0.85, duration: 0.08 }, 0.06)
    .fromTo('.sv-pores', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.1)
    .fromTo('.sv-hair', { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.14)
    .fromTo('.sv-crack-w', { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 0.18 }, 0.18)
    .fromTo('.sv-wet', { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.24)
    .fromTo('.cp-s', { attr: { r: 0 } }, { attr: { r: 300 }, duration: 0.16, ease: 'power1.out' }, 0.36)
    .fromTo('.sv-mold circle', { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: { each: 0.0012 } }, 0.46)
    // a barreira é aplicada da esquerda para a direita
    .to('.sv-film', { opacity: 0, duration: 0.08 }, 0.62)
    .to('.cp-a', { attr: { width: 1200 }, duration: 0.2, ease: 'power1.inOut' }, 0.6)
    .to('.cp-b', { attr: { width: 1200 }, duration: 0.2, ease: 'power1.inOut' }, 0.64)
    // ...e o imóvel seca
    .to('.sv-crack-w', { strokeDashoffset: -1, autoRound: false, duration: 0.08 }, 0.7)
    .to('.sv-wet', { opacity: 0, duration: 0.1 }, 0.7)
    .to('.sv-pores', { opacity: 0, duration: 0.06 }, 0.72)
    .to(stain, { opacity: 0, duration: 0.14 }, 0.72)
    .to({}, { duration: 0 }, 1); // fixa a duração em 1

  // ---------------- estado derivado do progresso ----------------
  let lastBeat = -1, lastTone = -1, lastDrip = null;
  const tagState = new Map();

  function update() {
    const p = tl.progress();
    state.p = p;
    state.front = -100 + 1200 * ease(seg(p, 0.64, 0.84));

    // tom: 0 = problema (escuro), 1 = protegido (claro)
    const tone = smooth(seg(p, 0.84, 0.95));
    if (Math.abs(tone - lastTone) > 0.003) {
      lastTone = tone;
      root.style.setProperty('--tone', tone.toFixed(3));
      rain.setColor(RAIN_DARK.map((v, i) => Math.round(lerp(v, RAIN_LIGHT[i], tone))));
    }

    // chuva: garoa → temporal; depois continua lá fora, mais calma
    const base = lerp(0.38, 1, smooth(seg(p, 0, 0.16)));
    rain.setIntensity(p > 0.8 ? lerp(1, 0.55, smooth(seg(p, 0.8, 0.95))) : base);

    // texto
    let idx = 0;
    for (let i = 0; i < BEAT_AT.length; i++) if (p >= BEAT_AT[i]) idx = i;
    if (idx !== lastBeat) {
      lastBeat = idx;
      beats.forEach((b, i) => b.classList.toggle('is-active', i === idx));
      meter.forEach((m, i) => m.classList.toggle('on', i <= idx));
      if (cta) cta.tabIndex = idx === 4 ? 0 : -1;
    }

    // goteira
    const dripOn = p >= 0.46 && p < 0.7;
    if (dripOn !== lastDrip) { lastDrip = dripOn; drips.classList.toggle('on', dripOn); }

    // etiquetas técnicas
    const on = (el, v) => { if (tagState.get(el) !== v) { tagState.set(el, v); el.classList.toggle('is-on', v); } };
    tags.forEach((t) => {
      const key = t.textContent.trim();
      if (key === 'Infiltração') on(t, p >= 0.3 && p < 0.7);
      else if (key === 'Mancha de umidade') on(t, p >= 0.44 && p < 0.7);
      else if (key === 'Mofo') on(t, p >= 0.52 && p < 0.7);
      else on(t, p >= 0.8);
    });
  }
  update();

  // chuva só quando a prancha está na tela
  watchVisible(sheet, (v) => rain.setVisible(v), '0px');
  if (cta) cta.tabIndex = -1;
}

// manchas de mofo: pontos com semente fixa dentro da mancha de umidade
function buildMold(svg) {
  const g = $('.sv-mold', svg);
  if (!g) return;
  const rnd = seeded(11);
  const ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 64; i++) {
    const a = rnd() * 6.283, d = Math.sqrt(rnd());
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', (506 + Math.cos(a) * d * 112).toFixed(1));
    c.setAttribute('cy', (490 + Math.sin(a) * d * 30).toFixed(1));
    c.setAttribute('r', (0.9 + rnd() * 3.7).toFixed(1));
    c.setAttribute('opacity', (0.35 + rnd() * 0.55).toFixed(2));
    if (rnd() > 0.7) c.setAttribute('fill', '#3b4d33');
    g.appendChild(c);
  }
}
