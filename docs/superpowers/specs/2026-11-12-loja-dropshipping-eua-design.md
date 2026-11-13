# Loja de dropshipping para os Estados Unidos

Data: 2026-11-12

Este spec substitui o de 2026-10-15. Aquele desenho vendia para a União Europeia, em euro, com frete único e compra manual sem fornecedor definido. As decisões abaixo são as que valem.

## Objetivo

Uma loja própria em Next.js para vender, do Brasil, produtos de conforto para cães e gatos a clientes nos Estados Unidos. O cliente paga em dólar. O repasse cai em reais. O produto sai de um armazém da CJ nos Estados Unidos e vai direto ao comprador. O operador não embala nada.

A primeira versão cabe num único plano: vitrine, checkout, pedido, admin e o envio do pedido à CJ em um clique. Anúncio pago fica desligado até existir um teste com teto de perda.

## Decisões fechadas

- Mercado da primeira versão: os 50 estados dos Estados Unidos e o Distrito de Columbia. Espanha, Reino Unido, Brasil e o resto da União Europeia ficam de fora.
- Idioma da loja: inglês. Idioma do admin: português.
- Moeda cobrada do cliente: dólar americano. O preço da página é o preço do produto. O frete entra no checkout, vindo da cotação da CJ para o armazém americano daquele item.
- Fornecedor: CJ Dropshipping. Só entra no catálogo público o item com estoque num armazém dos Estados Unidos. Envio da China não é oferta desta versão.
- Pagamento: Stripe, na conta do Brasil. O cliente é cobrado em dólar. O repasse é automático e diário, em reais, para o banco brasileiro. American Express e Discover não passam nessa conta. O caminho de pagamento é Visa e Mastercard emitidos fora do Brasil.
- Não há empresa nos Estados Unidos nesta versão. PayPal não entra.
- A CJ é paga em dólar, com saldo que o operador recarrega em lotes. O sistema não converte real em dólar sozinho.
- Checkout de convidado. Sem conta de cliente.
- E-mail transacional pela Resend.
- CDN: Cloudflare, na frente só das páginas e fotos públicas.
- Aplicação em Docker na VPS. O nginx do host separa o domínio. PostgreSQL na mesma VPS.
- País, moeda, idioma e conta Stripe são configuração. Trocar a conta Stripe no futuro não reescreve a loja. A Espanha não é construída agora.
- Não há avaliações inventadas. Prova social só entra depois, com avaliações reais.
- O nome comercial da loja é um campo da configuração. A loja não vai ao ar com um nome fictício no lugar dos dados legais.

## Por que os Estados Unidos

Números usados na escolha, para o plano não depender de memória:

- Varejo online dos EUA em 2025: US$ 1,2337 trilhão, 16,4% do varejo (US Census Bureau, divulgação de março de 2026).
- Conversão de e-commerce nos EUA em 2025: 3,40%. Ticket médio: €137 (ECDB, relatório de KPI 2026).
- Custo mediano por compra de Pets & Animals no Meta, agosto de 2025 a julho de 2026: US$ 38,51. CPM mediano da categoria: US$ 16,27 (Triple Whale, mais de 40 mil marcas).
- CPM de e-commerce no Meta, julho de 2026: EUA US$ 16,08, Reino Unido US$ 11,81, Espanha US$ 6,65, Brasil US$ 2,63 (Lebesgue, via Pace).
- Custo por compra publicado no Reino Unido: mediana em torno de £53 de julho de 2025 a julho de 2026 (Superads) e £42,68 em contas DTC faturadas em libra nos 12 meses até 28 de outubro de 2026 (MHI, 13 marcas). O IVA britânico de 20% fica dentro do preço.
- Espanha: conversão média em torno de 1,22% (Digital Nature, informe 2026) e ticket de €64 (IAB Spain com Elogia, 2026). Desde 1º de julho de 2026, pacote de fora da União Europeia abaixo de €150 paga €3 de direito aduaneiro por categoria de item.
- Brasil: o Pix foi 49% das transações de e-commerce em 2025 (NuvemCommerce 2026). Mercado Livre, Shopee e Amazon concentram o tráfego. O clique é barato e a loja desconhecida disputa com marketplace, parcelamento e Pix.

