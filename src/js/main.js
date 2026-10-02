// Israel Impermeabilizações — JavaScript mínimo, sem bibliotecas.
// Tudo que é movimento fica no CSS; aqui só: menu, cabeçalho, ligação com o WhatsApp e duas revelações ao rolar.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WA = '5514997341789';
const hasIO = 'IntersectionObserver' in window;

// ---------- cabeçalho: ganha uma linha ao rolar ----------
const hdr = $('.hdr');
if (hdr && hasIO) {
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => hdr.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);
}

// ---------- menu do celular ----------
const burger = $('.burger');
const menu = $('#menu');
if (burger && menu) {
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 1000px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
}

// ---------- seção atual no menu ----------
if (hasIO) {
  const links = $$('.nav a');
  const set = (id) => links.forEach((l) => (l.getAttribute('href') === `#${id}` ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) set(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
  ['servicos', 'sistemas', 'obras', 'como-funciona', 'avaliacoes', 'contato'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  new IntersectionObserver(([e]) => { if (e.isIntersecting) set(''); }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#inicio'));
}

// ---------- botões flutuantes: fora do hero, do formulário e do contato ----------
const fab = $('.fab');
const dock = $('.dock');
if ((fab || dock) && hasIO) {
  const busy = new Set();
  const sync = () => [fab, dock].forEach((el) => el && el.classList.toggle('is-on', busy.size === 0));
  const watch = (sel, min) => {
    const el = $(sel);
    if (!el) return;
    new IntersectionObserver(([e]) => { e.intersectionRatio >= min ? busy.add(sel) : busy.delete(sel); sync(); }, { threshold: [0, 0.1, 0.25, 0.5] }).observe(el);
  };
  watch('#inicio', 0.25); watch('#orcamento', 0.1); watch('.foot', 0.1);
  watch('#contato', 0.1);
}

// ---------- revelar ao rolar: só as fotos reais e a linha do processo ----------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = $$('[data-rv]');
const proc = $('[data-proc]');
if (hasIO && !reduce) {
  reveals.forEach((el) => el.classList.add('rv'));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.3 });
  reveals.forEach((el) => io.observe(el));
  if (proc) io.observe(proc);
} else if (proc) proc.classList.add('in');

// ---------- formulário → mensagem pronta no WhatsApp ----------
const form = $('#form');
const note = $('#form-note');
if (form) {
  const openWA = (text) => {
    // link clicado de verdade: abre em nova aba sem ser barrado como pop-up
    const a = document.createElement('a');
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
    a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const nome = (f.get('nome') || '').toString().trim();
    const servico = (f.get('servico') || '').toString();
    const local = (f.get('local') || '').toString().trim();
    const msg = (f.get('msg') || '').toString().trim();
    const sinais = f.getAll('sinal');

    let ok = true;
    [['nome', nome], ['servico', servico]].forEach(([n, v]) => {
      form.elements[n].closest('.fld').classList.toggle('err', !v);
      if (!v) ok = false;
    });
    note.classList.toggle('is-err', !ok);
    if (!ok) { note.textContent = 'Preencha seu nome e o que precisa impermeabilizar.'; return; }
    note.textContent = 'Abrindo o WhatsApp…';

    const linhas = [`Olá! Meu nome é ${nome}.`, `Gostaria de um orçamento: ${servico}.`];
    if (local) linhas.push(`Local: ${local}.`);
    if (sinais.length) linhas.push(`O que estou vendo: ${sinais.join('; ')}.`);
    if (msg) linhas.push(msg);
    linhas.push('Vim pelo site.');
    openWA(linhas.join('\n'));
  });
  form.addEventListener('input', (e) => e.target.closest('.fld')?.classList.remove('err'));
}

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();
