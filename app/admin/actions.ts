"use server";

import { redirect } from "next/navigation";
import { clearAdminCookie, currentAdmin, setAdminCookie, verifyPassword } from "../../src/auth";
import { decideSend } from "../../src/cj/send-order";
import { adEligible, canActivate, proposePriceCents, type Category } from "../../src/domain/pricing";
import { customerStatus, emailForTransition, type InternalStatus } from "../../src/domain/orders";
import { orderEmail } from "../../src/email/messages";
import { prisma } from "../../src/db";

async function requireAdmin() {
  const email = await currentAdmin();
  if (!email) redirect("/admin/login");
  return email;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) redirect("/admin/login?erro=1");
  await setAdminCookie(email);
  redirect("/admin");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/admin/login");
}

export async function sendToCj(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const [order, setting] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    prisma.setting.findUnique({ where: { id: 1 } }),
  ]);
  if (!order || order.internalStatus !== "paid" || !setting) redirect("/admin");
  const landed = order.items.reduce((sum, item) => sum + item.supplierCostCents * item.quantity, 0) + order.shippingCents;
  const decision = decideSend({ balanceCents: setting.cjBalanceCents, landedCents: landed });
  if (!decision.create) {
    await prisma.order.update({
      where: { id },
      data: { internalNote: "Saldo em dólar na CJ insuficiente. Pedido permanece pago." },
    });
    redirect(`/admin/orders/${id}`);
  }
  await prisma.order.update({
    where: { id },
    data: {
      internalStatus: decision.internalStatus,
      customerStatus: customerStatus(decision.internalStatus),
      cjOrderId: `local-${order.id}`,
    },
  });
  redirect(`/admin/orders/${id}`);
}

export async function syncTracking(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const carrier = String(formData.get("carrier") || "");
  const trackingCode = String(formData.get("trackingCode") || "");
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || !carrier || !trackingCode) redirect(`/admin/orders/${id}`);
  const kind = emailForTransition(order.internalStatus as InternalStatus, "shipped");
  await prisma.order.update({
    where: { id },
    data: { carrier, trackingCode, internalStatus: "shipped", customerStatus: customerStatus("shipped") },
  });
  if (kind) {
    console.info("order-email", order.email, orderEmail(kind, {
      publicToken: order.publicToken,
      carrier,
      trackingCode,
      storeUrl: process.env.NEXT_PUBLIC_STORE_URL,
    }));
  }
  redirect(`/admin/orders/${id}`);
}

export async function cancelOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.internalStatus !== "awaiting_payment") redirect(`/admin/orders/${id}`);
  await prisma.order.update({
    where: { id },
    data: { internalStatus: "cancelled", customerStatus: customerStatus("cancelled") },
  });
  console.info("order-email", order.email, orderEmail("cancelled", { publicToken: order.publicToken }));
  redirect(`/admin/orders/${id}`);
}

export async function recordRefund(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) redirect("/admin");
  await prisma.order.update({
    where: { id },
    data: { internalStatus: "refunded", customerStatus: customerStatus("refunded") },
  });
  console.info("order-email", order.email, orderEmail("refunded", { publicToken: order.publicToken }));
  redirect(`/admin/orders/${id}`);
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  if (!setting) redirect("/admin/products");
  const category = String(formData.get("category")) as Category;
  const supplierCostCents = Number(formData.get("supplierCostCents"));
  const shippingCents = Number(formData.get("shippingCents"));
  const proposed = proposePriceCents(category, supplierCostCents, shippingCents, setting);
  const priceCents = Number(formData.get("priceCents") || proposed || 0);
  const id = String(formData.get("id") || "");
  const data = {
    slug: String(formData.get("slug")),
    name: String(formData.get("name")),
    description: String(formData.get("description") || ""),
    benefits: JSON.stringify([
      String(formData.get("benefit1") || ""),
      String(formData.get("benefit2") || ""),
      String(formData.get("benefit3") || ""),
    ]),
    included: String(formData.get("included") || ""),
    care: String(formData.get("care") || ""),
    faq: JSON.stringify([
      { q: String(formData.get("q1") || ""), a: String(formData.get("a1") || "") },
      { q: String(formData.get("q2") || ""), a: String(formData.get("a2") || "") },
      { q: String(formData.get("q3") || ""), a: String(formData.get("a3") || "") },
    ]),
    category,
    priceCents,
    cjVid: String(formData.get("cjVid") || ""),
    cjWarehouseId: String(formData.get("cjWarehouseId") || ""),
    supplierCostCents,
    shippingCents,
    deliveryMinDays: Number(formData.get("deliveryMinDays") || 2),
    deliveryMaxDays: Number(formData.get("deliveryMaxDays") || 5),
    contributionCents: 0,
    usStock: Number(formData.get("usStock") || 0),
    photoConfirmed: formData.get("photoConfirmed") === "on",
    active: false,
  };
  const quotedAt = formData.get("quoted") === "on" ? new Date() : undefined;
  const { contributionCents } = await import("../../src/domain/money");
  data.contributionCents = contributionCents({ priceCents, shippingCents, supplierCostCents });
  const product = id
    ? await prisma.product.update({ where: { id }, data: { ...data, ...(quotedAt ? { quotedAt } : {}) } })
    : await prisma.product.create({ data: { ...data, quotedAt: quotedAt ?? null } });
  redirect(`/admin/products/${product.id}`);
}

export async function activateProduct(formData: FormData) {
  await requireAdmin();
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  const product = await prisma.product.findUnique({ where: { id: String(formData.get("id")) } });
  if (!setting || !product) redirect("/admin/products");
  const allowed = canActivate({
    category: product.category as Category,
    priceCents: product.priceCents,
    shippingCents: product.shippingCents,
    supplierCostCents: product.supplierCostCents,
    usStock: product.usStock,
    photoConfirmed: product.photoConfirmed,
    hasQuote: Boolean(product.quotedAt),
    settings: setting,
  });
  if (!allowed) redirect(`/admin/products/${product.id}?erro=ativar`);
  await prisma.product.update({ where: { id: product.id }, data: { active: true } });
  redirect(`/admin/products/${product.id}`);
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const legalName = String(formData.get("legalName") || "");
  const email = String(formData.get("email") || "");
  const address = String(formData.get("address") || "");
  const wantsPublic = formData.get("checkoutPublic") === "on";
  const checkoutPublic = wantsPublic && Boolean(legalName && email && address);
  await prisma.setting.update({
    where: { id: 1 },
    data: {
      legalName,
      email,
      address,
      tagline: String(formData.get("tagline") || ""),
      cjBalanceCents: Number(formData.get("cjBalanceCents") || 0),
      checkoutPublic,
    },
  });
  redirect("/admin/settings");
}

export async function productAdNote(productId: string) {
  const [product, setting] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.setting.findUnique({ where: { id: 1 } }),
  ]);
  if (!product || !setting) return false;
  return adEligible({
    category: product.category as Category,
    priceCents: product.priceCents,
    shippingCents: product.shippingCents,
    supplierCostCents: product.supplierCostCents,
    usStock: product.usStock,
    photoConfirmed: product.photoConfirmed,
    hasQuote: Boolean(product.quotedAt),
    settings: setting,
  });
}
