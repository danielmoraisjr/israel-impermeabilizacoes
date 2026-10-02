// Interface global: cabeçalho, linha-guia, menu, navegação ativa, botões flutuantes e botões magnéticos.
import { $, $$, mq, reduceMotion, finePointer, clamp } from '../lib/dom.js';

export function initUI({ gsap, ScrollTrigger }) {
  const hdr = $('.hdr');
  const rail = $('.rail i');
  const burger = $('.burger');
  const menu = $('#menu');
  const fab = $('.fab');
  const dock = $('.dock');
  const body = document.body;
  const root = document.documentElement;

  $('#year').textContent = new Date().getFullYear();

  // ---- cabeçalho sólido depois do topo + linha-guia da barreira ----
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      hdr.classList.toggle('is-solid', y > 24);
      const max = root.scrollHeight - innerHeight;
      rail.style.setProperty('--p', max > 0 ? clamp(y / max).toFixed(4) : 0);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // ---- menu em tela cheia ----
  let lastFocus = null;
  function setMenu(open) {
    if (open === body.classList.contains('menu-open')) return;
    body.classList.toggle('menu-open', open);
    root.style.overflow = open ? 'hidden' : '';
    menu.inert = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) {
      lastFocus = document.activeElement;
      if (!reduceMotion) {
        gsap.fromTo('.menu-nav a', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'expo.out', delay: 0.25, clearProps: 'all' });
        gsap.fromTo('.menu-foot > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.5, clearProps: 'all' });
      }
      setTimeout(() => $('.menu-nav a')?.focus({ preventScroll: true }), 120);
    } else {
      (lastFocus || burger).focus?.({ preventScroll: true });
    }
  }
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  mq('(min-width: 1001px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // ---- âncoras: rolagem suave que respeita as seções fixadas ----
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    const wasOpen = body.classList.contains('menu-open');
    if (wasOpen) setMenu(false);
    const go = () => {
      const top = target.getBoundingClientRect().top + window.scrollY - (target.id === 'inicio' ? 0 : 0);
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', `#${target.id}`);
    };
    wasOpen ? setTimeout(go, 60) : go();
  });

  // ---- botões magnéticos (só com mouse) ----
  if (finePointer && !reduceMotion) {
    $$('.btn-lg, .hdr-cta, .fab').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        qx(clamp((e.clientX - (r.left + r.width / 2)) * 0.14, -6, 6));
        qy(clamp((e.clientY - (r.top + r.height / 2)) * 0.2, -5, 5));
      });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }
}

/** Gatilhos que dependem da posição final das seções (criar depois das seções fixadas). */
export function initNav({ ScrollTrigger }) {
  const body = document.body;
  const fab = $('.fab');
  const dock = $('.dock');
  // ---- navegação ativa (aria-current) ----
  const links = $$('.nav a');
  const setCurrent = (id) => links.forEach((l) => {
    if (l.getAttribute('href') === `#${id}`) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
  });
  ['barreira', 'servicos', 'como-funciona', 'avaliacoes', 'contato'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({ trigger: el, start: 'top 45%', end: 'bottom 45%', onToggle: (s) => s.isActive && setCurrent(id) });
  });
  ScrollTrigger.create({ trigger: '#inicio', start: 'top top', end: 'bottom 45%', onToggle: (s) => s.isActive && setCurrent('') });

  // ---- botões flutuantes: depois do hero, fora da cena fixa e do formulário ----
  const flags = { past: false, end: new Set(), scene: false };
  const syncFloat = () => {
    const show = flags.past && !flags.end.size && !flags.scene;
    fab?.classList.toggle('is-on', show);
    dock?.classList.toggle('is-on', show);
  };
  ScrollTrigger.create({ trigger: '#barreira', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => { flags.scene = s.isActive; syncFloat(); } });
  ScrollTrigger.create({ trigger: '#inicio', start: 'bottom 70%', onToggle: (s) => { flags.past = s.isActive || s.progress === 1; syncFloat(); }, onLeaveBack: () => { flags.past = false; syncFloat(); }, end: 'max' });
  // do formulário até o fim da página os botões flutuantes saem de cena
  ScrollTrigger.create({ trigger: '#orcamento', start: 'top 85%', endTrigger: 'main', end: 'bottom bottom', onToggle: (s) => { s.isActive ? flags.end.add('fim') : flags.end.delete('fim'); syncFloat(); } });

}
