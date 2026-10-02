// HERO — a casa é uma imagem leve; os botões só trocam de imagem (clima e barreira), sem WebGL nem animação contínua.
// Só reage a clique/toque. As imagens dos outros estados são buscadas na hora do clique (ou em ocioso, se a conexão for boa).
import { $, $$, reduceMotion } from '../lib/dom.js';

const NOTES = {
  on: 'Com a barreira, a água fica lá fora.',
  off: 'Sem a barreira, a água entra: o telhado encharca e nasce a goteira.',
};
const ALT = {
  on: 'Casa protegida por uma bolha azul enquanto chove: a água escorre pela bolha e não chega ao telhado',
  off: 'Casa sem proteção sob chuva: o telhado encharca e aparecem manchas de umidade nas paredes',
};

export function initHero({ gsap }) {
  const hero = $('[data-hero]');
  if (!hero) return;
  const stage = $('.hero-stage', hero);
  const panel = $('.weather', stage);
  const note = $('[data-note]', stage);
  const rest = $$('[data-gated]', hero);

  // entrada: textos aparecem em "pincelada"; o título já anima por CSS
  if (reduceMotion) { document.documentElement.classList.add('ready'); }
  else {
    gsap.set(rest, { clipPath: 'inset(0 100% 0 0)' });
    document.documentElement.classList.add('ready');
    gsap.to(rest, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, stagger: 0.12, ease: 'power3.inOut', delay: 0.5, clearProps: 'clipPath' });
  }

  // ----- imagens por estado -----
  const base = stage.dataset.casa;
  const imgs = new Map();
  const first = $('.house-img', stage);
  imgs.set(first.dataset.state, first);
  const sizes = first.getAttribute('sizes');
  const make = (key) => {
    if (imgs.has(key)) return imgs.get(key);
    const im = new Image();
    im.className = 'house-img'; im.dataset.state = key; im.alt = ''; im.decoding = 'async';
    im.sizes = sizes; im.width = first.width; im.height = first.height;
    im.srcset = `${base}${key}-720.webp 720w, ${base}${key}-1100.webp 1100w`;
    im.src = `${base}${key}-720.webp`;
    stage.insertBefore(im, panel);
    imgs.set(key, im);
    return im;
  };

  const want = { weather: 'chuva', barrier: true };
  let shown = first, token = 0;
  const show = (key) => {
    const my = ++token;
    const im = make(key);
    const go = () => {
      if (my !== token || im === shown) return;
      if (reduceMotion) im.style.transition = 'none';
      im.classList.add('is-on'); shown.classList.remove('is-on');
      shown.removeAttribute('alt'); shown.alt = '';
      shown = im; im.alt = want.barrier ? ALT.on : ALT.off;
    };
    // só troca quando a imagem já pode ser desenhada (sem piscar em branco)
    (im.complete ? Promise.resolve() : new Promise((r) => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); })).then(() => (im.decode ? im.decode().catch(() => {}) : null)).then(go);
  };

  const sync = () => {
    $$('[data-wx]', panel).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wx === want.weather)));
    $$('[data-barrier]', panel).forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.barrier === 'on') === want.barrier)));
    note.textContent = want.barrier ? NOTES.on : NOTES.off;
    show(`${want.weather}-${want.barrier ? 'on' : 'off'}`);
  };
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.wx) want.weather = b.dataset.wx;
    if (b.dataset.barrier) want.barrier = b.dataset.barrier === 'on';
    sync();
  });

  // conexão boa e sem economia de dados: deixa a "goteira" pronta quando o controle aparece na tela
  const net = navigator.connection;
  if (!(net && (net.saveData || /2g/.test(net.effectiveType || ''))) && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(() => make('chuva-off'), { timeout: 4000 });
    });
    addEventListener('load', () => io.observe(panel), { once: true });
  }
}
