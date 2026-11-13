import type { Category, PriceSettings } from "../domain/pricing";
import { canActivate } from "../domain/pricing";
import { contributionCents } from "../domain/money";
import { isUsState } from "../domain/us-states";

export type QuoteResult =
  | {
      ok: true;
      shippingCents: number;
      totalCents: number;
      contributionCents: number;
    }
  | {
      ok: false;
      reason:
        | "checkout_closed"
        | "bad_state"
        | "inactive"
        | "no_quote"
        | "out_of_band"
        | "below_margin"
        | "missing_phone";
    };

export function quoteCheckout(input: {
  checkoutPublic: boolean;
  stateCode: string;
  phone: string;
  active: boolean;
  usStock: number;
  category: Category;
  priceCents: number;
  supplierCostCents: number;
  photoConfirmed: boolean;
  settings: PriceSettings;
  quote: { shippingCents: number } | null;
}): QuoteResult {
  if (!input.checkoutPublic) return { ok: false, reason: "checkout_closed" };
  if (!input.phone.trim()) return { ok: false, reason: "missing_phone" };
  if (!isUsState(input.stateCode)) return { ok: false, reason: "bad_state" };
  if (!input.active || input.usStock <= 0) return { ok: false, reason: "inactive" };
  if (!input.quote) return { ok: false, reason: "no_quote" };
  const shippingCents = input.quote.shippingCents;
  const gate = {
    category: input.category,
    priceCents: input.priceCents,
    shippingCents,
    supplierCostCents: input.supplierCostCents,
    usStock: input.usStock,
    photoConfirmed: input.photoConfirmed,
    hasQuote: true,
    settings: input.settings,
  };
  if (!canActivate(gate)) {
    const total = input.priceCents + shippingCents;
    const contribution = contributionCents({
      priceCents: input.priceCents,
      shippingCents,
      supplierCostCents: input.supplierCostCents,
    });
    if (contribution < input.settings.minContributionCents) {
      return { ok: false, reason: "below_margin" };
    }
    return { ok: false, reason: "out_of_band" };
  }
  return {
    ok: true,
    shippingCents,
    totalCents: input.priceCents + shippingCents,
    contributionCents: contributionCents({
      priceCents: input.priceCents,
      shippingCents,
      supplierCostCents: input.supplierCostCents,
    }),
  };
}
