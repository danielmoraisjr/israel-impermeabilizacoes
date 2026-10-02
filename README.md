# Israel Impermeabilizações

Site de **Israel Impermeabilizações** — impermeabilização com manta asfáltica e argamassa impermeabilizante em Botucatu – SP.
Objetivo do site: gerar pedidos de orçamento pelo WhatsApp.

Site estático (HTML + CSS + JS), sem framework e sem bibliotecas. Hospedado na Vercel.

## Princípios

- **Identidade da marca**: azul, branco e preto do logotipo, uma só fonte (Archivo). Sem ícones decorativos: só o logotipo (com um brilho discreto no topo) e o botão flutuante do WhatsApp.
- **Leve e fluido**: ~21 KB de CSS, ~4 KB de JavaScript, uma fonte (45 KB). A primeira tela carrega ~350 KB no desktop (a foto do hero, em AVIF, é a maior parte) e menos no celular. Rolagem 100% nativa (nunca sequestrada): nada de rolagem presa ou cena fixa.
- **Movimento com propósito, só em CSS** (`transform`/`opacity`/`clip-path`): o título entra linha a linha, o cartão de avaliação se revela,
  as camadas de cada sistema se montam de baixo para cima ao aparecer, as fotos reais se revelam ao rolar, a linha de "Como funciona" se
  desenha e o FAQ abre suave. `prefers-reduced-motion` desliga tudo.
- **Dois momentos de profundidade, em CSS puro** (animação ligada à rolagem, só `transform`/`opacity`, só onde o navegador suporta — nos demais, ficam estáticos):
  ao sair do hero a chuva desce devagar e o texto sobe e some; as fotos de obra deslizam dentro da moldura enquanto passam pela tela.
  Nos cartões de Sistemas, a linha de cima "fecha" da esquerda para a direita (a ideia de vedar).
- **Imagens**: as fotos de **obras** (`obra-*.webp`) são da Israel. As fotos de **ambiente** (chuva em janela: `hero-*`, `storm-*`, `house-*`, `town-*`; telhas: `telhas-*`; cobertura: `aplicacao-*`, legendada como "foto ilustrativa")
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
- **E-mail**: não há e-mail confirmado, por isso ele não aparece. Para incluir, adicione em `#contato` (bloco `.ct-grid`) e no rodapé.
- **Fotos de obras**: coloque em `assets/img/` (WebP, com `width`/`height`) e inclua em `#obras` no mesmo formato das atuais.
  As duas fotos atuais chegaram com só 384×288 px; foram ampliadas 4× com super-resolução (EDSR) para ficarem mais nítidas, mas o ideal é trocar pelos originais.
