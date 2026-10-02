// SERVIÇOS — prancha técnica: escolher um serviço desenha o corte e aplica a barreira.
// Em telas largas é uma lista + prancha; no celular vira acordeão. Só muda com clique ou toque.
import { $, $$, mq, reduceMotion } from '../lib/dom.js';

export function initServices({ gsap, ScrollTrigger }) {
  const root = $('[data-svcs]');
  if (!root) return;
  const items = $$('.svc', root);
  const wide = mq('(min-width: 901px)');

  // desenha o corte: traços estruturais, depois a barreira sendo aplicada, depois a água
  function draw(item) {
    if (reduceMotion) return;
    const svg = $('.svc-fig svg', item);
    if (!svg) return;
    const lines = $$('.s-line:not(.s-dash)', svg);
    const bars = $$('.s-bar', svg);
    const rest = $$('.s-pro, .s-water', svg);
    gsap.killTweensOf([...lines, ...bars, ...rest]);
    lines.forEach((l) => l.setAttribute('pathLength', '1'));
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(bars, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(rest, { opacity: 0 });
    gsap.timeline()
      .to(lines, { strokeDashoffset: 0, autoRound: false, duration: 0.9, stagger: 0.04, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 0)
      .to(rest, { opacity: 1, duration: 0.5, stagger: 0.05, clearProps: 'opacity' }, 0.55)
      .to(bars, { strokeDashoffset: 0, autoRound: false, duration: 1.1, stagger: 0.18, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 0.75);
  }

  function open(i, { toggle = false } = {}) {
    const wasOpen = items[i].classList.contains('is-open');
    const willOpen = toggle ? !wasOpen : true;
    items.forEach((it, k) => {
      const isOpen = k === i ? willOpen : false;
      it.classList.toggle('is-open', isOpen);
      $('.svc-btn', it).setAttribute('aria-expanded', String(isOpen));
    });
    if (willOpen && !wasOpen) draw(items[i]);
  }

  items.forEach((it, i) => {
    const btn = $('.svc-btn', it);
    btn.addEventListener('click', () => (wide.matches ? open(i) : open(i, { toggle: true })));
    btn.addEventListener('keydown', (e) => {
      if (!wide.matches || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      $('.svc-btn', items[n]).focus();
      open(n);
    });
  });

  // o primeiro corte se desenha quando a seção chega
  ScrollTrigger.create({ trigger: root, start: 'top 72%', once: true, onEnter: () => draw(items[0]) });
}
