import { describe, expect, it } from "vitest";
import { contributionCents } from "../../src/domain/money";

describe("contributionCents", () => {
  it("deixa 2280 centavos na cama de exemplo", () => {
    expect(
      contributionCents({
        priceCents: 4900,
        shippingCents: 800,
        supplierCostCents: 2000,
      }),
    ).toBe(2280);
  });
});
