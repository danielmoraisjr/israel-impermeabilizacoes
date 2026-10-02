# Israel Impermeabilizações

Site de **Israel Impermeabilizações** — impermeabilização com manta asfáltica e argamassa impermeabilizante em Botucatu – SP.
Objetivo do site: gerar pedidos de orçamento pelo WhatsApp.

Site estático (HTML + CSS + JS), sem framework. Hospedado na Vercel.

## Conceito

**Água → infiltração → problema → proteção → barreira → tranquilidade.**
A impermeabilização é tratada como uma barreira entre o imóvel e a água. O site inteiro é desenhado como uma
prancha técnica (cortes arquitetônicos), e a cor ciano da marca aparece **só onde há proteção**.

- **Hero** — a casa se desenha, o arco da marca fecha em volta e só então começa a chuva. A água bate no arco e ele acende no ponto do impacto.
- **A barreira** (cena fixada na rolagem) — corte de uma laje: chuva → infiltração → danos → barreira aplicada → imóvel protegido. Tudo é função do progresso da rolagem e funciona de ida e volta.
- **Sinais** — marcar um sintoma mostra como ele costuma aparecer na parede e monta a mensagem de WhatsApp.
- **Serviços** — prancha técnica por serviço (problema → solução), com o corte desenhado ao selecionar.
- **Dois sistemas** — manta asfáltica e argamassa em camadas (aplicadas de baixo para cima).
- **Como funciona** — as 4 etapas reais, ligadas por uma linha que se aplica ao rolar.
- **Avaliações** — apenas as avaliações reais do Google já publicadas no site.

> Não há fotos reais da empresa no projeto, então todas as imagens são desenhos/ilustrações esquemáticas e estão
> identificadas como tal. Nada de obras, clientes, números ou resultados inventados.

## Estrutura

```
index.html              conteúdo (todo o texto, SEO e dados estruturados estão aqui)
vercel.json             cabeçalhos de segurança (CSP), cache
src/css/                estilos por assunto (tokens, base, componentes, hero, barrier, sections, motion)
src/js/main.js          ponto de entrada (inicialização em etapas)
src/js/modules/         hero, barrier, signs, services, sections, ui, forms
src/js/lib/             rain (motor de chuva em canvas), svgmap, dom, wa
assets/                 arquivos publicados (css/js compilados com hash, fontes, imagens)
scripts/build.mjs       compila src/ → assets/
scripts/make-assets.mjs gera og.jpg e os ícones do app
```

## Comandos

```bash
npm install          # uma vez
npm run build        # compila src/ → assets/ (minificado, com hash no nome) e atualiza index.html
npm run dev          # recompila ao salvar
npm run assets       # regenera og.jpg / icon-192.png / icon-512.png (precisa do Playwright)
```

Os arquivos de `assets/` **são versionados**: a Vercel publica a pasta como está, sem etapa de build (o script `vercel-build` apenas avisa isso).
Depois de mexer em `src/`, rode `npm run build` e faça o commit dos arquivos gerados.

Para ver localmente: `npx serve .` (ou qualquer servidor estático na raiz).

## Como editar

- **Textos, preços, horários, endereço**: `index.html`. (O site **não** exibe produtos nem preços.)
- **Número do WhatsApp**: procure por `5514997340000` em `index.html` e em `src/js/lib/wa.js`.
- **Cores e fonte**: `src/css/tokens.css`. Fonte única: Archivo (variável em peso e largura), servida de `assets/fonts/`.
- **Quando houver fotos reais**: coloque em `assets/img/` (WebP/AVIF, com `width`/`height`) e use `<img loading="lazy" alt="...">`.
  Um antes/depois só deve entrar com fotos reais da própria empresa.

## Segurança (CSP)

O CSP em `vercel.json` só permite recursos do próprio domínio (+ mapa do Google sob demanda). O pequeno script
inline que marca "há JavaScript" é liberado por **hash**; o `npm run build` recalcula esse hash em `vercel.json`
sempre que o trecho `<script id="boot">` mudar.

## Acessibilidade e performance

- Navegação por teclado, foco visível, `prefers-reduced-motion` respeitado (a cena fixa vira uma lista estática), contraste AA.
- Sem JavaScript o conteúdo continua legível.
- Chuva em canvas só anima quando está na tela e com a aba visível; qualidade reduzida no celular / "economizar dados".
- Transferência na primeira visita ≈ 165 KB (HTML 14 KB, CSS 8 KB, JS 51 KB, fonte 90 KB, com Brotli).
