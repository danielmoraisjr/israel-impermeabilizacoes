// Gera as imagens de compartilhamento e os ícones do app a partir do HTML/SVG da marca.
// Requer o Playwright instalado (não é dependência do site):  npx playwright install chromium
// uso: node scripts/make-assets.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright/index.mjs')); }

const root = resolve(new URL('..', import.meta.url).pathname);
const html = readFileSync(`${root}/index.html`, 'utf8');
const mark = html.match(/<symbol id="i-mark"[^>]*>([\s\S]*?)<\/symbol>/)[1];
const fontUrl = pathToFileURL(`${root}/assets/fonts/archivo.woff2`).href;
mkdirSync(`${root}/assets/img`, { recursive: true });

const base = `
@font-face{font-family:Archivo;src:url(${fontUrl}) format("woff2");font-weight:100 900;font-stretch:62% 125%}
*{box-sizing:border-box;margin:0}
body{font-family:Archivo,system-ui,sans-serif;color:#fff;background:#04111d;-webkit-font-smoothing:antialiased}
`;

const markSvg = (c = '#2fc8ff', k = '#fff', w = 120) =>
  `<svg viewBox="24 16 178 146" width="${w}" style="--mk-c:${c};--mk-k:${k}">${mark}</svg>`;

// ---------- imagem de compartilhamento 1200×630 ----------
const og = `<!doctype html><meta charset="utf-8"><style>${base}
body{width:1200px;height:630px;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(143,227,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(143,227,255,.06) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(60% 80% at 76% 62%,#000,transparent 80%)}
.art{position:absolute;right:-120px;bottom:-40px;width:690px}
.brand{position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:18px}
.brand b{display:block;font-size:40px;font-weight:800;font-stretch:85%;color:#2fc8ff;line-height:1;letter-spacing:.01em}
.brand span{display:block;margin-top:7px;font-size:11.5px;font-weight:700;font-stretch:105%;letter-spacing:.34em;color:#fff;opacity:.92}
h1{position:absolute;left:72px;top:172px;font-size:104px;font-weight:800;font-stretch:88%;line-height:.94;letter-spacing:-.022em}
h1 i{font-style:normal;color:#7f9bb0;display:block}
.sub{position:absolute;left:72px;top:488px;font-size:27px;font-weight:500;color:#b4c6d3}
.chips{position:absolute;left:72px;top:545px;display:flex;gap:14px}
.chips span{padding:12px 20px;border:1px solid rgba(255,255,255,.22);font-size:20px;font-weight:600;color:#eaf3f9}
</style>
<div class="grid"></div>
<svg class="art" viewBox="0 0 800 800">
  <defs><linearGradient id="gw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffeabb"/><stop offset="1" stop-color="#ffc462"/></linearGradient></defs>
  <g fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 620H760" stroke-opacity=".5"/><path d="M240 620V484M560 620V484"/><path d="M205 488L400 346L595 488"/><path d="M242 478L400 364L558 478"/>
    <path d="M470 400V366H496V412"/><path d="M365 620V540H435V620"/><path d="M266 520H330V582H266ZM298 520V582M266 551H330"/><path d="M470 520H534V582H470ZM502 520V582M470 551H534"/>
  </g>
  <rect x="267" y="521" width="62" height="60" fill="url(#gw)"/><rect x="471" y="521" width="62" height="60" fill="url(#gw)"/>
  <path d="M298 521V581M267 551H329M502 521V581M471 551H533" stroke="#04111d" stroke-opacity=".5" stroke-width="2"/>
  <path d="M70 620A330 330 0 0 1 730 620" fill="none" stroke="#2fc8ff" stroke-opacity=".7" stroke-width="2.2"/>
  <g fill="none" stroke="#8fe3ff" stroke-linecap="round"><path d="M160 360A330 330 0 0 1 250 300" stroke-width="7" stroke-opacity=".8"/><path d="M470 292A330 330 0 0 1 560 306" stroke-width="6" stroke-opacity=".7"/><path d="M640 400A330 330 0 0 1 685 470" stroke-width="7" stroke-opacity=".8"/></g>
  <g stroke="#c8e4f5" stroke-opacity=".34" stroke-width="2" stroke-linecap="round">
    <path d="M60 120v40M130 40v36M200 150v30M330 60v40M450 120v34M560 30v38M640 140v36M720 70v40M780 190v34M90 260v30M20 350v34M770 330v36M730 450v32"/>
  </g>
</svg>
<div class="brand">${markSvg('#2fc8ff', '#fff', 86)}<div><b>ISRAEL</b><span>IMPERMEABILIZAÇÕES</span></div></div>
<h1><i>Água lá fora.</i>Tranquilidade<br>aqui dentro.</h1>
<p class="sub">Impermeabilização em Botucatu – SP</p>
<div class="chips"><span>★ 4,8 no Google</span><span>Orçamento sem compromisso</span></div>`;

// ---------- ícones do app (fundo cheio, marca centralizada com margem de segurança) ----------
const icon = (size) => `<!doctype html><meta charset="utf-8"><style>${base}
body{width:${size}px;height:${size}px;background:#04111d;display:grid;place-items:center}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,#0d4d78,#04111d 78%)}
svg{position:relative;width:${Math.round(size * 0.56)}px;height:auto}
</style>${markSvg('#2fc8ff', '#fff', size * 0.56)}`;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
async function shot(markup, w, h, file, opts = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const tmp = `${root}/.tmp-asset.html`;
  writeFileSync(tmp, markup);
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${root}/assets/img/${file}`, ...opts });
  await page.close();
  console.log('gerado', file);
}
await shot(og, 1200, 630, 'og.jpg', { type: 'jpeg', quality: 88 });
await shot(icon(192), 192, 192, 'icon-192.png');
await shot(icon(512), 512, 512, 'icon-512.png');
await browser.close();
import('node:fs').then((fs) => fs.rmSync(`${root}/.tmp-asset.html`, { force: true }));
