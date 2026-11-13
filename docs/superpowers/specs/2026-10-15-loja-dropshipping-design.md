# Loja de dropshipping manual para o público europeu

Data: 2026-10-15

## Objetivo

Uma loja em Next.js, na VPS do Brasil, para tráfego pago. O cliente europeu vê o produto, paga a loja e acompanha o pedido. O operador compra no fornecedor e o envio vai direto ao comprador. O lucro é a diferença.

A primeira versão cabe num único plano de implementação: vitrine, checkout, acompanhamento e um admin simples.

## Decisões fechadas

- Loja própria em Next.js, no mesmo tipo de stack do Garagem Seminovos. WordPress fica de fora.
- Idioma da loja: inglês. Idioma do admin: português.
- Moeda: euro. O preço do catálogo já inclui IVA e é o valor cobrado em toda a União Europeia.
- O produto sai de estoque dentro da União Europeia. O preço da página é o preço final. O cliente não recebe taxa alfandegária depois.
- Público da primeira versão: os 27 países da União Europeia. Reino Unido, Suíça e Noruega ficam de fora.
- Checkout de convidado. Sem conta de cliente.
- Pagamento por Stripe (cartão, Apple Pay e Google Pay) e PayPal.
- E-mail transacional pela Resend.
- CDN: Cloudflare, na frente só das páginas e fotos públicas.
- VPS no Brasil, compartilhada com os outros projetos. O nginx do host separa cada projeto pelo domínio.
- A loja é uma aplicação. O mesmo conjunto de páginas serve celular e computador.
- A página pública lê só o banco da loja. O operador cria produtos à mão ou gera um conjunto inicial já preenchido.

## Experiência do cliente

O anúncio abre a página do produto, não a home.

1. Página do produto. A primeira tela mostra foto, nome, preço final em euro, prazo de entrega e um botão de compra. O frete da UE aparece nessa tela.
2. Catálogo, para quem quiser ver outros produtos.
3. Carrinho no navegador.
4. Checkout curto: e-mail, nome, endereço e país da UE. Telefone é opcional. O resumo do pedido fica visível. Antes do botão de pagar, um aviso curto aponta a devolução de 14 dias.
5. Página do pedido, aberta pelo link do e-mail. Sem login.
6. Páginas fixas: entrega, devolução, privacidade, contato e identificação da loja. O texto em inglês vem com a aplicação. Nome, endereço, e-mail e frete saem da configuração.

O aviso de cookies aparece antes de qualquer pixel do Meta ou do Google. A recusa deixa a loja usável. Os pixels só entram depois do aceite. A escolha, aceite ou recusa, fica num cookie. O preço aparece como euro com duas casas e ponto decimal, por exemplo €12.50.

Não há avaliações inventadas. Prova social só entra depois, com avaliações reais.

## Responsividade

Não existe site separado para celular.

- Abaixo de 1024 px: uma coluna. Na página do produto, a barra de compra fica fixa no rodapé da tela. No checkout, os campos ocupam a largura útil.
- A partir de 1024 px: galeria ao lado da caixa de compra; catálogo em grade; checkout com o resumo ao lado do formulário.
- O mesmo conteúdo, os mesmos preços e os mesmos estados nos dois formatos.
- Botões e links funcionam por toque, mouse e teclado.

## Estados do pedido

O cliente nunca vê fornecedor, custo ou margem.

| Status interno (admin) | Status do cliente | Texto na loja |
| --- | --- | --- |
| `awaiting_payment` | `awaiting_payment` | Awaiting payment |
| `paid` | `confirmed` | Order confirmed |
| `buy_from_supplier` | `processing` | Processing |
| `supplier_confirmed` | `processing` | Processing |
| `shipped` | `shipped` | Shipped |
| `delivered` | `delivered` | Delivered |
| `cancelled` | `cancelled` | Cancelled |
| `refunded` | `refunded` | Refunded |
| `problem` | `processing` | Processing |

`problem` é falta de estoque no fornecedor, ou outro bloqueio depois do pagamento. O cliente continua em Processing até o reembolso, que passa os dois status para `refunded`.

E-mail só sai quando o status do cliente muda. A passagem de `buy_from_supplier` para `supplier_confirmed` não gera e-mail, porque o cliente permanece em Processing.

Textos dos e-mails:

