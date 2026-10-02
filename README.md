# Israel Impermeabilizações

Site de **Israel Impermeabilizações** — impermeabilização com manta asfáltica e argamassa impermeabilizante em Botucatu – SP.
Objetivo do site: gerar pedidos de orçamento pelo WhatsApp.

Site estático (HTML + CSS + JS), sem framework e sem bibliotecas. Hospedado na Vercel.

## Princípios

- **Identidade da marca**: azul, branco e preto do logotipo, uma só fonte (Archivo). Sem ícones decorativos: só o logotipo (com um brilho discreto no topo) e o botão flutuante do WhatsApp.
- **Leve e fluido**: ~21 KB de CSS, ~4 KB de JavaScript, uma fonte (45 KB). A primeira tela carrega ~350 KB no desktop e bem menos no celular (a foto do hero no celular tem ~55 KB). Lighthouse no celular: 99 em desempenho, 100 em acessibilidade, boas práticas e SEO. Rolagem 100% nativa: nada de rolagem presa, cena fixa ou efeito ligado à rolagem.
- **Movimento com propósito, só em CSS** (`transform`/`opacity`/`clip-path`): o título entra linha a linha, o cartão de avaliação se revela,
  as camadas de cada sistema se montam de baixo para cima ao aparecer, as fotos reais se revelam ao rolar, a linha de "Como funciona" se
  desenha e o FAQ abre suave. `prefers-reduced-motion` desliga tudo.
- **Nada preso à rolagem**: sem parallax, sem foto "grudada" na tela e sem efeitos ligados à posição da rolagem (o Edge no Windows engasgava com eles). Movimento só onde ajuda: o título do hero entra uma vez,
  a linha de cima dos cartões de Materiais "fecha" ao entrar, a linha de Como funciona se desenha e o brilho do logotipo (só `transform`). As fotos aparecem sem animação de revelação.
  Entre seções com foto escura, a emenda é um degradê (o hero termina em preto e a seção seguinte nasce do mesmo preto), nunca um corte seco.
- **Imagens**: as fotos de **obras** (`obra-*`) e da **sede** (`sede-*`: fachada no Contato, interior em A empresa) são da Israel. Nas fotos da sede, as placas dos veículos foram borradas. As fotos de **ambiente** (chuva em janela: `hero-*`, `storm-*`, `house-*`, `town-*`; telhas: `telhas-*`; cobertura: `aplicacao-*`, legendada como "foto ilustrativa")
  são do Unsplash (licença livre, sem atribuição obrigatória; os créditos estão no rodapé) e **nunca** são apresentadas como obra da empresa.
- **Nitidez das imagens**: todas passam por limpeza de artefatos de compressão e ampliação com o modelo Swin2SR (versão "realworld", ONNX, feito para fotos reais; não inventa detalhe).
  Cada foto de fundo sai em 3 tamanhos AVIF (`hero-d-1280/1920/2560`, `hero-m-640/900/1170`…) + um WebP de reserva, e o HTML usa `srcset`/`sizes`:
  o celular baixa só o necessário e a tela retina recebe resolução cheia. Fotos sem véu escuro (telhas, aplicação, obras, sede) usam qualidade maior.
  A imagem de compartilhamento (`og.jpg`, 1200×630) é um cartão feito com a marca, não um print do site.
- **Serviços em quadrados** (`#servicos`): 6 quadrados com foto (2 colunas no celular, 3 no desktop). Tocar abre uma janela (`<dialog>` nativo: foco preso, Esc fecha, toque fora fecha, o botão "voltar" do celular fecha)
  com "Por que fazer", "O que a gente faz" e o botão "Quero fazer: pedir orçamento" (WhatsApp, fixo no rodapé da janela). Sem JavaScript/`<dialog>`, o toque leva direto ao WhatsApp. Para editar um serviço, mude o quadrado e a janela `svc-<nome>` no HTML.
  As fotos dos quadrados saem de `assets/img/svc-<nome>-480/800/1200`. Lajes e muros usam fotos de obra da Israel (legenda "Obra da Israel"); telhados, paredes, alicerces e piscinas são fotos de banco com licença livre, legendadas "Foto ilustrativa" e creditadas no rodapé
  (alicerces é CC BY-SA 4.0: o crédito com link é obrigatório; se a foto sair, retire o crédito junto). Troque por fotos reais da Israel assim que houver.
