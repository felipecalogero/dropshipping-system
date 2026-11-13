import { describe, expect, it } from "vitest";
import { visibleCopy } from "../../src/catalog";

describe("visibleCopy", () => {
  it("esconde benefício, caixa, cuidado e pergunta vazios", () => {
    expect(
      visibleCopy({
        benefits: JSON.stringify(["", "  ", "Washable cover"]),
        included: "  ",
        care: "",
        faq: JSON.stringify([
          { q: "", a: "" },
          { q: "How does it ship?", a: "From a United States warehouse." },
        ]),
      }),
    ).toEqual({
      benefits: ["Washable cover"],
      included: "",
      care: "",
      faq: [{ q: "How does it ship?", a: "From a United States warehouse." }],
    });
  });
});
