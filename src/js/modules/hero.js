// HERO — a casa 3D carrega depois da primeira pintura; o pôster aparece na hora.
// Controles (Garoa / Chuva / Temporal e Barreira ligada/desligada) só reagem a clique ou toque.
import { $, $$, reduceMotion, lite, watchVisible } from '../lib/dom.js';

const NOTES = {
  on: 'Com a barreira, a água fica lá fora.',
  off: 'Sem a barreira, a água entra: o telhado encharca, a calha transborda e nasce a goteira.',
};

function webgl() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}

export function initHero({ gsap }) {
  const hero = $('[data-hero]');
  if (!hero) return;
  const stage = $('.hero-stage', hero);
  const mount = $('.house-mount', stage);
  const panel = $('.weather', stage);
  const note = $('[data-note]', stage);
  const rest = $$('[data-gated]', hero);

  // entrada: textos aparecem em "pincelada"; o título já anima por CSS
  // a casa 3D só entra depois que a entrada dos textos termina (evita competir por quadros)
  let introDone = Promise.resolve();
  if (reduceMotion) { document.documentElement.classList.add('ready'); }
  else {
    gsap.set(rest, { clipPath: 'inset(0 100% 0 0)' });
    document.documentElement.classList.add('ready');
    introDone = new Promise((res) => {
      gsap.to(rest, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, stagger: 0.12, ease: 'power3.inOut', delay: 0.5, clearProps: 'clipPath', onComplete: res });
      setTimeout(res, 4500);
    });
  }

  // ----- controles -----
  const want = { weather: 'chuva', barrier: true };
  let ctrl = null;
  const sync = () => {
    $$('[data-wx]', panel).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wx === want.weather)));
    $$('[data-barrier]', panel).forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.barrier === 'on') === want.barrier)));
    note.textContent = want.barrier ? NOTES.on : NOTES.off;
    stage.classList.toggle('is-open', !want.barrier);
    if (ctrl) { ctrl.setWeather(want.weather); ctrl.setBarrier(want.barrier); }
  };
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.wx) want.weather = b.dataset.wx;
    if (b.dataset.barrier) want.barrier = b.dataset.barrier === 'on';
    sync();
  });

  // ----- 3D sob demanda -----
  const ok = !reduceMotion && !lite && webgl() && !new URLSearchParams(location.search).has('nogl');
  if (!ok) { stage.classList.add('is-static'); return; }

  const load = () => {
    const s = document.createElement('script');
    s.src = stage.dataset.houseSrc; s.async = true;
    s.onload = () => {
      try {
        ctrl = window.IsraelHouse.mount(mount, { weather: want.weather, barrier: want.barrier });
      } catch (err) { stage.classList.add('is-static'); return; }
      ctrl.onFlash((v) => stage.style.setProperty('--flash', v.toFixed(3)));
      watchVisible(hero, (v) => ctrl.setActive(v), '0px');
      stage.classList.add('is-3d');
      panel.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add('is-live')));
      sync();
    };
    s.onerror = () => stage.classList.add('is-static');
    document.head.appendChild(s);
  };
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 400));
  const loaded = new Promise((res) => (document.readyState === 'complete' ? res() : addEventListener('load', res, { once: true })));
  Promise.all([loaded, introDone]).then(go);
}
