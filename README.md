# Israel Impermeabilizações

Site de **Israel Impermeabilizações** — impermeabilização com manta asfáltica e argamassa impermeabilizante em Botucatu – SP.
Objetivo do site: gerar pedidos de orçamento pelo WhatsApp.

Site estático (HTML + CSS + JS), sem framework. Hospedado na Vercel.

## Conceito

**Água → infiltração → barreira → tranquilidade.**
A impermeabilização é tratada como uma barreira entre o imóvel e a água. A cor ciano da marca aparece **só onde há proteção**.

- **Hero** — uma casa protegida por uma bolha, sob chuva. O visitante escolhe **Garoa / Chuva / Temporal** e liga ou desliga a
  **barreira**: sem ela, o telhado encharca e aparecem manchas nas paredes (a goteira). É uma **imagem leve** que troca ao clicar/tocar —
  não há animação contínua, WebGL nem JavaScript pesado. Nenhum efeito depende de hover.
- **Sinais** — marcar o que a pessoa está vendo monta a mensagem de WhatsApp.
- **Serviços** — um serviço por vez, com o corte desenhado ao selecionar (clique/teclado).
- **Dois sistemas** — manta asfáltica e argamassa em camadas.
- **Obras** — as duas fotos reais enviadas pela empresa.
- **Como funciona** — etapas reais, ligadas por uma linha que se aplica ao rolar. Sem numeração.
- **Avaliações** — apenas as avaliações reais do Google já publicadas.
- **Contato** — mapa carregado direto, endereço, horário, telefone e Instagram.

> Nada de clientes, obras, números ou resultados inventados. O site **não** exibe produtos nem preços.

## A casa do hero

- O site publicado usa só imagens: `assets/img/casa/{clima}-{on|off}-{720|1100}.webp` (6 estados × 2 tamanhos, 50–200 KB cada,
  com `srcset`). A do estado inicial é pré-carregada; as outras são buscadas no clique (ou em ocioso, se a conexão for boa e sem economia de dados).
- As imagens foram geradas a partir de uma cena 3D procedural em `tools/house/` (three.js). **Isso não vai para o site**: three.js é só
  dependência de desenvolvimento. Para regenerar (só se a cena mudar): `npm i -D playwright` e `node tools/render-stills.mjs`.

## Estrutura

```
index.html              conteúdo (todo o texto, SEO e dados estruturados estão aqui)
vercel.json             cabeçalhos de segurança (CSP), cache
src/css/                estilos por assunto (tokens, base, componentes, hero, sections, motion)
src/js/main.js          ponto de entrada (inicialização em etapas)
src/js/modules/         hero (troca de imagem da casa), signs, services, sections, ui, forms
src/js/lib/             dom, wa (número e mensagens do WhatsApp)
tools/house/            cena 3D usada apenas para gerar as imagens da casa (não é publicada)
assets/                 arquivos publicados (css/js compilados com hash, fontes, imagens)
scripts/build.mjs       compila src/ → assets/
scripts/make-assets.mjs gera ícones do app
tools/render-stills.mjs gera as imagens da casa a partir de tools/house
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
