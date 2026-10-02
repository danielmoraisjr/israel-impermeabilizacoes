# Israel Impermeabilizações

Site de **Israel Impermeabilizações** — impermeabilização com manta asfáltica e argamassa impermeabilizante em Botucatu – SP.
Objetivo do site: gerar pedidos de orçamento pelo WhatsApp.

Site estático (HTML + CSS + JS), sem framework. Hospedado na Vercel.

## Conceito

**Água → infiltração → barreira → tranquilidade.**
A impermeabilização é tratada como uma barreira entre o imóvel e a água. A cor ciano da marca aparece **só onde há proteção**.

- **Hero** — uma casa em 3D (three.js) protegida por uma bolha. Chove sobre ela e a água escorre na bolha. O visitante escolhe
  **Garoa / Chuva / Temporal** e liga ou desliga a **barreira**: sem ela, o telhado encharca, a calha pinga e aparecem manchas nas paredes
  (a goteira). Tudo reage só a **clique/toque** — nenhum efeito depende de hover.
- **Sinais** — marcar o que a pessoa está vendo monta a mensagem de WhatsApp.
- **Serviços** — um serviço por vez, com o corte desenhado ao selecionar (clique/teclado).
- **Dois sistemas** — manta asfáltica e argamassa em camadas.
- **Obras** — as duas fotos reais enviadas pela empresa.
- **Como funciona** — etapas reais, ligadas por uma linha que se aplica ao rolar. Sem numeração.
- **Avaliações** — apenas as avaliações reais do Google já publicadas.
- **Contato** — mapa carregado direto, endereço, horário, telefone e Instagram.

> Nada de clientes, obras, números ou resultados inventados. O site **não** exibe produtos nem preços.

## Casa 3D: como funciona

- `src/house/` é um **pacote separado** (`assets/js/house.[hash].js`, ~590 KB minificado) carregado **sob demanda**,
  depois da entrada dos textos. O site em si (`site.[hash].js`) tem ~130 KB.
- Tudo é procedural (texturas desenhadas em canvas, sem imagens externas): `textures.js` (materiais), `build.js` (casa, terreno, cerca),
  `effects.js` (bolha com shader, chuva, respingos), `index.js` (luz, câmera, clima, desempenho adaptativo).
- **Plano B**: sem WebGL, com `prefers-reduced-motion`, modo "economizar dados" ou `?nogl` na URL, o site mostra
  `assets/img/casa-poster.webp` (um quadro da própria cena) e esconde os controles.
- A resolução e a quantidade de gotas se ajustam sozinhas se o aparelho não sustentar a taxa de quadros.
- Para regenerar o pôster: sirva a raiz em `http://localhost:4173` e rode `node scripts/make-poster.mjs` (precisa do Playwright, só local).

## Estrutura

```
index.html              conteúdo (todo o texto, SEO e dados estruturados estão aqui)
vercel.json             cabeçalhos de segurança (CSP), cache
src/css/                estilos por assunto (tokens, base, componentes, hero, sections, motion)
src/js/main.js          ponto de entrada (inicialização em etapas)
src/js/modules/         hero (controles + carga da casa), signs, services, sections, ui, forms
src/js/lib/             dom, wa (número e mensagens do WhatsApp)
src/house/              casa 3D (three.js) — empacotada à parte
assets/                 arquivos publicados (css/js compilados com hash, fontes, imagens)
scripts/build.mjs       compila src/ → assets/
scripts/make-assets.mjs gera ícones do app
scripts/make-poster.mjs gera o pôster da casa 3D
```

## Comandos

```bash
npm install          # uma vez
npm run build        # compila src/ → assets/ (minificado, com hash no nome) e atualiza index.html
npm run dev          # recompila ao salvar
```

Os arquivos de `assets/` **são versionados**: a Vercel publica a pasta como está, sem etapa de build (o script `vercel-build` apenas avisa isso).
Depois de mexer em `src/`, rode `npm run build` e faça o commit dos arquivos gerados.

Para ver localmente: `python3 -m http.server 4173` (ou qualquer servidor estático na raiz).

## Como editar

- **Textos, horários, endereço**: `index.html`.
- **Número do WhatsApp**: procure por `5514997341789` em `index.html` e em `src/js/lib/wa.js`.
- **Cores e fonte**: `src/css/tokens.css`. Fonte única: Archivo (variável em peso e largura), servida de `assets/fonts/`.
- **Fotos de obras**: coloque em `assets/img/` (WebP, com `width`/`height`) e use `<img loading="lazy" alt="...">`.
  Um antes/depois só deve entrar com fotos reais da própria empresa.