O clique americano é mais caro. O custo por compra de pet, US$ 38,51, cabe num pedido alto. Reino Unido e Espanha cobram o imposto dentro do preço e não ficam mais baratos por compra. O Brasil exige Pix e confiança de marketplace que esta loja não tem no início.

## Experiência do cliente

O anúncio abre a página do produto, não a home.

1. Página do produto, que também é a página de venda. Não há uma segunda página de oferta. A primeira tela mostra foto, nome, preço do produto em dólar, prazo vindo da cotação de referência e o botão de compra. Abaixo, na mesma página: três benefícios curtos, o que está incluído, cuidados, entrega, a devolução de 30 dias e três perguntas frequentes. O valor do frete não aparece nessa primeira tela. Ele é calculado no checkout para o CEP do cliente.
2. Catálogo, para quem quiser ver os outros produtos ativos. A home é esse catálogo, com o nome da loja e uma frase do que ela vende.
3. Carrinho no navegador.
4. Checkout curto: e-mail, nome, telefone, endereço e estado americano. O telefone é obrigatório porque a CJ exige. O resumo do pedido fica visível. Antes de pagar, um aviso curto aponta a devolução de 30 dias.
5. Página do pedido, aberta pelo link do e-mail. Sem login.
6. Páginas fixas: entrega, devolução, privacidade, contato e identificação da loja. O texto em inglês vem com a aplicação. Nome, endereço e e-mail saem da configuração.

O aviso de cookies aparece antes de qualquer pixel do Meta ou do Google. A recusa deixa a loja usável. Os pixels só entram depois do aceite. A escolha fica num cookie. O preço aparece como dólar com duas casas, por exemplo $48.00.

## Responsividade

Não existe site separado para celular.

- Abaixo de 1024 px: uma coluna. Na página do produto, a barra de compra fica fixa no rodapé da tela. No checkout, os campos ocupam a largura útil.
- A partir de 1024 px: galeria ao lado da caixa de compra; catálogo em grade; checkout com o resumo ao lado do formulário.
- O mesmo conteúdo, os mesmos preços e os mesmos estados nos dois formatos.
- Botões e links funcionam por toque, mouse e teclado.

## Visual

A loja parece um quarto de casa, não uma vitrine de gadget. Fundo claro, texto escuro, uma cor de destaque quente e calma, foto grande do produto e muito espaço em branco. O nome e o preço são o que se lê primeiro. Não há contador falso, selo de “mais vendido” inventado, estoque urgente nem avaliação sem compra real. A mesma direção vale para a home, a página do produto, o carrinho e o checkout.

## Catálogo e margem

A primeira leva tem oito produtos. Não há teto de cinco, nem teto de oito: o admin pode guardar mais. Oito é o tamanho do catálogo de abertura, para não encher a loja de item que não passa na conta. Cada produto é uma unidade vendável. Um tamanho diferente é outro produto. Não há variantes, cupom nem estoque local.

A busca da primeira leva usa a API da CJ, com dado ao vivo, nesta ordem:

1. Buscar nas categorias de cama, transporte, alimentação, higiene e organização para cães e gatos.
2. Ficar só com o SKU que tem estoque maior que zero num armazém dos Estados Unidos.
3. Ordenar pelos pedidos que a própria CJ informa para aquele SKU, quando o campo vier na resposta. Item sem esse campo continua elegível. A ordem não substitui a conta de margem.
4. Escolher o preço dentro da faixa que o americano já paga nesse tipo de produto, e calcular a sobra com o custo e o frete reais daquele SKU.
5. O operador confirma a foto. Os oito primeiros que passam nas condições de ativação viram rascunho inativo.

O anúncio de US$ 150 usa um único produto, e só se ele for elegível a anúncio. A linha de corte é o preço daquele produto.

O catálogo público só aceita conforto físico para cães e gatos: cama, transporte, alimentação, higiene e organização da casa. Ração, suplemento e aparelho com promessa médica ficam de fora. O texto de venda não promete cura, alívio clínico nem resultado de saúde.

Um produto só pode ser ativado quando as quatro condições são verdadeiras ao mesmo tempo:

1. A CJ informa estoque maior que zero num armazém dos Estados Unidos.
2. Existe cotação de frete desse armazém para o CEP de referência da configuração, guardada no produto e atualizada na ativação. O CEP de referência padrão é `64108`.
3. O total de preço mais frete, na cotação de referência, cabe na faixa da categoria, e a sobra é de pelo menos US$ 8,00.
4. O operador viu a foto e confirmou que ela mostra o item.

