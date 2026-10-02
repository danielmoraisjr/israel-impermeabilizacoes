// Animações com propósito das seções de conteúdo.
import { $, $$, mq, reduceMotion } from '../lib/dom.js';

/** SISTEMAS — as camadas são aplicadas de baixo para cima, como na obra */
export function initSystems({ gsap, ScrollTrigger }) {
  if (reduceMotion) return;
  $$('[data-sys]').forEach((sys) => {
    const layers = $$('.lay', sys).reverse(); // do concreto até o acabamento
    gsap.set(layers, { clipPath: 'inset(100% 0 0 0)' });
    ScrollTrigger.create({
      trigger: sys, start: 'top 72%', once: true,
      onEnter: () => gsap.to(layers, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, stagger: 0.17, ease: 'power3.inOut', clearProps: 'clipPath' }),
    });
  });
}

/** COMO FUNCIONA — a linha se aplica de uma etapa à seguinte */
export function initProcess({ ScrollTrigger }) {
  const steps = $$('.step');
  if (!steps.length) return;
  if (reduceMotion) { steps.forEach((s) => s.classList.add('is-on')); return; }
  const row = mq('(min-width: 561px)');
  steps.forEach((step, i) => {
    step.style.setProperty('--i', row.matches ? Math.min(i, 3) : 0);
    ScrollTrigger.create({
      trigger: step, start: row.matches ? 'top 78%' : 'top 82%',
      onEnter: () => step.classList.add('is-on'),
      onLeaveBack: () => step.classList.remove('is-on'),
    });
  });
}

/** AVALIAÇÕES — números que contam e filetes que se desenham */
export function initProof({ gsap, ScrollTrigger }) {
  $$('.quote').forEach((q) => {
    if (reduceMotion) { q.classList.add('is-in'); return; }
    ScrollTrigger.create({ trigger: q, start: 'top 86%', once: true, onEnter: () => q.classList.add('is-in') });
  });
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    if (reduceMotion) return;
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ','); } }),
    });
  });
}

/** Títulos: cada linha sobe de dentro de uma máscara (nada de fade genérico) */
export function initHeadings({ gsap, ScrollTrigger, SplitText }) {
  if (reduceMotion) return;
  $$('.sec h2, .sec .eyebrow').forEach((el) => {
    if (el.matches('.eyebrow')) {
      const no = $('.eb-no', el);
      gsap.from(el, {
        clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        clearProps: 'clipPath',
      });
      return;
    }
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 108, duration: 1.15, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}
