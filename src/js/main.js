// Israel Impermeabilizações — ponto de entrada.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { initUI, initNav } from './modules/ui.js';
import { initHero } from './modules/hero.js';
import { initSigns } from './modules/signs.js';
import { initServices } from './modules/services.js';
import { initSystems, initProcess, initProof, initHeadings } from './modules/sections.js';
import { initForm } from './modules/forms.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const ctx = { gsap, ScrollTrigger, SplitText };
if (location.search.includes('debug')) Object.assign(window, { gsap, ScrollTrigger });

const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 700 }) : setTimeout(fn, 150));

function start() {
  // 1) o que aparece na primeira tela e o que responde a cliques: já
  initUI(ctx);
  initHero(ctx);
  initSigns();
  initServices(ctx);
  initForm();

  // 2) o resto em tarefas curtas, depois da primeira pintura (evita travar a thread principal)
  const stages = [
    () => { initSystems(ctx); initProcess(ctx); initProof(ctx); },
    () => initHeadings(ctx),
    () => initNav(ctx), // por último: depende da posição final das seções fixadas
  ];
  const done = new Promise((resolve) => {
    let i = 0;
    const next = () => (i < stages.length ? idle(() => { stages[i++](); next(); }) : resolve());
    requestAnimationFrame(() => setTimeout(next, 0));
  });

  // 3) medidas finais: uma única atualização, quando tudo (etapas, fontes e página) terminou
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
  Promise.all([done, loaded, document.fonts ? document.fonts.ready : null]).then(() => {
    ScrollTrigger.refresh();
    // link com âncora aberto de fora: reposiciona depois que as seções fixadas existem
    if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  });
  document.documentElement.classList.add('ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