A faixa é o que o comprador americano já paga hoje nesse tipo de produto, em loja conhecida. A loja sem marca fica dentro da faixa, abaixo do produto de marca famosa. Total significa preço do produto mais o frete cobrado.

| Categoria | Total mínimo | Total máximo | Referência pública |
| --- | --- | --- | --- |
| Cama | US$ 35,00 | US$ 69,00 | Chewy, 2026: Serta US$ 35,00, Frisco ortopédica US$ 45,56, Beautyrest US$ 69,99 |
| Transporte e assento de carro | US$ 30,00 | US$ 65,00 | Varejo típico de transportadora e cama de carro, US$ 25,00 a US$ 70,00 |
| Alimentação | US$ 15,00 | US$ 28,00 | Comedouro lento anunciado entre US$ 18,00 e US$ 26,00 |
| Higiene | US$ 29,00 | US$ 69,00 | Kit caseiro anunciado entre US$ 25,00 e US$ 79,00 |
| Organização da casa | US$ 20,00 | US$ 49,00 | Acessório de casa, abaixo de uma cama de marca |

O preço de venda não é um percentual fixo em cima do custo. O admin propõe o meio da faixa. Se nesse meio a sobra for menor que US$ 8,00, desce até o mínimo da faixa. Se nem o mínimo deixar US$ 8,00, o produto não entra. O operador pode publicar o preço proposto ou outro dentro da faixa. Fora da faixa, o produto fica inativo.

A sobra é calculada em centavos de dólar. O frete cobrado do cliente nesta versão é o frete pago à CJ, sem acréscimo.

```text
receita = preço + frete
custo_fornecedor = custo do produto na CJ + frete
sobra = receita
      - custo_fornecedor
      - 5,99% da receita
      - taxa fixa da Stripe (padrão US$ 0,10)
      - 3% da receita, de reserva de câmbio do repasse
      - 3,5% do custo_fornecedor, de IOF na recarga do saldo da CJ
```

O 0,9101 implícito nessa conta é o que sobra da receita depois de 5,99% da Stripe e 3% de reserva de câmbio. O IOF de 3,5% incide sobre o custo do fornecedor. Exemplo de cama com custo de US$ 20,00, frete de US$ 8,00 e preço de US$ 49,00: a receita é US$ 57,00, o custo do fornecedor é US$ 28,00 e a sobra é US$ 22,80, cerca de 40% da receita. Esse total cabe na faixa da cama. O preço de US$ 70,99, que existia para forçar US$ 45,00 de sobra, fica acima da Beautyrest de US$ 69,99 e não é usado.

Um produto é elegível a anúncio só quando a sobra é de pelo menos US$ 39,00 e o total continua dentro da faixa. US$ 39,00 é o custo mediano de US$ 38,51 por compra de pet no Meta, arredondado. No exemplo da cama, US$ 22,80 não liberam anúncio. Se nenhum dos oito chegar a US$ 39,00 dentro da faixa, a primeira versão não roda anúncio.

Os percentuais, a taxa fixa, a sobra mínima de US$ 8,00, a sobra de anúncio de US$ 39,00, as faixas e o CEP de referência são campos da configuração. Se a sobra da cotação de referência cair abaixo de US$ 8,00, se o total sair da faixa, ou se o estoque americano chegar a zero, o produto volta a inativo, some do catálogo e a página responde 404. No checkout, a mesma fórmula roda de novo com o frete do CEP do cliente. CEP que deixe a sobra abaixo de US$ 8,00 ou o total fora da faixa não abre o pagamento.

A foto vem do anúncio daquele SKU na CJ. Título, descrição e texto alternativo são escritos pela loja. A loja não copia anúncio, foto ou marca de outra loja.

O custo, o armazém, o identificador da CJ e a sobra existem só no admin.

## Estados do pedido

O cliente nunca vê fornecedor, custo, margem nem saldo da CJ.

| Status interno | Status do cliente | Texto na loja |
| --- | --- | --- |
| `awaiting_payment` | `awaiting_payment` | Awaiting payment |
| `paid` | `confirmed` | Order confirmed |
| `sent_to_cj` | `processing` | Processing |
| `shipped` | `shipped` | Shipped |
| `delivered` | `delivered` | Delivered |
| `cancelled` | `cancelled` | Cancelled |
| `refunded` | `refunded` | Refunded |
| `problem` | `processing` | Processing |

