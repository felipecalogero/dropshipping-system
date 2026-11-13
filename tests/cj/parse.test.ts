import { describe, expect, it } from "vitest";
import { parseAging, parseFreight, parseProductList, parseUsStock, parseVariants, usdToCents } from "../../src/cj/parse";

describe("parse da CJ", () => {
  it("converte dólar em centavos", () => {
    expect(usdToCents("4.71")).toBe(471);
    expect(usdToCents(3)).toBe(300);
  });

  it("lê o prazo 2-5", () => {
    expect(parseAging("2-5")).toEqual({ minDays: 2, maxDays: 5 });
  });

  it("lê a lista de produtos", () => {
    const rows = parseProductList({
      data: {
        content: [
          {
            productList: [
              { id: "p1", nameEn: "Pet bed", bigImage: "https://img/bed.jpg", listedNum: 12 },
            ],
          },
        ],
      },
    });
    expect(rows).toEqual([{ id: "p1", name: "Pet bed", imageUrl: "https://img/bed.jpg", listedCount: 12 }]);
  });

  it("lê as variantes com preço em centavos", () => {
    const rows = parseVariants({
      data: [{ vid: "v1", variantKey: "Grey", variantNameEn: null, variantImage: "https://img/g.jpg", variantSellPrice: 20 }],
    });
    expect(rows).toEqual([
      { vid: "v1", name: "", option: "Grey", imageUrl: "https://img/g.jpg", supplierCostCents: 2000 },
    ]);
  });

  it("fica com o armazém americano que tem estoque da CJ", () => {
    const stock = parseUsStock({
      data: [
        { countryCode: "CN", areaId: "1", cjInventoryNum: 90, stock: [] },
        {
          countryCode: "US",
          areaId: "3",
          cjInventoryNum: 4,
          stock: [{ stockId: "wh-us", inventory: 4 }],
        },
      ],
    });
    expect(stock).toEqual({ warehouseId: "wh-us", quantity: 4 });
  });

  it("escolhe o frete mais barato", () => {
    const quote = parseFreight({
      data: [
        { logisticPrice: 12.5, logisticAging: "3-6" },
        { logisticPrice: 8, logisticAging: "2-5" },
      ],
    });
    expect(quote).toEqual({ shippingCents: 800, minDays: 2, maxDays: 5 });
  });
});
