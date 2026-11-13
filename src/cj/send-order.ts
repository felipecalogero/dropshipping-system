import type { InternalStatus } from "../domain/orders";

export function decideSend(input: {
  balanceCents: number;
  landedCents: number;
}): { create: boolean; internalStatus: InternalStatus } {
  if (input.balanceCents < input.landedCents) {
    return { create: false, internalStatus: "paid" };
  }
  return { create: true, internalStatus: "sent_to_cj" };
}
