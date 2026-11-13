import { notFound } from "next/navigation";
import { BackLink } from "../../../components/back-link";
import { BuyBox } from "../../../components/buy-box";
import { money, visibleCopy } from "../../../src/catalog";
import { prisma } from "../../../src/db";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, setting] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    prisma.setting.findUnique({ where: { id: 1 } }),
  ]);
  if (!product || !product.active) notFound();
  const copy = visibleCopy(product);

  return (
    <main className="wrap product-page">
      <BackLink href="/">Back to shop</BackLink>
      <div className="product">
      <div className="photo">
        {product.images[0] ? <img src={product.images[0].path} alt={product.images[0].alt} /> : null}
      </div>
      <article className="product-copy">
        <h1>{product.name}</h1>
        <p className="price">{money(product.priceCents)}</p>
        <p>Delivery in {product.deliveryMinDays}–{product.deliveryMaxDays} days from a United States warehouse.</p>
        <BuyBox productId={product.id} price={money(product.priceCents)} checkoutPublic={Boolean(setting?.checkoutPublic)} />
        <div className="facts">
          {copy.benefits.map((benefit) => <p key={benefit}>{benefit}</p>)}
          {copy.included ? (
            <div>
              <h3>What’s included</h3>
              <p>{copy.included}</p>
            </div>
          ) : null}
          {copy.care ? (
            <div>
              <h3>Care</h3>
              <p>{copy.care}</p>
            </div>
          ) : null}
          <div>
            <h3>Shipping</h3>
            <p>Ships from the United States. The shipping amount is calculated at checkout for your address.</p>
          </div>
          <div>
            <h3>Returns</h3>
            <p>30 days to return an unused item. Write to {setting?.email || "the shop"} and we send the return steps.</p>
          </div>
          {copy.faq.map((item) => (
            <div className="faq" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </article>
      </div>
    </main>
  );
}
