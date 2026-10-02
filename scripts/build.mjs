// Compila src/ → assets/ (CSS e JS minificados, com hash no nome para cache longo)
// e atualiza as referências em index.html.
// Uso: `npm run build` · `npm run dev` (recompila ao salvar)
import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

const watch = process.argv.includes('--watch');

// O script inline #boot (marca "tem JavaScript") é liberado no CSP por hash.
// Sempre que ele mudar, o hash em vercel.json é recalculado aqui.
function syncBootHash() {
  const m = readFileSync('index.html', 'utf8').match(/<script id="boot">([\s\S]*?)<\/script>/);
  if (!m) return;
  const hash = `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`;
  const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));
  for (const h of cfg.headers) {
    for (const k of h.headers) {
      if (k.key !== 'Content-Security-Policy') continue;
      const next = k.value.replace(/script-src 'self'( 'sha256-[^']+')?/, `script-src 'self' ${hash}`);
      if (next !== k.value) { k.value = next; writeFileSync('vercel.json', JSON.stringify(cfg, null, 2) + '\n'); }
    }
  }
}

// cada compilação cuida só da sua pasta: apaga versões antigas e aponta o index.html para a nova
const finalize = (ext, prefix = 'site') => ({
  name: `finalize-${prefix}-${ext}`,
  setup(b) {
    b.onEnd((result) => {
      if (!result.metafile) return;
      const outs = Object.keys(result.metafile.outputs).filter((f) => f.endsWith(`.${ext}`) && f.split('/').pop().startsWith(`${prefix}.`));
      const dir = `assets/${ext}`;
      const keep = new Set(outs.map((f) => f.split('/').pop()));
      for (const f of readdirSync(dir)) {
        if (new RegExp(`^${prefix}\\.[A-Z0-9]{8}\\.${ext}$`).test(f) && !keep.has(f)) rmSync(`${dir}/${f}`);
      }
      let html = readFileSync('index.html', 'utf8');
      for (const f of outs) {
        const name = f.split('/').pop();
        html = html.replace(new RegExp(`/assets/${ext}/${prefix}(\\.[A-Z0-9]{8})?\\.${ext}`, 'g'), `/assets/${ext}/${name}`);
      }
      writeFileSync('index.html', html);
      syncBootHash();
      for (const f of outs) console.log(`${f}: ${(statSync(f).size / 1024).toFixed(1)} KB`);
    });
  },
});

const common = { logLevel: 'warning', legalComments: 'none', metafile: true, bundle: true };

const js = {
  ...common,
  plugins: [finalize('js')],
  entryPoints: { site: 'src/js/main.js' },
  outdir: 'assets/js',
  entryNames: '[name].[hash]',
  format: 'iife',
  target: ['es2020', 'chrome90', 'safari14', 'firefox90'],
  minify: !watch,
};

const house = {
  ...common,
  plugins: [finalize('js', 'house')],
  entryPoints: { house: 'src/house/index.js' },
  outdir: 'assets/js',
  entryNames: '[name].[hash]',
  format: 'iife',
  target: ['es2020', 'chrome90', 'safari14', 'firefox90'],
  minify: !watch,
};

const css = {
  ...common,
  plugins: [finalize('css')],
  entryPoints: { site: 'src/css/site.css' },
  outdir: 'assets/css',
  entryNames: '[name].[hash]',
  minify: !watch,
  target: ['chrome90', 'safari14', 'firefox90'],
  external: ['/assets/*'], // as fontes são servidas de /assets/fonts
};

if (watch) {
  const ctxs = await Promise.all([context(js), context(css), context(house)]);
  await Promise.all(ctxs.map((c) => c.watch()));
  console.log('observando src/ …');
} else {
  await Promise.all([build(js), build(css), build(house)]);
}
