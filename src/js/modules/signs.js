// SINAIS — a pessoa toca no que está vendo e a mensagem do WhatsApp já sai com isso.
import { $, $$ } from '../lib/dom.js';
import { waUrl } from '../lib/wa.js';

export function initSigns() {
  const checks = $$('.sym input');
  const cta = $('#sinais-cta');
  if (!checks.length || !cta) return;
  const label = $('.btn-t', cta);
  const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}` : a[0]);
  const update = () => {
    const vals = checks.filter((i) => i.checked).map((i) => i.value);
    const base = 'Olá! Estou com problema de infiltração e gostaria de um orçamento.';
    cta.href = waUrl(vals.length ? `${base} Estou vendo: ${list(vals)}.` : base);
    label.textContent = vals.length ? `Enviar ${vals.length} ${vals.length > 1 ? 'sinais' : 'sinal'} no WhatsApp` : 'Enviar no WhatsApp';
  };
  checks.forEach((i) => i.addEventListener('change', update));
  update();
}