- **Carrosséis** (fotos da sede, avaliações e, no celular, obras): rolagem nativa do navegador com encaixe (`scroll-snap`); funciona por toque, mouse e teclado (setas, com o trilho em foco) e, sem JavaScript,
  continua deslizável. O JS (`[data-car]` em `src/js/main.js`) só cria botões e pontos e dá rótulos de acessibilidade ("1 de 3"). Sem rotação automática, de propósito (leitura e movimento reduzido).
  Para incluir uma foto ou avaliação, basta acrescentar mais um item `.car-slide` dentro do `.car-track`. No desktop, as duas fotos de obras ficam lado a lado (sem botões).
- **Fotos usadas e descartadas**: da sede entraram só três (estoque, veículos da equipe e rolos de manta), com as placas borradas antes da limpeza. Ficaram de fora fotos com objetos pessoais, enquadramentos ruins
  e os stories de Instagram (arte de terceiros e texto embutido na imagem). Os originais enviados pelo cliente ficam na pasta `originais-cliente/`, ignorada pelo git de propósito (o repositório é público e as fotos têm placas sem borrar).
- **Só conteúdo real**: textos, endereço, telefone e avaliações vêm da própria empresa (Google). Sem produtos, preços, números ou clientes inventados.
  Fatos informados pela empresa: horário (segunda a sexta, 7h30 às 17h; sábado e domingo fechado), atendimento em Botucatu e região, 12 anos no ramo,
  garantia de 5 anos, orçamento sem taxa em Botucatu e taxa de visita fora da cidade.
- **Horário em tempo real**: no hero, uma linha mostra se estamos em horário de atendimento (fuso de Brasília) ou quando abrimos de novo. Sem JavaScript, fica o horário fixo.
  Se o horário mudar, ajuste em `src/js/main.js` (bloco "horário de atendimento") e no HTML.
- **Telas grandes**: acima de 1900 px o texto e a largura do conteúdo crescem (1400 px e, acima de 2400 px, 1640 px), para o site não virar uma coluna pequena no meio.
- **Poucos números, de propósito**: só os que ajudam a decidir (12 anos, garantia de 5 anos, nota 4,8, horário e telefone). Detalhes técnicos
  (espessuras, alturas, prazos de teste) ficam fora do site.
- Interações só por **clique/toque/teclado** — nada depende de hover.

## Estrutura

```
index.html              conteúdo (textos, SEO e dados estruturados)
vercel.json             cabeçalhos de segurança (CSP) e cache
src/css/                base (tokens, tipografia), components (botões, menu, formulário, FAQ), sections (cada seção)
ordem das seções     hero · sinais · serviços · sistemas · como funciona · obras · a empresa · orçamento · dúvidas · avaliações · contato (fundos claro/escuro se alternam)
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

## Ao registrar o domínio próprio (checklist)

Hoje o endereço é `israel-impermeabilizacoes.vercel.app`. Quando o `.com.br` estiver ativo, troque a URL antiga em: `index.html` (canonical, `og:url`, `og:image`, e os blocos JSON-LD),
`sitemap.xml` e `robots.txt`; depois ligue o domínio no projeto da Vercel e refaça `npm run build`. Redirecione o endereço antigo para o novo.

## Como editar

- **Textos, horário, endereço, garantia**: `index.html`. O horário aparece em Contato, no rodapé e nos dados estruturados (`openingHoursSpecification`); as perguntas do FAQ aparecem no HTML e também no JSON-LD (mantenha os dois iguais).
- **Número do WhatsApp**: procure por `5514997341789` em `index.html` e em `src/js/main.js`.
- **Cores e fonte**: variáveis no topo de `src/css/base.css`. Fonte única: Archivo (peso 400–800, largura 80–100%), em `assets/fonts/`.
- **E-mail**: não há e-mail confirmado, por isso ele não aparece. Para incluir, adicione em `#contato` (bloco `.ct-grid`) e no rodapé.
- **Fotos de obras**: coloque em `assets/img/` (WebP, com `width`/`height`) e inclua em `#obras` no mesmo formato das atuais.
  As duas fotos atuais chegaram com só 384×288 px (os arquivos originais estão no histórico do git, commit `3953801`). Foram ampliadas 4× com o modelo de
  super-resolução Swin2SR (versão "realworld", em ONNX, feita para fotos reais comprimidas: limpa os artefatos sem inventar detalhes). Mesmo assim, o ideal é trocar pelos originais.
  As fotos da sede chegaram pelo WhatsApp (já comprimidas) e passaram pela mesma limpeza, a partir de uma versão reduzida pela metade.
