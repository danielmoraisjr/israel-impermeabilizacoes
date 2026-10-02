// Gera as imagens da casa (assets/img/casa/*.webp) a partir da cena 3D em tools/house.
// O site publicado NÃO usa three.js: só as imagens geradas aqui. Rode apenas quando a cena mudar.
// Requer (só local): npm i -D playwright   ·   uso: node tools/render-stills.mjs
import { build } from 'esbuild';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const W = 1100, H = 930, WIDTHS = [1100, 720];
// estado → { clima, barreira, segundos de simulação, clarão do relâmpago }
const STATES = {
  'garoa-on': { weather: 'garoa', barrier: true, secs: 4 },
  'chuva-on': { weather: 'chuva', barrier: true, secs: 4 },
  'temporal-on': { weather: 'temporal', barrier: true, secs: 6, flash: 0.28 },
  'garoa-off': { weather: 'garoa', barrier: false, secs: 20 },
  'chuva-off': { weather: 'chuva', barrier: false, secs: 18 },
  'temporal-off': { weather: 'temporal', barrier: false, secs: 14, flash: 0.28 },
};

mkdirSync('.tmp', { recursive: true });
await build({ entryPoints: ['tools/house/index.js'], outfile: '.tmp/house.js', bundle: true, format: 'iife', minify: true, logLevel: 'warning' });
writeFileSync('.tmp/stage.html', `<!doctype html><meta charset=utf-8><body style="margin:0;background:transparent"><div id=m style="width:${W}px;height:${H}px"></div><script src="house.js"></script>`);

const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto(pathToFileURL('.tmp/stage.html').href);
mkdirSync('assets/img/casa', { recursive: true });

for (const [key, st] of Object.entries(STATES)) {
  const dataUrl = await page.evaluate(({ st }) => {
    const m = document.getElementById('m'); m.innerHTML = '';
    const h = window.IsraelHouse.mount(m, { weather: st.weather, barrier: st.barrier, force: true });
    h.setActive(false);
    h.still(st.secs, { flash: st.flash || 0 });
    const url = h.canvas.toDataURL('image/png');
    h.dispose();
    return url;
  }, { st });
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  for (const w of WIDTHS) {
    const info = await sharp(buf).resize(w).webp({ quality: 80, alphaQuality: 85, effort: 5 }).toFile(`assets/img/casa/${key}-${w}.webp`);
    console.log(`${key}-${w}.webp`, Math.round(info.size / 1024) + ' KB');
  }
}
await browser.close();
