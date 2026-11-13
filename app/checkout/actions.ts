"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { quoteCheckout } from "../../src/checkout/quote";
import type { Category } from "../../src/domain/pricing";
import { customerStatus } from "../../src/domain/orders";
import { prisma } from "../../src/db";
export async function placeOrder(formData: FormData) {
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  if (!setting?.checkoutPublic) {
    redirect("/checkout?notice=closed");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    redirect("/checkout?notice=payment_not_connected");
  }
  const cart = JSON.parse(String(formData.get("cart") || "[]")) as { productId: string; quantity: number }[];
  const stateCode = String(formData.get("stateCode") || "");
  const phone = String(formData.get("phone") || "");
  const products = await prisma.product.findMany({ where: { id: { in: cart.map((line) => line.productId) } } });
  let shippingCents = 0;
  let subtotalCents = 0;
  const freshHours = 24 * 60 * 60 * 1000;
  for (const line of cart) {
    const product = products.find((item) => item.id === line.productId);
    if (!product) redirect("/checkout?notice=missing");
    const quantity = Math.min(10, Math.max(1, line.quantity));
    const quoteFresh = product.quotedAt && Date.now() - product.quotedAt.getTime() < freshHours;
    const quote = quoteCheckout({
      checkoutPublic: true,
      stateCode,
      phone,
      active: product.active,
      usStock: product.usStock,
      category: product.category as Category,
      priceCents: product.priceCents,
      supplierCostCents: product.supplierCostCents,
      photoConfirmed: product.photoConfirmed,
      settings: {
        minContributionCents: setting.minContributionCents,
        adContributionCents: setting.adContributionCents,
      },
      quote: quoteFresh ? { shippingCents: product.shippingCents } : null,
    });
    if (!quote.ok) redirect(`/checkout?notice=${quote.reason}`);
    subtotalCents += product.priceCents * quantity;
    shippingCents += quote.shippingCents * quantity;
  }
  const order = await prisma.order.create({
    data: {
      publicToken: randomBytes(16).toString("hex"),
      email: String(formData.get("email") || ""),
      name: String(formData.get("name") || ""),
      phone,
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || ""),
      city: String(formData.get("city") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      stateCode,
      shippingCents,
      subtotalCents,
      taxCents: 0,
      totalCents: subtotalCents + shippingCents,
      customerStatus: customerStatus("awaiting_payment"),
      internalStatus: "awaiting_payment",
      deliveryMinDays: Math.max(...products.map((product) => product.deliveryMinDays)),
      deliveryMaxDays: Math.max(...products.map((product) => product.deliveryMaxDays)),
      items: {
        create: cart.map((line) => {
          const product = products.find((item) => item.id === line.productId)!;
          return {
            productId: product.id,
            name: product.name,
            unitPriceCents: product.priceCents,
            supplierCostCents: product.supplierCostCents,
            cjVid: product.cjVid,
            quantity: Math.min(10, Math.max(1, line.quantity)),
          };
        }),
      },
    },
  });
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    success_url: `${process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"}/order/${order.publicToken}`,
    cancel_url: `${process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"}/checkout?notice=cancelled`,
    metadata: { orderId: order.id },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: order.totalCents,
        product_data: { name: "Order" },
      },
    }],
  });
  if (!session.url) redirect(`/order/${order.publicToken}`);
  redirect(session.url);
}
