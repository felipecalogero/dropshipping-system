import type { EmailKind } from "../domain/orders";

type OrderMail = {
  publicToken: string;
  carrier?: string;
  trackingCode?: string;
  deliveryMinDays?: number;
  deliveryMaxDays?: number;
  storeUrl?: string;
};

export function orderEmail(kind: EmailKind, order: OrderMail): string {
  const link = `${order.storeUrl ?? ""}/order/${order.publicToken}`;
  if (kind === "confirmed") {
    const min = order.deliveryMinDays ?? 2;
    const max = order.deliveryMaxDays ?? 5;
    return `Your order is confirmed and is being prepared. Delivery takes ${min} to ${max} days. ${link}`;
  }
  if (kind === "shipped") {
    return `Your order has shipped with ${order.carrier}. Tracking code ${order.trackingCode}. ${link}`;
  }
  if (kind === "delivered") {
    return `Your order was delivered. ${link}`;
  }
  if (kind === "cancelled") {
    return `Your order was cancelled before payment. ${link}`;
  }
  return `Your payment will be refunded and the order will not continue. ${link}`;
}
