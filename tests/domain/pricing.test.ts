import { describe, expect, it } from "vitest";
import { adEligible, canActivate, pricePlace, proposePriceCents } from "../../src/domain/pricing";

const settings = {
  minContributionCents: 800,
  adContributionCents: 3900,
};

describe("pricing", () => {
  it("propõe o meio da faixa da cama", () => {
    expect(proposePriceCents("bed", 2000, 800, settings)).toBe(4400);
    expect(pricePlace("bed", 4400, 800)).toBe("meio");
  });

  it("marca o mínimo quando o meio não cabe", () => {
    expect(pricePlace("bed", 2700, 800)).toBe("minimo");
  });

  it("ativa a cama de exemplo e recusa anúncio", () => {
    const input = {
      category: "bed" as const,
      priceCents: 4900,
      shippingCents: 800,
      supplierCostCents: 2000,
      usStock: 3,
      photoConfirmed: true,
      hasQuote: true,
      settings,
    };
    expect(canActivate(input)).toBe(true);
    expect(adEligible(input)).toBe(false);
  });

  it("não ativa sem estoque americano", () => {
    expect(
      canActivate({
        category: "bed",
        priceCents: 4900,
        shippingCents: 800,
        supplierCostCents: 2000,
        usStock: 0,
        photoConfirmed: true,
        hasQuote: true,
        settings,
      }),
    ).toBe(false);
  });
});
