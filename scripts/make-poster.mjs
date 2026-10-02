// Gera assets/img/casa-poster.webp: um quadro determinístico da casa 3D (chuva + bolha), com fundo transparente.
// Requer: npm i -D playwright (só localmente) e o site servido em http://localhost:4173 (ex.: python3 -m http.server 4173).
import { chromium } from 'playwright';
import sharp from 'sharp';

const URL = process.env.URL || 'http://localhost:4173/';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 1 })).newPage();
await page.goto(URL, { waitUntil: 'load' });
await page.waitForSelector('.hero-stage.is-live', { timeout: 40000 });
const png = await page.evaluate(() => {
  const h = window.IsraelHouse.last;
  h.setWeather('chuva'); h.setBarrier(true);
  h.still(4);
  return h.canvas.toDataURL('image/png');
});
const buf = Buffer.from(png.split(',')[1], 'base64');
const out = await sharp(buf).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toFile('assets/img/casa-poster.webp');
console.log('casa-poster.webp', out.width + '×' + out.height, Math.round(out.size / 1024) + ' KB');
await browser.close();
