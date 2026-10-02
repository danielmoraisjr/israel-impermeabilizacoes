// SINAIS — marcar um sintoma faz a parede ilustrada mostrar como ele costuma aparecer
// e monta a mensagem de WhatsApp com o que a pessoa marcou.
import { $, $$, seeded } from '../lib/dom.js';
import { waUrl } from '../lib/wa.js';

export function initSigns() {
  const wall = $('[data-wall]');
  const checks = $$('.checks input');
  const cta = $('#sinais-cta');
  if (!checks.length || !cta) return;

  // mofo: pontos finos, mais densos no centro de cada foco (semente fixa)
  let built = false;
  const buildMold = () => {
    if (built) return;
    built = true;
    const mold = $('[data-mold]', wall);
    if (!mold) return;
    const rnd = seeded(23);
    const ns = 'http://www.w3.org/2000/svg';
    [[150, 46, 74, 34, 70], [96, 26, 40, 20, 34], [470, 40, 62, 28, 56], [236, 372, 96, 26, 64], [120, 380, 40, 14, 22]].forEach(([cx, cy, rx, ry, n]) => {
      for (let i = 0; i < n; i++) {
        const a = rnd() * 6.283, d = (rnd() + rnd() + rnd()) / 3 * 1.5; // concentra no centro
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', (cx + Math.cos(a) * d * rx).toFixed(1));
        dot.setAttribute('cy', (cy + Math.sin(a) * d * ry).toFixed(1));
        dot.setAttribute('r', (0.6 + rnd() * rnd() * 3).toFixed(1));
        dot.setAttribute('opacity', (0.35 + rnd() * 0.55).toFixed(2));
        if (rnd() > 0.7) dot.setAttribute('fill', '#4d5f3a');
        mold.appendChild(dot);
      }
    });
  };

  const label = $('.btn-t', cta);
  const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}` : a[0]);
  const update = () => {
    const on = checks.filter((i) => i.checked);
    const has = (k) => on.some((i) => i.dataset.signFor === k);
    if (has('mofo')) buildMold();
    $$('.sg', wall).forEach((g) => g.classList.toggle('on', has(g.dataset.sign)));
    $$('.tag-w').forEach((t) => t.classList.toggle('is-on', has(t.dataset.for)));
    const base = 'Olá! Estou com problema de infiltração e gostaria de um orçamento.';
    const vals = on.map((i) => i.value);
    cta.href = waUrl(vals.length ? `${base} Estou vendo: ${list(vals)}.` : base);
    label.textContent = vals.length ? `Enviar ${vals.length} ${vals.length > 1 ? 'sinais' : 'sinal'} no WhatsApp` : 'Enviar no WhatsApp';
  };
  checks.forEach((i) => i.addEventListener('change', update));
  update();
}
