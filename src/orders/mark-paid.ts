import type { InternalStatus } from "../domain/orders";

export function markPaidFromWebhook(
  order: { internalStatus: InternalStatus; paymentReference: string | null },
  event: { signatureOk: boolean; reference: string },
): {
  changed: boolean;
  sendEmail: boolean;
  order: { internalStatus: InternalStatus; paymentReference: string | null };
} {
  if (!event.signatureOk) {
    return { changed: false, sendEmail: false, order };
  }
  if (order.paymentReference === event.reference) {
    return { changed: false, sendEmail: false, order };
  }
  if (order.internalStatus !== "awaiting_payment") {
    return { changed: false, sendEmail: false, order };
  }
  return {
    changed: true,
    sendEmail: true,
    order: { internalStatus: "paid", paymentReference: event.reference },
  };
}
