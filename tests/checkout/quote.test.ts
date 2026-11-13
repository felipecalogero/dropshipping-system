import { describe, expect, it } from "vitest";
import { quoteCheckout } from "../../src/checkout/quote";

const base = {
  checkoutPublic: true,
  stateCode: "CA",
  phone: "4155550100",
  active: true,
  usStock: 2,
  category: "bed" as const,
  priceCents: 4900,
  supplierCostCents: 2000,
  photoConfirmed: true,
  settings: { minContributionCents: 800, adContributionCents: 3900 },
};

describe("quoteCheckout", () => {
  it("não inventa frete quando a CJ não cotou", () => {
    const result = quoteCheckout({ ...base, quote: null });
    expect(result).toEqual({ ok: false, reason: "no_quote" });
  });

  it("recusa Porto Rico", () => {
    const result = quoteCheckout({
      ...base,
      stateCode: "PR",
      quote: { shippingCents: 800 },
    });
    expect(result).toEqual({ ok: false, reason: "bad_state" });
  });

  it("recusa quando o checkout público está desligado", () => {
    const result = quoteCheckout({
      ...base,
      checkoutPublic: false,
      quote: { shippingCents: 800 },
    });
    expect(result).toEqual({ ok: false, reason: "checkout_closed" });
  });
});
