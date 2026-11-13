import { formatUsd } from "./domain/money";
import { customerLabel, type InternalStatus } from "./domain/orders";

export type Faq = { q: string; a: string };

export function parseBenefits(value: string): string[] {
  const parsed = JSON.parse(value) as string[];
  return parsed.slice(0, 3);
}

export function parseFaq(value: string): Faq[] {
  const parsed = JSON.parse(value) as Faq[];
  return parsed.slice(0, 3);
}

export function visibleCopy(input: { benefits: string; included: string; care: string; faq: string }) {
  return {
    benefits: parseBenefits(input.benefits).map((item) => item.trim()).filter(Boolean),
    included: input.included.trim(),
    care: input.care.trim(),
    faq: parseFaq(input.faq).filter((item) => item.q.trim() && item.a.trim()),
  };
}

export function money(cents: number): string {
  return formatUsd(cents);
}

export function publicOrderView(order: {
  publicToken: string;
  internalStatus: string;
  shippingCents: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  carrier: string | null;
  trackingCode: string | null;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  items: { name: string; quantity: number; unitPriceCents: number }[];
}) {
  return {
    token: order.publicToken,
    label: customerLabel(order.internalStatus as InternalStatus),
    shipping: money(order.shippingCents),
    subtotal: money(order.subtotalCents),
    tax: money(order.taxCents),
    total: money(order.totalCents),
    carrier: order.carrier,
    trackingCode: order.trackingCode,
    delivery: `${order.deliveryMinDays}–${order.deliveryMaxDays} days`,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: money(item.unitPriceCents),
    })),
  };
}
