import { contributionCents } from "../domain/money";
import { proposePriceCents, type Category, type PriceSettings } from "../domain/pricing";

export const CATEGORY_SEARCH: Record<Category, { label: string; keyword: string }> = {
  bed: { label: "Camas", keyword: "pet bed" },
  travel: { label: "Transporte", keyword: "pet car seat" },
  feeding: { label: "Alimentação", keyword: "slow feeder" },
  grooming: { label: "Higiene", keyword: "pet grooming" },
  home: { label: "Casa", keyword: "pet organizer" },
};

export type ListedProduct = { id: string; name: string; imageUrl: string; listedCount: number };

export type VariantOffer = {
  vid: string;
  name: string;
  option: string;
  imageUrl: string;
  supplierCostCents: number;
};

export type BatchSource = {
  list: (page: number) => Promise<ListedProduct[]>;
  variants: (productId: string) => Promise<VariantOffer[]>;
  stock: (vid: string) => Promise<{ warehouseId: string; quantity: number } | null>;
  freight: (vid: string, warehouseId: string) => Promise<{ shippingCents: number; minDays: number; maxDays: number } | null>;
};

export type Candidate = {
  vid: string;
  name: string;
  option: string;
  imageUrl: string;
  warehouseId: string;
  supplierCostCents: number;
  shippingCents: number;
  priceCents: number;
  contributionCents: number;
  usStock: number;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  cjProductId: string;
  listedCount: number;
};

export function candidateName(productName: string, option: string): string {
  const name = productName.trim();
  const extra = option.trim();
  if (!extra) return name;
  if (name.toLowerCase().includes(extra.toLowerCase())) return name;
  return `${name} — ${extra}`;
}

export function productSlug(name: string, vid: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  const suffix = vid.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  return `${base || "item"}-${suffix || "cj"}`;
}

export async function collectBatch(input: {
  source: BatchSource;
  startPage: number;
  startOffset: number;
  knownVids: Set<string>;
  category: Category;
  settings: PriceSettings;
  target?: number;
  maxPages?: number;
  maxQuotes?: number;
}): Promise<{ candidates: Candidate[]; nextPage: number; nextOffset: number; catalogEnd: boolean }> {
  const target = input.target ?? 5;
  const maxPages = input.maxPages ?? 3;
  const maxQuotes = input.maxQuotes ?? 8;
  let page = input.startPage;
  let offset = input.startOffset;
  let quotes = 0;
  const candidates: Candidate[] = [];

  for (let walked = 0; walked < maxPages && candidates.length < target && quotes < maxQuotes; walked += 1) {
    const products = await input.source.list(page);
    if (products.length === 0) {
      return { candidates, nextPage: page, nextOffset: 0, catalogEnd: true };
    }
    for (let index = offset; index < products.length; index += 1) {
      if (candidates.length >= target || quotes >= maxQuotes) {
        return { candidates, nextPage: page, nextOffset: index, catalogEnd: false };
      }
      const product = products[index];
      const variants = await input.source.variants(product.id);
      for (const variant of variants) {
        if (input.knownVids.has(variant.vid)) continue;
        if (candidates.length >= target || quotes >= maxQuotes) {
          return { candidates, nextPage: page, nextOffset: index, catalogEnd: false };
        }
        quotes += 1;
        const stock = await input.source.stock(variant.vid);
        if (!stock || stock.quantity <= 0) continue;
        const freight = await input.source.freight(variant.vid, stock.warehouseId);
        if (!freight) continue;
        const priceCents = proposePriceCents(
          input.category,
          variant.supplierCostCents,
          freight.shippingCents,
          input.settings,
        );
        if (priceCents == null) continue;
        candidates.push({
          vid: variant.vid,
          name: candidateName(variant.name || product.name, variant.option),
          option: variant.option,
          imageUrl: variant.imageUrl || product.imageUrl,
          warehouseId: stock.warehouseId,
          supplierCostCents: variant.supplierCostCents,
          shippingCents: freight.shippingCents,
          priceCents,
          contributionCents: contributionCents({
            priceCents,
            shippingCents: freight.shippingCents,
            supplierCostCents: variant.supplierCostCents,
          }),
          usStock: stock.quantity,
          deliveryMinDays: freight.minDays,
          deliveryMaxDays: freight.maxDays,
          cjProductId: product.id,
          listedCount: product.listedCount,
        });
        input.knownVids.add(variant.vid);
      }
    }
    if (candidates.length >= target || quotes >= maxQuotes) {
      return { candidates, nextPage: page + 1, nextOffset: 0, catalogEnd: false };
    }
    page += 1;
    offset = 0;
  }

  return { candidates, nextPage: page, nextOffset: 0, catalogEnd: false };
}
