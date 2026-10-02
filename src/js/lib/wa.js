// Para trocar o número do WhatsApp: DDI + DDD + número, só dígitos.
// Os links em index.html também usam este número (procure por "5514997341789").
export const WA = '5514997341789';
export const waUrl = (texto) => `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