`problem` é falta de estoque depois do pagamento, falha da CJ ou outro bloqueio. O cliente continua em Processing até o reembolso, que passa os dois status para `refunded`.

Saem e-mail Order confirmed, Shipped, Delivered, Cancelled e Refunded. A passagem de `paid` para `sent_to_cj` muda o texto do cliente de Order confirmed para Processing e não envia outro e-mail.

Textos dos e-mails:

- Order confirmed: o pedido foi confirmado e está sendo preparado. Repete o prazo de entrega.
- Shipped: transportadora e código de rastreio, com link para a página do pedido.
- Delivered: o pedido foi entregue, com link para a página do pedido.
- Cancelled: o pedido foi cancelado antes do pagamento.
- Refunded: o pagamento será estornado e o pedido não seguirá. Esse é o único e-mail do caso sem estoque. Marcar `problem` não envia e-mail.

## Arquitetura

```text
Cliente nos EUA
  -> Cloudflare (cache de GET /, /p/*, fotos)
  -> nginx na VPS (TLS e domínio)
  -> Next.js
  -> PostgreSQL e disco de fotos, na mesma VPS

Stripe Brasil  -> webhook -> pedido pago -> repasse em BRL
Admin          -> um clique -> API da CJ (armazém US) -> rastreio -> e-mail
```

Checkout, página do pedido, admin, webhooks e qualquer POST não passam pelo cache da Cloudflare. O cache também ignora o cookie de sessão do admin.

A cobrança usa a API da Stripe com a chave da conta brasileira e a moeda `usd`. O redirecionamento do navegador não marca o pedido como pago. Só o webhook com assinatura válida faz isso. O primeiro operador nasce na subida da aplicação, com e-mail e senha vindos do ambiente, e a senha fica só como hash.

Módulos, cada um com uma função:

| Módulo | Função | Depende de |
| --- | --- | --- |
| Catálogo | Lista produtos ativos e aplica a regra de margem e estoque | PostgreSQL, CJ |
| Vitrine | Páginas públicas em inglês | Catálogo |
| Checkout | Cria o pedido e abre a cobrança em dólar | Catálogo, Stripe, CJ (cotação) |
| Pedidos | Guarda status, endereço e token público | PostgreSQL |
| CJ | Consulta estoque, frete, cria o pedido no armazém americano e lê o rastreio | API da CJ |
| Admin | Fila em português, um clique para a CJ, produtos e configuração | Pedidos, Catálogo, CJ |
| E-mail | Envia o texto do status do cliente | Resend, Pedidos |
| Configuração | Nome legal, reservas de margem, faixas, Stripe e CJ | PostgreSQL, ambiente |

Deploy: Docker Compose na VPS, com o app e o PostgreSQL. O nginx do host faz o proxy. Backup diário: `pg_dump` e a pasta de fotos, com retenção de 7 dias na VPS. A Cloudflare não armazena pedido nem dado de pagamento.

Ao salvar um produto, a loja pede à Cloudflare a limpeza do cache da home, da página daquele produto e das fotos alteradas.

## Modelo de dados

Valores de dinheiro são inteiros em centavos de dólar.

`products`

- `id`, `slug` único, `name`, `description`
- `price_cents`
- `cj_vid`, `cj_warehouse_id`, `supplier_cost_cents`, `shipping_cents`
- `delivery_min_days`, `delivery_max_days`
- `contribution_cents`, calculado pela fórmula de sobra
- `active`
- Produto inativo some do catálogo e a página responde 404

`product_images`

- `product_id`, caminho no disco, `alt`, `position`
- A primeira imagem, pela `position`, é a foto da abertura

`settings`

- uma linha: nome legal, e-mail, endereço, CEP de referência (padrão `64108`), reservas da fórmula (5,99%, US$ 0,10, 3%, 3,5%), sobra mínima de US$ 8,00, sobra de anúncio de US$ 39,00, faixas de preço, lembrete do teste de anúncio (US$ 150,00) e o interruptor do checkout público

`admin_users`

- um operador: e-mail e senha com hash

`orders`

