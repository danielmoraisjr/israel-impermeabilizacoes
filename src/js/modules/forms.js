// Formulário de orçamento → mensagem pronta no WhatsApp, e mapa carregado sob demanda.
import { $ } from '../lib/dom.js';
import { waUrl } from '../lib/wa.js';

export function initForm() {
  const form = $('#form');
  const note = $('#form-note');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const nome = (f.get('nome') || '').toString().trim();
    const servico = (f.get('servico') || '').toString();
    const local = (f.get('local') || '').toString().trim();
    const msg = (f.get('msg') || '').toString().trim();

    let ok = true;
    [['nome', nome], ['servico', servico]].forEach(([n, v]) => {
      const field = form.elements[n].closest('.fld');
      field.classList.toggle('err', !v);
      if (!v) ok = false;
    });
    if (!ok) {
      note.textContent = 'Preencha seu nome e o que precisa impermeabilizar.';
      note.style.color = '#ff8f8f';
      return;
    }
    note.style.color = '';
    note.textContent = 'Abrindo o WhatsApp…';

    const linhas = [`Olá! Meu nome é ${nome}.`, `Gostaria de um orçamento: ${servico}.`];
    if (local) linhas.push(`Local: ${local}.`);
    if (msg) linhas.push(msg);
    linhas.push('Vim pelo site.');

    // link clicado de verdade: abre nova aba sem ser barrado como pop-up
    const a = document.createElement('a');
    a.href = waUrl(linhas.join('\n'));
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  form.addEventListener('input', (e) => e.target.closest('.fld')?.classList.remove('err'));
}
