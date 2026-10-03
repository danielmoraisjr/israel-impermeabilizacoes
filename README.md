# Israel Impermeabilizações

Site de **Israel Impermeabilizações** — impermeabilização com manta asfáltica e argamassa impermeabilizante em Botucatu – SP.
Objetivo do site: gerar pedidos de orçamento pelo WhatsApp.

Site estático (HTML + CSS + JS), sem framework e sem bibliotecas. Hospedado na Vercel.

## Princípios

- **Identidade da marca**: azul, branco e preto do logotipo, uma só fonte: **Inter** (a mais próxima da SF Pro da Apple), com tamanho óptico automático (títulos grandes usam o corte "Display"), títulos compactos (`letter-spacing` negativo) e hero em três linhas grandes ao lado da logo 3D. O arquivo (`assets/fonts/inter.woff2`, ~40 KB) tem só os eixos usados (peso 400–800, tamanho óptico 14–32) e os caracteres do português. O símbolo (casa, barras, porta e arco) foi **redesenhado em vetor** a partir da logo do cliente (`<symbol id="i-mark">`, plano, no cabeçalho e rodapé) e há uma versão **3D** (camadas de extrusão + degradê, `.hero-mark`) na abertura do site, que se monta uma vez ao carregar (desligada com movimento reduzido). As letras do logotipo (ISRAEL / IMPERMEABILIZAÇÕES) são curvas no `<symbol id="i-word">`, então não mudam se a fonte do site mudar. Sem ícones decorativos: só o logotipo (com um brilho discreto no topo) e o botão flutuante do WhatsApp.
- **Página curta, de propósito**: 7 seções (hero · serviços · como funciona · a empresa · avaliações · dúvidas · contato), ≈ 9–10 telas no total (antes eram ≈ 15). Tudo que repetia informação foi fundido ou cortado.
- **Leve e fluido**: ~26 KB de CSS, ~5,8 KB de JavaScript, uma fonte (40 KB). A primeira tela carrega ~750 KB no desktop e bem menos no celular. Lighthouse no celular: 98–99 em desempenho, 100 em acessibilidade, boas práticas e SEO. Rolagem 100% nativa: nada de rolagem presa, cena fixa ou efeito ligado à rolagem.
- **Movimento com propósito, só em CSS** (`transform`/`opacity`): o título do hero entra linha a linha, a linha de cima de cada cartão de Materiais "fecha" ao aparecer,
  a linha de "Como funciona" se desenha e o FAQ abre suave. `prefers-reduced-motion` desliga tudo.
- **Nada preso à rolagem**: sem parallax, sem foto "grudada" na tela e sem efeitos ligados à posição da rolagem (o Edge no Windows engasgava com eles). Movimento só onde ajuda: o título do hero entra uma vez,
  a linha de cima dos cartões de Materiais "fecha" ao entrar, a linha de Como funciona se desenha e o brilho do logotipo (só `transform`). As fotos aparecem sem animação de revelação.
  Entre o hero (escuro) e a seção seguinte (clara) a emenda é uma linha reta, de propósito. O hero não tem foto: a imagem é a logo 3D (`.hero-art`), que se monta uma vez quando aparece na tela.
- **Imagens**: todas as fotos de Serviços e da galeria **Obras** são do Israel (enviadas pelo cliente; originais em `originais-cliente/`, fora do git, porque há placas de carro sem borrar). Os recortes saem sem a data e a marca do celular, sem pessoas e sem placas legíveis. As fotos de 960 px (Paredes e Piscinas) passam pela limpeza com IA (Swin2SR) antes de exportar. Não há fotos de banco de imagens no site, exceto o histórico dos créditos no fim deste arquivo.
  O hero não tem foto: no desktop a logo 3D ocupa a metade da direita; no celular vem depois dos botões e se monta quando aparece na tela.
- **Nitidez das imagens**: todas passam por limpeza de artefatos de compressão e ampliação com o modelo Swin2SR (versão "realworld", ONNX, feito para fotos reais; não inventa detalhe).
  Cada foto sai em 3 tamanhos AVIF (`svc-*-r3-480/800/1200`…) + um WebP de reserva, e o HTML usa `srcset`/`sizes`:
  o celular baixa só o necessário e a tela retina recebe resolução cheia. Fotos sem véu escuro (quadrados, obras, sede) usam qualidade maior.
  A imagem de compartilhamento (`og-v3.jpg`, 1200×630; ao refazer, mude o nome: o WhatsApp guarda a prévia em cache) é um cartão feito com a marca, não um print do site.
