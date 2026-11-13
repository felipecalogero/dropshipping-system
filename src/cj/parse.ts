export function usdToCents(value: number | string): number {
  const text = String(value).trim();
  const negative = text.startsWith("-");
  const [whole, fraction = ""] = text.replace("-", "").split(".");
  const cents = Number(whole || 0) * 100 + Number((fraction + "00").slice(0, 2));
  return negative ? -cents : cents;
}

export function parseAging(value: string): { minDays: number; maxDays: number } {
  const range = value.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return { minDays: Number(range[1]), maxDays: Number(range[2]) };
  const single = value.match(/(\d+)/);
  if (single) {
    const day = Number(single[1]);
    return { minDays: day, maxDays: day };
  }
  return { minDays: 2, maxDays: 5 };
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function dataOf(body: unknown): unknown {
  return record(body)?.data;
}

export function parseProductList(body: unknown): { id: string; name: string; imageUrl: string; listedCount: number }[] {
  const data = record(dataOf(body));
  const content = Array.isArray(data?.content) ? data.content : [];
  const products = content.flatMap((entry) => {
    const row = record(entry);
    const list = row?.productList;
    return Array.isArray(list) ? list : [];
  });
  return products.flatMap((item) => {
    const row = record(item);
    const id = String(row?.id || "");
    const name = String(row?.nameEn || "");
    if (!id || !name) return [];
    const listed = Number(row?.listedNum ?? 0);
    return [{ id, name, imageUrl: String(row?.bigImage || ""), listedCount: Number.isFinite(listed) ? listed : 0 }];
  });
}

export function parseVariants(body: unknown): {
  vid: string;
  name: string;
  option: string;
  imageUrl: string;
  supplierCostCents: number;
}[] {
  const data = dataOf(body);
  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((item) => {
    const row = record(item);
    const vid = String(row?.vid || "");
    if (!vid) return [];
    const price = row?.variantSellPrice;
    return [
      {
        vid,
        name: String(row?.variantNameEn || ""),
        option: String(row?.variantKey || ""),
        imageUrl: String(row?.variantImage || ""),
        supplierCostCents: price == null ? 0 : usdToCents(price as number | string),
      },
    ];
  });
}

export function parseUsStock(body: unknown): { warehouseId: string; quantity: number } | null {
  const data = dataOf(body);
  const rows = Array.isArray(data) ? data : [];
  let best: { warehouseId: string; quantity: number } | null = null;
  for (const item of rows) {
    const row = record(item);
    if (String(row?.countryCode || "") !== "US") continue;
    const raw = row?.cjInventoryNum;
    const quantity = Number(raw == null ? row?.totalInventoryNum ?? 0 : raw);
    if (quantity <= 0) continue;
    const stock = Array.isArray(row?.stock) ? row.stock : [];
    const located = stock.map(record).find((entry) => Number(entry?.inventory || 0) > 0);
    const warehouseId = String(located?.stockId || row?.areaId || "");
    if (!warehouseId) continue;
    if (!best || quantity > best.quantity) best = { warehouseId, quantity };
  }
  return best;
}

export function parseFreight(body: unknown): { shippingCents: number; minDays: number; maxDays: number } | null {
  const data = dataOf(body);
  const rows = Array.isArray(data) ? data : [];
  let best: { shippingCents: number; minDays: number; maxDays: number } | null = null;
  for (const item of rows) {
    const row = record(item);
    const price = row?.logisticPrice;
    if (price == null) continue;
    const shippingCents = usdToCents(price as number | string);
    if (shippingCents <= 0) continue;
    const aging = parseAging(String(row?.logisticAging || ""));
    if (!best || shippingCents < best.shippingCents) best = { shippingCents, ...aging };
  }
  return best;
}