- Order confirmed: o pedido foi confirmado e está sendo preparado. Repete o prazo de entrega.
- Shipped: transportadora e código de rastreio, com link para a página do pedido.
- Delivered: o pedido foi entregue, com link para a página do pedido.
- Cancelled: o pedido foi cancelado antes do pagamento.
- Refunded: o pagamento será estornado e o pedido não seguirá. Esse é o único e-mail do caso sem estoque. Marcar `problem` não envia e-mail.

## Arquitetura

```text
Cliente na Europa
  -> Cloudflare (cache de GET /, /p/*, fotos)
  -> nginx na VPS do Brasil (TLS e domínio)
  -> Next.js
  -> PostgreSQL e disco de fotos, na mesma VPS
```

Checkout, página do pedido, admin, webhooks e qualquer POST não passam pelo cache da Cloudflare. O cache também ignora o cookie de sessão do admin.

Stripe e PayPal avisam o servidor por webhook. A loja confere a assinatura do webhook antes de mudar o pedido. O redirecionamento do navegador não marca o pedido como pago. O primeiro operador nasce na subida da aplicação, com e-mail e senha vindos do ambiente, e a senha fica só como hash.

A latência Brasil–Europa fica em torno de 200 ms. Ela atinge checkout, admin e webhooks. A página do anúncio e as fotos saem do cache na Europa.

Deploy: Docker Compose na VPS, com o app e o PostgreSQL. O nginx do host faz o proxy para o app. Backup diário: `pg_dump` e a pasta de fotos, com retenção de 7 dias na VPS. A Cloudflare não armazena pedido nem dado de pagamento.

Ao salvar um produto, a loja pede à Cloudflare a limpeza do cache da home, da página daquele produto e das fotos alteradas.

## Modelo de dados

Valores de dinheiro são inteiros em centavos de euro.

`products`

- `id`, `slug` único, `name`, `description`
- `price_cents`: preço final com IVA
- `delivery_min_days`, `delivery_max_days`
- `active`
- Produto inativo some do catálogo e a página responde 404

`product_images`

- `product_id`, caminho no disco da VPS, `alt`, `position`
- A primeira imagem, pela `position`, é a foto da abertura

`settings`

- uma linha: `eu_shipping_cents`, nome legal da loja, e-mail de contato, endereço da identificação

`admin_users`

- um operador: e-mail e senha com hash

`orders`

- `public_token`: token longo e aleatório, usado na URL
- e-mail, nome, endereço (`line1`, `line2`, cidade, código postal, `country_code` de um país da UE)
- `shipping_cents`, `subtotal_cents`, `total_cents`, `currency = EUR`
- `customer_status`, `internal_status`
- `payment_provider` (`stripe` ou `paypal`), `payment_reference` único
- `carrier`, `tracking_code`
- `internal_note`: anotação do operador, inclusive pedido do fornecedor. Só no admin

`order_items`

- `order_id`, `product_id`, nome e `unit_price_cents` copiados no momento da compra, `quantity`

Não há tabela de cliente. Não há variantes, cupom nem estoque local na primeira versão. A quantidade máxima por item no carrinho é 10.

## Fluxo de compra

1. O carrinho fica no `localStorage`: `productId` e `quantity`.
2. O checkout cria um pedido em `awaiting_payment` e abre o Stripe ou o PayPal.
3. Tentar pagar de novo o mesmo checkout reutiliza esse pedido enquanto ele seguir aguardando pagamento.
4. O webhook aprovado grava a referência de pagamento, passa o interno para `paid` e o cliente para `confirmed`, e envia o e-mail Order confirmed. Um webhook repetido com a mesma referência não cria outro pedido nem outro e-mail.
5. O admin vê a fila “comprar no fornecedor”. O operador avança para `buy_from_supplier` e, quando o fornecedor confirma, para `supplier_confirmed`.
6. Ao lançar transportadora e rastreio, os dois status vão para `shipped` e sai o e-mail Shipped.
7. O operador pode marcar `delivered`. O status do cliente muda e sai o e-mail Delivered.
8. Cancelar antes do pagamento marca `cancelled` nos dois e envia o e-mail Cancelled. O reembolso depois do pagamento é feito pelo operador no painel do Stripe ou do PayPal. Em seguida ele registra o reembolso no admin, que marca `refunded` nos dois e envia o e-mail Refunded. A primeira versão não chama a API de reembolso.

O frete é uma taxa única para toda a UE, configurada no admin e mostrada na página do produto. O total é `subtotal + frete`. O país do endereço precisa estar na lista dos 27. Fora isso, o checkout recusa o endereço.

