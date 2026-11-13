export type InternalStatus =
  | "awaiting_payment"
  | "paid"
  | "sent_to_cj"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "problem";

export type CustomerStatus =
  | "awaiting_payment"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type EmailKind = "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";

const BEFORE_PAYMENT: InternalStatus[] = ["awaiting_payment"];
const AFTER_PAYMENT: InternalStatus[] = [
  "paid",
  "sent_to_cj",
  "shipped",
  "delivered",
  "problem",
];

export function customerStatus(internal: InternalStatus): CustomerStatus {
  if (internal === "paid") return "confirmed";
  if (internal === "sent_to_cj" || internal === "problem") return "processing";
  return internal;
}

export function customerLabel(internal: InternalStatus): string {
  const labels: Record<CustomerStatus, string> = {
    awaiting_payment: "Awaiting payment",
    confirmed: "Order confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return labels[customerStatus(internal)];
}

export function emailForTransition(
  from: InternalStatus,
  to: InternalStatus,
): EmailKind | null {
  if (from === "awaiting_payment" && to === "paid") return "confirmed";
  if (from === "sent_to_cj" && to === "shipped") return "shipped";
  if (from === "shipped" && to === "delivered") return "delivered";
  if (to === "cancelled" && BEFORE_PAYMENT.includes(from)) return "cancelled";
  if (to === "refunded" && AFTER_PAYMENT.includes(from)) return "refunded";
  return null;
}