- `public_token`: token longo e aleatório, usado na URL
- e-mail, nome, telefone, endereço (`line1`, `line2`, cidade, código postal, `state_code` dos 50 estados ou DC)
- `shipping_cents`, `subtotal_cents`, `total_cents`, `currency = USD`
- `customer_status`, `internal_status`
- `payment_reference` único
- `cj_order_id`, `carrier`, `tracking_code`
- `internal_note`: anotação do operador. Só no admin

`order_items`

- `order_id`, `product_id`, nome, `unit_price_cents`, `supplier_cost_cents` e `cj_vid` copiados no momento da compra, `quantity`

Não há tabela de cliente. A quantidade máxima por item no carrinho é 10.

## Fluxo de compra

1. O carrinho fica no `localStorage`: `productId` e `quantity`.
2. O checkout confere estoque americano, recalcula o frete da CJ para o CEP informado e aplica a fórmula de sobra. CEP que deixe a sobra abaixo de US$ 8,00 ou o total fora da faixa não abre o pagamento.
3. O checkout cria um pedido em `awaiting_payment` e abre a Stripe em dólar.
4. Tentar pagar de novo o mesmo checkout reutiliza esse pedido enquanto ele seguir aguardando pagamento.
5. O webhook aprovado grava a referência de pagamento, passa o interno para `paid` e o cliente para `confirmed`, e envia o e-mail Order confirmed. Um webhook repetido com a mesma referência não cria outro pedido nem outro e-mail.
6. O admin mostra a fila “enviar à CJ”. O operador confere o saldo em dólar na CJ e clica uma vez. O interno vai para `sent_to_cj` e o cliente para `processing`. Esse clique não envia e-mail.
7. A loja consulta a CJ até existir transportadora e rastreio. Os dois status vão para `shipped` e sai o e-mail Shipped.
8. O operador pode marcar `delivered`. O status do cliente muda e sai o e-mail Delivered.
9. Cancelar antes do pagamento marca `cancelled` nos dois e envia o e-mail Cancelled. O reembolso depois do pagamento é feito pelo operador no painel da Stripe. Em seguida ele registra o reembolso no admin, que marca `refunded` nos dois e envia o e-mail Refunded. A primeira versão não chama a API de reembolso.

O estado do endereço precisa estar na lista dos 50 e do Distrito de Columbia. Fora isso, o checkout recusa o endereço. O total cobrado é `subtotal + frete` da cotação daquele CEP. A loja grava o estado para o imposto americano. Se a conta Stripe devolver um cálculo de imposto, esse valor entra no total e na linha do pedido. Se a conta não devolver cálculo, o total continua `subtotal + frete` e o estado fica registrado. Registrar e recolher sales tax é tarefa do contador antes de escalar o anúncio. Esta versão não pré-estoca mercadoria em armazém.

## Anúncio

O pixel só existe depois do aceite dos cookies. A loja não liga campanha.

O primeiro teste, quando o operador separar US$ 150, usa um produto elegível a anúncio, um conjunto de anúncios e uma linha de corte igual ao preço daquele produto. O criativo é a foto do produto, estática. Não há vídeo. Se nenhum produto tiver sobra de US$ 39,00 dentro da faixa, o teste não começa. Se o anúncio gastar o preço do produto sem nenhuma compra, o operador pausa. A loja não executa essa pausa: o teto é regra de operação, escrita no admin ao lado do produto. A página não mostra avaliação, nota, quantidade vendida nem depoimento sem um pedido real correspondente.

## Falhas

- Pagamento recusado, inclusive American Express nesta conta: o cliente permanece no checkout, vê a mensagem na hora, e o pedido segue `awaiting_payment`.
- Webhook atrasado: a página do pedido mostra que o pagamento está sendo conferido e o status segue Awaiting payment.
- Fornecedor sem o item depois do pagamento: o operador marca `problem`, escreve a nota interna e faz o reembolso na Stripe. O cliente segue em Processing até o operador registrar o reembolso no admin.
- Saldo da CJ insuficiente: o clique de envio não cria pedido na CJ. O pedido permanece `paid` e o admin mostra que falta saldo em dólar.
- API da CJ fora no checkout: o checkout não inventa frete e não abre o pagamento.
- Endereço incompleto ou estado fora da lista: o checkout aponta o campo e não abre o pagamento.
- Item do carrinho inativo, sem estoque americano, fora da faixa ou com sobra abaixo de US$ 8,00: o checkout pede para removê-lo e não abre o pagamento. O preço cobrado é o preço atual do produto, copiado para o pedido nesse momento.
- Falha no envio de e-mail: o status do pedido já foi gravado. O admin pode reenviar o e-mail daquele status.
- Checkout público desligado: a vitrine pode ser vista, o botão de compra explica que a loja ainda não cobra, e nenhum pedido é criado.

