type ContributionInput = {
  priceCents: number;
  shippingCents: number;
  supplierCostCents: number;
  stripeRateBps?: number;
  stripeFixedCents?: number;
  fxReserveBps?: number;
  iofBps?: number;
};

export function contributionCents(input: ContributionInput): number {
  const stripeRateBps = input.stripeRateBps ?? 599;
  const stripeFixedCents = input.stripeFixedCents ?? 10;
  const fxReserveBps = input.fxReserveBps ?? 300;
  const iofBps = input.iofBps ?? 350;
  const revenue = input.priceCents + input.shippingCents;
  const supplier = input.supplierCostCents + input.shippingCents;
  const stripe = Math.round((revenue * stripeRateBps) / 10_000);
  const fx = Math.round((revenue * fxReserveBps) / 10_000);
  const iof = Math.round((supplier * iofBps) / 10_000);
  return revenue - supplier - stripe - stripeFixedCents - fx - iof;
}

export function formatUsd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = String(abs % 100).padStart(2, "0");
  return `${sign}$${dollars}.${remainder}`;
}