- **Serviços em quadrados** (`#servicos`): 6 quadrados com foto (2 colunas no celular, 3 no desktop). Tocar abre uma janela (`<dialog>` nativo: foco preso, Esc fecha, toque fora fecha, o botão "voltar" do celular fecha)
  com "Por que fazer", "O que a gente faz" e o botão "Quero fazer: pedir orçamento" (WhatsApp, fixo no rodapé da janela). Sem JavaScript/`<dialog>`, o toque leva direto ao WhatsApp. Para editar um serviço, mude o quadrado e a janela `svc-<nome>` no HTML.
  As fotos dos quadrados saem de `assets/img/svc-<nome>-480/800/1200`. **Regra: uma foto, um lugar.** As fotos reais do Israel (cobertura e muro de arrimo) aparecem só no carrossel de A empresa; os quadrados usam fotos de banco (Unsplash e domínio público),
  sem crédito no site (a licença não exige; veja o fim deste arquivo). Troque por fotos reais de outra obra assim que houver, nunca pela mesma foto do carrossel.
  Logo abaixo dos quadrados, o bloco "Dois jeitos de fechar a água" explica manta asfáltica × argamassa em duas frases cada (antes eram duas seções: Sistemas e Materiais).
- **Carrossel** (avaliações; o JS também serve para fotos): rolagem nativa do navegador com encaixe (`scroll-snap`); funciona por toque, mouse e teclado (setas, com o trilho em foco) e, sem JavaScript,
  continua deslizável. O JS (`[data-car]` em `src/js/main.js`) só cria botões e pontos e dá rótulos de acessibilidade ("1 de 3"). Sem rotação automática, de propósito (leitura e movimento reduzido).
  Para incluir uma foto ou avaliação, basta acrescentar mais um item `.car-slide` dentro do `.car-track`. **Avaliações: hoje há 3, todas reais (Google).** Só entram avaliações copiadas do perfil do Google da empresa (nome + texto, sem editar); nunca inventadas. O carrossel já comporta 6 ou mais: é só acrescentar `<figure class="quote car-slide">` no mesmo formato em `#avaliacoes`. O carrossel de A empresa abre com a foto real mais nítida (veículos da sede); as duas fotos de obra chegaram com só 384×288 px e, mesmo ampliadas 4× com IA (Swin2SR) e com acabamento de clareza, continuam limitadas: **peça os originais do celular ao cliente (enviados como "documento" no WhatsApp)** e troque `obra-cobertura-*` e `obra-muro-*`.
- **Orçamento em um lugar só** (`#contato`): frase e formulário (nome, serviço, local e "O que você está vendo?" em texto livre; tudo vira a mensagem pronta do WhatsApp, com "O que estou vendo: …"). Sem caixinhas de sinais: a pessoa escreve do jeito dela.
- **Rodapé = fechamento do site** (`#rodape`): os dois telefones em tipografia grande (o primeiro é WhatsApp e ligação; o segundo, ligação), botão de WhatsApp, horário, Instagram com o @, mapa do Google (carregado só quando chega perto, `loading="lazy"`) e cartão com endereço, "Como chegar" e Waze. O botão flutuante do WhatsApp some quando o rodapé aparece (o rodapé já tem o seu e o botão não cobre os créditos). **Facebook**: a empresa ainda não informou página; quando houver, inclua uma linha em `.foot-info` e o link em `sameAs` no JSON-LD.
- **Horário no hero**: duas partes, estado em negrito + detalhe: "Aberto agora · até as 17h" ou "Fechado agora · abre hoje/amanhã/seg às 07:30". No celular o detalhe vai para a linha de baixo.
- **Fotos usadas e descartadas**: da sede entraram só três (estoque, veículos da equipe e rolos de manta), com as placas borradas antes da limpeza. Ficaram de fora fotos com objetos pessoais, enquadramentos ruins
  e os stories de Instagram (arte de terceiros e texto embutido na imagem). Os originais enviados pelo cliente ficam na pasta `originais-cliente/`, ignorada pelo git de propósito (o repositório é público e as fotos têm placas sem borrar).
- **Só conteúdo real**: textos, endereço, telefone e avaliações vêm da própria empresa (Google). Sem produtos, preços, números ou clientes inventados.
  Fatos informados pela empresa: horário (segunda a sexta, 7h30 às 17h; sábado e domingo fechado), atendimento em Botucatu e região, 12 anos no ramo,
  garantia de 5 anos, orçamento sem taxa em Botucatu e taxa de visita fora da cidade.