## Admin

Um login. Sessão por cookie seguro, inacessível ao JavaScript.

- Pedidos em aberto, com a fila dos pagos que ainda precisam ser enviados à CJ.
- Detalhe do pedido: status interno, nota interna, reembolso, transportadora, rastreio e o botão de um clique.
- Produtos: nome, slug, descrição, preço, custo, frete, sobra, prazo, fotos, ativo ou inativo, e a busca de um SKU na CJ. A busca só grava rascunho inativo. Ativar passa pela regra de margem e estoque.
- Configuração: dados legais, percentuais da sobra, taxa fixa, faixas e o interruptor do checkout público.

A tela do cliente não lê `internal_status`, `internal_note`, custo, margem nem identificador da CJ.

## Rotas

| Rota | Uso |
| --- | --- |
| `/` | Catálogo dos produtos ativos |
| `/p/[slug]` | Página do anúncio e do produto |
| `/cart` | Carrinho |
| `/checkout` | Checkout |
| `/order/[token]` | Confirmação e acompanhamento |
| `/shipping` | Entrega |
| `/returns` | Devolução de 30 dias |
| `/privacy` | Privacidade |
| `/contact` | Contato |
| `/legal` | Identificação da loja |
| `/admin/login` | Login do operador |
| `/admin/orders` | Fila de pedidos |
| `/admin/orders/[id]` | Pedido |
| `/admin/products` | Lista de produtos |
| `/admin/products/new` | Busca na CJ e rascunho |
| `/admin/products/[id]` | Edição |
| `/admin/settings` | Dados legais, margem e checkout público |

## Portões antes do ar

O checkout público começa desligado. Ele só é ligado depois de todos estes fatos:

1. A configuração tem nome legal, e-mail e endereço verdadeiros.
2. Uma cobrança real de Visa ou Mastercard emitido fora do Brasil foi aprovada na conta Stripe do Brasil, em dólar, e o repasse em reais apareceu no banco.
3. Os produtos ativos têm estoque americano, cotação, total dentro da faixa e sobra de pelo menos US$ 8,00.
4. Um pedido de teste percorreu o clique até a CJ em modo de teste da API, sem cobrar o cliente.
5. O saldo em dólar na CJ cobre pelo menos três envios do produto ativo mais caro: três vezes a soma do custo e do frete da cotação de referência. Esse saldo existe antes da primeira venda, porque o repasse da Stripe chega em reais e não paga a CJ a tempo.

O anúncio continua desligado mesmo depois desses quatro fatos, até o operador separar o teste de US$ 150.

## Verificação

- Página do produto abaixo e a partir de 1024 px: foto, preço em dólar, prazo e botão de compra visíveis sem contradizer o conteúdo.
- Compra com webhook aprovado cria um pedido `confirmed` e um e-mail. Webhook repetido não duplica.
- Pagamento recusado não muda o status para pago.
- A página `/order/[token]` e os e-mails não contêm fornecedor, nota interna, custo nem status interno.
- O clique para a CJ muda o cliente para Processing e não envia e-mail. Lançar rastreio envia o e-mail Shipped.
- Estado fora da lista não conclui o checkout.
- Produto inativo, sem estoque americano, fora da faixa ou com sobra abaixo de US$ 8,00 responde 404 e não aparece no catálogo.
- Checkout sem cotação da CJ não abre a Stripe e não grava um frete inventado.
- Clique de envio sem saldo não cria pedido na CJ e deixa o interno em `paid`.
- Pixel de anúncio ausente antes do aceite dos cookies.
- Com o checkout público desligado, a vitrine abre e nenhum pedido é criado.

## Fora da primeira versão

Conta de cliente, mais de um idioma, loja para Espanha, Reino Unido ou Brasil, blog, cupom, PayPal, Klarna, Bizum, variantes, estoque local, pré-estoque em armazém, envio automático à CJ sem o clique, API de reembolso, empresa nos Estados Unidos, avaliações e gestão de campanha dentro da loja.
