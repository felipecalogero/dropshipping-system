import { NextResponse } from "next/server";
import Stripe from "stripe";
import { orderEmail } from "../../../../src/email/messages";
import { markPaidFromWebhook } from "../../../../src/orders/mark-paid";
import { customerStatus, type InternalStatus } from "../../../../src/domain/orders";
import { prisma } from "../../../../src/db";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ ok: false }, { status: 500 });
  const stripe = new Stripe(key);
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature || "", secret);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (event.type !== "checkout.session.completed") return NextResponse.json({ ok: true });
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  const reference = session.payment_intent ? String(session.payment_intent) : session.id;
  if (!orderId) return NextResponse.json({ ok: true });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ ok: true });
  const taxCents = session.total_details?.amount_tax ?? 0;
  const result = markPaidFromWebhook(
    { internalStatus: order.internalStatus as InternalStatus, paymentReference: order.paymentReference },
    { signatureOk: true, reference },
  );
  if (result.changed) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        internalStatus: result.order.internalStatus,
        customerStatus: customerStatus(result.order.internalStatus),
        paymentReference: result.order.paymentReference,
        taxCents,
        totalCents: order.subtotalCents + order.shippingCents + taxCents,
      },
    });
    if (result.sendEmail) {
      const bodyText = orderEmail("confirmed", {
        publicToken: order.publicToken,
        deliveryMinDays: order.deliveryMinDays,
        deliveryMaxDays: order.deliveryMaxDays,
        storeUrl: process.env.NEXT_PUBLIC_STORE_URL,
      });
      console.info("order-email", order.email, bodyText);
    }
  }
  return NextResponse.json({ ok: true });
}
