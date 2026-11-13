import { describe, expect, it } from "vitest";
import { candidateName, collectBatch, type BatchSource, type ListedProduct } from "../../src/cj/select-batch";

const settings = { minContributionCents: 800, adContributionCents: 3900 };

function offer(vid: string, cost: number, stock: number, freight: number | null, option = "Grey") {
  return { vid, cost, stock, freight, option };
}

function source(
  pages: Record<number, Array<{ id: string; name: string; listedCount?: number; variants: ReturnType<typeof offer>[] }>>,
  freightCalls: string[] = [],
): BatchSource {
  return {
    async list(page) {
      return (pages[page] ?? []).map(
        (product): ListedProduct => ({
          id: product.id,
          name: product.name,
          imageUrl: `https://img/${product.id}.jpg`,
          listedCount: product.listedCount ?? 0,
        }),
      );
    },
    async variants(productId) {
      const product = Object.values(pages)
        .flat()
        .find((item) => item.id === productId);
      return (product?.variants ?? []).map((variant) => ({
        vid: variant.vid,
        name: "",
        option: variant.option,
        imageUrl: `https://img/${variant.vid}.jpg`,
        supplierCostCents: variant.cost,
      }));
    },
    async stock(vid) {
      const variant = Object.values(pages)
        .flat()
        .flatMap((product) => product.variants)
        .find((item) => item.vid === vid);
      if (!variant || variant.stock <= 0) return null;
      return { warehouseId: "us-1", quantity: variant.stock };
    },
    async freight(vid) {
      freightCalls.push(vid);
      const variant = Object.values(pages)
        .flat()
        .flatMap((product) => product.variants)
        .find((item) => item.vid === vid);
      if (!variant?.freight) return null;
      return { shippingCents: variant.freight, minDays: 2, maxDays: 5 };
    },
  };
}

describe("candidateName", () => {
  it("junta o nome do anúncio com a cor", () => {
    expect(candidateName("Orthopedic dog bed", "Grey")).toBe("Orthopedic dog bed — Grey");
  });

  it("não repete a cor quando o nome já a traz", () => {
    expect(candidateName("Orthopedic dog bed Grey", "Grey")).toBe("Orthopedic dog bed Grey");
  });
});

describe("collectBatch", () => {
  it("fica com a variante que passa na faixa e descarta custo alto ou sem estoque", async () => {
    const freightCalls: string[] = [];
    const result = await collectBatch({
      source: source(
        {
          1: [
            {
              id: "bed",
              name: "Orthopedic dog bed",
              listedCount: 40,
              variants: [offer("ok", 2000, 4, 800), offer("dry", 2000, 0, 800), offer("dear", 6000, 4, 800)],
            },
          ],
        },
        freightCalls,
      ),
      startPage: 1,
      startOffset: 0,
      knownVids: new Set(),
      category: "bed",
      settings,
      target: 5,
      maxPages: 1,
      maxQuotes: 8,
    });

    expect(result.candidates.map((item) => item.vid)).toEqual(["ok"]);
    expect(result.candidates[0]).toMatchObject({
      name: "Orthopedic dog bed — Grey",
      priceCents: 4400,
      shippingCents: 800,
      supplierCostCents: 2000,
      usStock: 4,
      warehouseId: "us-1",
      cjProductId: "bed",
      listedCount: 40,
    });
    expect(freightCalls).not.toContain("dry");
  });

  it("trata cada cor como um produto", async () => {
    const result = await collectBatch({
      source: source({
        1: [
          {
            id: "bed",
            name: "Orthopedic dog bed",
            variants: [offer("grey", 2000, 2, 800, "Grey"), offer("beige", 2000, 2, 800, "Beige")],
          },
        ],
      }),
      startPage: 1,
      startOffset: 0,
      knownVids: new Set(["grey"]),
      category: "bed",
      settings,
      target: 5,
      maxPages: 1,
      maxQuotes: 8,
    });

    expect(result.candidates.map((item) => item.option)).toEqual(["Beige"]);
  });

  it("segue para a página seguinte quando a primeira não passa", async () => {
    const seen: number[] = [];
    const base = source({
      1: [{ id: "dear", name: "Expensive bed", variants: [offer("dear", 6000, 3, 800)] }],
      2: [{ id: "ok", name: "Calm bed", variants: [offer("ok", 2000, 3, 800)] }],
    });
    const result = await collectBatch({
      source: {
        ...base,
        list: async (page) => {
          seen.push(page);
          return base.list(page);
        },
      },
      startPage: 1,
      startOffset: 0,
      knownVids: new Set(),
      category: "bed",
      settings,
      target: 1,
      maxPages: 3,
      maxQuotes: 8,
    });

    expect(seen).toEqual([1, 2]);
    expect(result.candidates.map((item) => item.vid)).toEqual(["ok"]);
    expect(result.nextPage).toBe(3);
    expect(result.nextOffset).toBe(0);
  });

  it("para ao completar a leva e continua no produto seguinte", async () => {
    const result = await collectBatch({
      source: source({
        1: [
          { id: "a", name: "Bed A", variants: [offer("a", 2000, 2, 800)] },
          { id: "b", name: "Bed B", variants: [offer("b", 2000, 2, 800)] },
        ],
      }),
      startPage: 1,
      startOffset: 0,
      knownVids: new Set(),
      category: "bed",
      settings,
      target: 1,
      maxPages: 3,
      maxQuotes: 8,
    });

    expect(result.candidates.map((item) => item.vid)).toEqual(["a"]);
    expect(result.nextPage).toBe(1);
    expect(result.nextOffset).toBe(1);
    expect(result.catalogEnd).toBe(false);
  });

  it("marca o fim quando a CJ não devolve mais páginas", async () => {
    const result = await collectBatch({
      source: source({}),
      startPage: 4,
      startOffset: 0,
      knownVids: new Set(),
      category: "bed",
      settings,
      target: 5,
      maxPages: 3,
      maxQuotes: 8,
    });

    expect(result.candidates).toEqual([]);
    expect(result.catalogEnd).toBe(true);
    expect(result.nextPage).toBe(4);
  });
});
