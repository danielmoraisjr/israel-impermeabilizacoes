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
  ['servicos', 'sistemas', 'como-funciona', 'obras', 'empresa', 'avaliacoes', 'contato'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  new IntersectionObserver(([e]) => { if (e.isIntersecting) set(''); }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#inicio'));
}

// ---------- botão flutuante do WhatsApp: aparece logo depois que a página abre ----------
const fab = $('.fab');
if (fab) setTimeout(() => fab.classList.add('is-on'), 700);

// ---------- horário de atendimento: em horário agora, ou quando abrimos (fuso de Brasília) ----------
const openEl = $('#open');
if (openEl) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    const min = +p.hour * 60 + +p.minute;
    const work = wd >= 1 && wd <= 5;
    const open = work && min >= 7 * 60 + 30 && min < 17 * 60;
    let msg = 'Em horário de atendimento · até as 17h';
    if (!open) msg = work && min < 7 * 60 + 30 ? 'Fora do horário · abrimos hoje às 7h30' : `Fora do horário · abrimos ${wd >= 1 && wd <= 4 ? 'amanhã' : 'segunda'} às 7h30`;
    openEl.classList.toggle('is-open', open);
    $('span', openEl).textContent = msg;
  } catch { /* sem Intl: fica o horário fixo do HTML */ }
}

// ---------- sinais de infiltração → mensagem pronta no WhatsApp ----------
const signs = $('#signs');
const signsCta = $('#signs-cta');
const signsLabel = $('#signs-label');
if (signs && signsCta) {
  signs.addEventListener('change', () => {
    const v = $$('input:checked', signs).map((i) => i.value);
    const text = v.length
      ? `Olá! Estou com estes sinais de infiltração: ${v.join('; ')}. Gostaria de um orçamento.`
      : 'Olá! Estou com problema de infiltração e gostaria de um orçamento.';
    signsCta.href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
    if (signsLabel) signsLabel.textContent = v.length ? `Enviar ${v.length} ${v.length > 1 ? 'sinais' : 'sinal'} no WhatsApp` : 'Enviar no WhatsApp';
  });
}

// ---------- revelar ao rolar: fotos reais, camadas dos sistemas e a linha do processo ----------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = $$('[data-rv]');
const proc = $('[data-proc]');
if (hasIO && !reduce) {
  reveals.forEach((el) => el.classList.add('rv'));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
  reveals.forEach((el) => io.observe(el));
  if (proc) io.observe(proc);
} else if (proc) proc.classList.add('in');

// ---------- formulário → mensagem pronta no WhatsApp ----------
const form = $('#form');
const note = $('#form-note');
if (form) {
  const openWA = (text) => {
    // link clicado de verdade: abre em nova aba sem ser barrado como pop-up
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    // se o navegador barrar ou o WhatsApp não abrir, a mensagem pronta continua a um toque
    const again = document.createElement('a');
    again.href = url; again.target = '_blank'; again.rel = 'noopener'; again.textContent = 'Não abriu? Toque aqui.';
    note.append(' ', again);
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const nome = (f.get('nome') || '').toString().trim();
    const servico = (f.get('servico') || '').toString();
    const local = (f.get('local') || '').toString().trim();
    const msg = (f.get('msg') || '').toString().trim();

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
    if (msg) linhas.push(msg);
    linhas.push('Vim pelo site.');
    openWA(linhas.join('\n'));
  });
  form.addEventListener('input', (e) => e.target.closest('.fld')?.classList.remove('err'));
}

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();
