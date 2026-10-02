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
    let msg = 'Atendendo agora · até as 17h';
    if (!open) msg = `Respondemos ${work && min < 7 * 60 + 30 ? 'hoje' : wd >= 1 && wd <= 4 ? 'amanhã' : 'segunda'} a partir das 7h30`;
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

// ---------- carrosséis (fotos e avaliações): a rolagem é do navegador; aqui só botões, pontos e rótulos de acessibilidade ----------
$$('[data-car]').forEach((car) => {
  const track = $('.car-track', car);
  const slides = track ? [...track.children] : [];
  if (slides.length < 2) return;
  car.setAttribute('role', 'region');
  car.setAttribute('aria-roledescription', 'carrossel');
  slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} de ${slides.length}`));

  const mk = (cls, label) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label); return b; };
  const prev = mk('car-btn car-prev', 'Anterior');
  const next = mk('car-btn car-next', 'Próximo');
  const dots = document.createElement('div');
  dots.className = 'car-dots';
  const ds = slides.map((_, i) => { const d = mk('car-dot', `Ir para ${i + 1} de ${slides.length}`); d.addEventListener('click', () => go(i)); dots.append(d); return d; });
  const ui = document.createElement('div');
  ui.className = 'car-ui';
  ui.append(prev, dots, next);
  car.append(ui);

  const idx = () => { let k = 0, best = Infinity; slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - track.scrollLeft); if (d < best) { best = d; k = i; } }); return k; };
  const mark = () => { const k = idx(); ds.forEach((d, i) => d.setAttribute('aria-current', String(i === k))); };
  const go = (i) => { const n = slides.length; track.scrollTo({ left: slides[((i % n) + n) % n].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); };
  prev.addEventListener('click', () => go(idx() - 1));
  next.addEventListener('click', () => go(idx() + 1));

  let tick = 0;
  track.addEventListener('scroll', () => { cancelAnimationFrame(tick); tick = requestAnimationFrame(mark); }, { passive: true });
  // o trilho só entra na ordem do Tab quando realmente rola (no desktop, as fotos de obras ficam lado a lado e não rolam)
  const sync = () => { track.tabIndex = track.scrollWidth > track.clientWidth + 1 ? 0 : -1; mark(); };
  if ('ResizeObserver' in window) new ResizeObserver(sync).observe(track); else addEventListener('resize', sync);
  sync();
});

// ---------- serviços: tocar no quadrado abre a explicação (<dialog> nativo: foco preso, Esc fecha) ----------
const root = document.documentElement;
$$('[data-dlg]').forEach((btn) => btn.addEventListener('click', () => {
  const d = document.getElementById(btn.dataset.dlg);
  if (!d) return;
  if (typeof d.showModal !== 'function') { const a = $('.dlg-cta a', d); if (a) window.open(a.href, '_blank', 'noopener'); return; } // navegador antigo: vai direto ao WhatsApp
  d.showModal();
  root.classList.add('dlg-open');
  history.pushState({ dlg: d.id }, ''); // o botão "voltar" do celular fecha a janela em vez de sair do site
}));
$$('.dlg').forEach((d) => {
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); }); // toque fora ou em Voltar/X
  d.addEventListener('close', () => { root.classList.remove('dlg-open'); if (history.state && history.state.dlg === d.id) history.back(); });
});
addEventListener('popstate', () => { const o = $('.dlg[open]'); if (o) o.close(); });

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
