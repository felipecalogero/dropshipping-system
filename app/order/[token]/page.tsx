import { notFound } from "next/navigation";
import { BackLink } from "../../../components/back-link";
import { publicOrderView } from "../../../src/catalog";
import { prisma } from "../../../src/db";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { token } = await params;
  const { notice } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { publicToken: token },
    include: { items: true },
  });
  if (!order) notFound();
  const view = publicOrderView(order);
  return (
    <main className="wrap plain">
      <BackLink href="/">Back to shop</BackLink>
      <h1>{view.label}</h1>
      {notice === "payment_not_connected" ? <p className="notice">Payment is not connected yet, so the card was not charged.</p> : null}
      <p>Delivery window: {view.delivery}</p>
      {view.items.map((item) => (
        <p key={item.name}>{item.quantity} × {item.name} — {item.price}</p>
      ))}
      <p>Subtotal {view.subtotal}</p>
      <p>Shipping {view.shipping}</p>
      <p>Tax {view.tax}</p>
      <p>Total {view.total}</p>
      {view.carrier && view.trackingCode ? <p>{view.carrier} {view.trackingCode}</p> : null}
    </main>
  );
}
