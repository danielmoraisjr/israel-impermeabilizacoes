// Utilitários pequenos e sem dependências.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
/** progresso de 0 a 1 dentro do intervalo [a, b] */
export const seg = (p, a, b) => clamp((p - a) / (b - a));

export const mq = (q) => window.matchMedia(q);
export const reduceMotion = mq('(prefers-reduced-motion: reduce)').matches;
export const finePointer = mq('(hover: hover) and (pointer: fine)').matches;

/** conexão lenta ou "economizar dados": pula efeitos pesados */
export const lite = (() => {
  const c = navigator.connection;
  return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
})();

/** gerador pseudoaleatório com semente (resultado igual a cada visita) */
export function seeded(seed = 11) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** chama cb(visível) quando o elemento entra/sai da tela */
export function watchVisible(el, cb, margin = '120px') {
  if (!('IntersectionObserver' in window)) { cb(true); return () => {}; }
  const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}