## Falhas

- Pagamento recusado: o cliente permanece no checkout, vê a mensagem na hora, e o pedido segue `awaiting_payment`.
- Webhook atrasado: a página do pedido mostra que o pagamento está sendo conferido e o status segue Awaiting payment.
- Fornecedor sem o item depois do pagamento: o operador marca `problem`, escreve a nota interna e faz o reembolso no Stripe ou no PayPal. O cliente segue em Processing até o operador registrar o reembolso no admin.
- Endereço incompleto ou país fora da UE: o checkout aponta o campo e não abre o pagamento.
- Item do carrinho inativo ou apagado: o checkout pede para removê-lo e não abre o pagamento. O preço cobrado é o preço atual do produto, copiado para o pedido nesse momento.
- Falha no envio de e-mail: o status do pedido já foi gravado. O admin pode reenviar o e-mail daquele status.

## Conjunto inicial

No admin, em Produtos, o operador informa uma categoria e uma quantidade de 4, 8 ou 12. A loja grava esses produtos no mesmo banco, com os campos obrigatórios já preenchidos:

- nome, slug e descrição de venda em inglês, com uso, o que está incluído e cuidados
- preço de exemplo em euro, com IVA
- prazo de 7 a 14 dias
- uma foto neutra gerada pela loja, com texto alternativo
- `active = false`

O texto é original da loja, no tipo de produto que costuma vender naquela categoria. A geração não copia anúncio, foto ou marca de outra loja.

O produto inativo fica só no admin. Some do catálogo, a página pública responde 404 e o checkout recusa o item. O operador revisa preço, troca a foto pela foto real e ativa quando já pode comprar no fornecedor e enviar ao cliente. Produto ativo sem essa condição não faz parte desta versão: o cliente só paga o que a loja consegue cumprir.

Criar um produto em branco, em `/admin/products/new`, continua disponível.

## Admin

Um login. Sessão por cookie seguro, inacessível ao JavaScript.

- Pedidos em aberto, com a fila dos pagos que ainda precisam ser comprados no fornecedor.
- Detalhe do pedido: status interno, nota interna, reembolso, transportadora e rastreio.
- Produtos: nome, slug, descrição, preço, prazo mínimo e máximo, fotos, ativo ou inativo, e a ação de gerar o conjunto da categoria.
- Configuração: frete único da UE, nome legal, e-mail e endereço da loja.

A tela do cliente não lê `internal_status`, `internal_note`, custo nem fornecedor.

## Rotas

| Rota | Uso |
| --- | --- |
| `/` | Catálogo dos produtos ativos |
| `/p/[slug]` | Página do anúncio e do produto |
| `/cart` | Carrinho |
| `/checkout` | Checkout |
| `/order/[token]` | Confirmação e acompanhamento |
| `/shipping` | Entrega |
| `/returns` | Devolução de 14 dias |
| `/privacy` | Privacidade |
| `/contact` | Contato |
| `/legal` | Identificação da loja |
| `/admin/login` | Login do operador |
| `/admin/orders` | Fila de pedidos |
| `/admin/orders/[id]` | Pedido |
| `/admin/products` | Lista de produtos |
| `/admin/products/new` | Produto novo |
| `/admin/products/[id]` | Edição |
| `/admin/settings` | Frete e dados legais |

## Verificação

- Página do produto abaixo e a partir de 1024 px: foto, preço com IVA, frete e botão de compra visíveis sem contradizer o conteúdo.
- Compra com webhook aprovado cria um pedido `confirmed` e um e-mail. Webhook repetido não duplica.
- Pagamento recusado não muda o status para pago.
- A página `/order/[token]` e os e-mails não contêm fornecedor, nota interna nem status interno.
- Mudar de `buy_from_supplier` para `supplier_confirmed` não envia e-mail. Lançar rastreio envia o e-mail Shipped.
- País fora da UE não conclui o checkout.
- Produto inativo responde 404 e não aparece no catálogo.
- Gerar um conjunto grava a quantidade pedida, com os campos obrigatórios preenchidos e `active = false`. Nenhum desses produtos aparece na loja pública.
- Pixel de anúncio ausente antes do aceite dos cookies.

## Fora da primeira versão

Conta de cliente, mais de um idioma, blog, cupom, Klarna, variantes, estoque local, integração com fornecedor, importação de anúncios de outras lojas, frete por país e venda para Reino Unido, Suíça ou Noruega.
