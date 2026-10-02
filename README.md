# Israel Impermeabilizações

Site de **Israel Impermeabilizações** — impermeabilização com manta asfáltica e argamassa impermeabilizante em Botucatu – SP.
Objetivo do site: gerar pedidos de orçamento pelo WhatsApp.

Site estático (HTML + CSS + JS), sem framework e sem bibliotecas. Hospedado na Vercel.

## Princípios

- **Identidade da marca**: azul-marinho e ciano (cores do logotipo), uma só fonte (Archivo), poucas cores.
- **Leve e fluido**: ~21 KB de CSS, ~4 KB de JavaScript, uma fonte (45 KB). A primeira tela carrega ~190 KB. Rolagem 100% nativa, sem efeitos ligados à rolagem.
- **Movimento com propósito, só em CSS** (`transform`/`opacity`/`clip-path`): o título entra linha a linha, o cartão de avaliação se revela,
  as camadas de cada sistema se montam de baixo para cima ao aparecer, as fotos reais se revelam ao rolar, a linha de "Como funciona" se
  desenha e o FAQ abre suave. `prefers-reduced-motion` desliga tudo.
- **Imagens**: as fotos de **obras** (`obra-*.webp`) são da Israel. As fotos de **ambiente** (chuva em janela: `hero-chuva-*`, `janela-*`)
  são do Unsplash (licença livre, sem atribuição obrigatória; os créditos estão no rodapé) e **nunca** são apresentadas como obra da empresa.
- **Só conteúdo real**: textos, endereço, telefone e avaliações vêm da própria empresa (Google). Sem produtos, preços, números ou clientes inventados.
- Interações só por **clique/toque/teclado** — nada depende de hover.

## Estrutura

```
index.html              conteúdo (textos, SEO e dados estruturados)
vercel.json             cabeçalhos de segurança (CSP) e cache
src/css/                base (tokens, tipografia), components (botões, menu, formulário, FAQ), sections (cada seção)
src/js/main.js          menu, cabeçalho, botões flutuantes, sinais e formulário → WhatsApp, revelações ao rolar
assets/                 css/js compilados (com hash no nome), fonte, imagens
scripts/build.mjs       compila src/ → assets/ e atualiza as referências no index.html
```

## Comandos

```bash
npm install          # uma vez
npm run build        # compila src/ → assets/ (minificado, com hash no nome) e atualiza index.html
npm run dev          # recompila ao salvar
```

Os arquivos de `assets/` **são versionados**: a Vercel publica a pasta como está, sem etapa de build.
Depois de mexer em `src/`, rode `npm run build` e faça o commit dos arquivos gerados.
Para ver localmente: `python3 -m http.server 4173` (ou qualquer servidor estático na raiz).

## Como editar

- **Textos, horário, endereço**: `index.html`.
- **Número do WhatsApp**: procure por `5514997341789` em `index.html` e em `src/js/main.js`.
- **Cores e fonte**: variáveis no topo de `src/css/base.css`. Fonte única: Archivo (peso 400–800, largura 80–100%), em `assets/fonts/`.
- **Fotos de obras**: coloque em `assets/img/` (WebP, com `width`/`height`) e inclua em `#obras` no mesmo formato das atuais.
  As duas fotos atuais têm só 384×288 px: quando houver originais em alta resolução, troque-as e dá para criar um hero com foto de obra.