- **Horário em tempo real**: no hero, uma linha mostra se estamos abertos (fuso de Brasília) ou quando abrimos de novo. Sem JavaScript, fica o horário fixo.
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
ordem das seções     hero · serviços (+ materiais) · como funciona · a empresa · avaliações · dúvidas · contato (fundos claro/escuro se alternam)
src/js/main.js          menu, cabeçalho, botão flutuante, horário, carrosséis, janelas de serviço e formulário → WhatsApp
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

O endereço oficial é **`www.israelimpermeabilizações.com.br`** (no código, em ASCII: `www.xn--israelimpermeabilizaes-j7b05a.com.br`; o acento vira `xn--…` na internet). Está em `index.html` (canonical, `og:image`, JSON-LD), `sitemap.xml` e `robots.txt`. O `israel-impermeabilizacoes.vercel.app` continua funcionando. Se um dia registrarem o sem acento (`israelimpermeabilizacoes.com.br`), troque a URL nesses mesmos lugares e deixe o antigo redirecionando.
`sitemap.xml` e `robots.txt`; depois ligue o domínio no projeto da Vercel e refaça `npm run build`. Redirecione o endereço antigo para o novo.

## Como editar

- **Textos, horário, endereço, garantia**: `index.html`. O horário aparece em Contato, no hero e nos dados estruturados (`openingHoursSpecification`); as perguntas do FAQ aparecem no HTML e também no JSON-LD (mantenha os dois iguais).
- **Número do WhatsApp**: procure por `5514997341789` em `index.html` e em `src/js/main.js`.
- **Cores e fonte**: variáveis no topo de `src/css/base.css`. Fonte única: Inter (peso 400–800, tamanho óptico 14–32), em `assets/fonts/`.
- **E-mail**: não há e-mail confirmado, por isso ele não aparece. Para incluir, adicione na lista `.ct-list` de `#contato`.
- **Fotos de obras**: coloque em `assets/img/` (AVIF/WebP, com `width`/`height`) e inclua como mais um `.car-slide` no carrossel de `#empresa`, no mesmo formato das atuais.
  As duas fotos atuais chegaram com só 384×288 px (os arquivos originais estão no histórico do git, commit `3953801`). Foram ampliadas 4× com o modelo de
  super-resolução Swin2SR (versão "realworld", em ONNX, feita para fotos reais comprimidas: limpa os artefatos sem inventar detalhes). Mesmo assim, o ideal é trocar pelos originais.
  As fotos da sede chegaram pelo WhatsApp (já comprimidas) e passaram pela mesma limpeza, a partir de uma versão reduzida pela metade.

## Créditos das fotos de banco (não aparecem no site)

As licenças não exigem crédito (Unsplash e CC0), então o site não mostra a lista. Fica aqui como registro: **Unsplash** (licença livre): Max van den Oetelaar, Glenn Carstens-Peters, Will Henfield, Pilar Rubio, Michael Jasmund e Ömer Haktan Bulut (fotos de ambiente; só a do quadrado de telhados continua no site); Brandon Griggs (quadrado de Paredes), Sergej / skstrannik (Muros de arrimo) e Iain / photoken123 (Alicerces e baldrames, vista aérea), todos em alta resolução e sem pessoas
**CC0** (WordPress Photo Directory): piscina e laje, de Alina Kakshapati; muro de arrimo, de Bigul Malayi. Se algum dia entrar uma foto com licença que exija crédito (por exemplo, CC BY), o crédito volta ao rodapé.


## Trocar uma foto: mude o nome do arquivo

Os arquivos de `assets/img/` têm cache longo no navegador (e na Vercel). Se você trocar a foto **mantendo o mesmo nome**, quem já visitou continua vendo a antiga. Por isso as fotos de Paredes, Muros de arrimo e Alicerces têm `-r3-` no nome (`svc-muros-r3-800.webp`): ao trocar de novo, use `-r4-` e atualize o `index.html`.

## Ícones e logo (trocar = mudar o nome do arquivo)

`favicon-v2.svg`, `icon-192-v2.png`, `icon-512-v2.png`, `apple-touch-icon-v2.png` e `logo-mark-v2.svg` (máscara do brilho) vêm da mesma geometria do símbolo. Ao mexer na logo, gere de novo e use `-v3` nos nomes.


## Galeria Obras (`#obras`)

Carrossel de rolagem nativa (3 fotos lado a lado no desktop, 2 no tablet, 1 no celular). Cada foto é um `<figure class="car-slide">` com AVIF + WebP e `alt` descritivo; as imagens são `obra-<nome>-<largura>`. Para incluir uma foto nova, exporte nos mesmos tamanhos e acrescente outro `figure` no mesmo formato. Fotos dos quadrados de Serviços usam `-r4-` no nome (próxima troca: `-r5-`).
