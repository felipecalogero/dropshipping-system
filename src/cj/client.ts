import type { Category } from "../domain/pricing";
import { parseFreight, parseProductList, parseUsStock, parseVariants } from "./parse";
import { CATEGORY_SEARCH, type BatchSource } from "./select-batch";

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export class CjError extends Error {}

type Json = { code?: number; result?: boolean; message?: string; data?: unknown };

export class CjHttp {
  private tokenValue = "";

  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  ) {}

  async get(path: string, query: Record<string, string | number | undefined>): Promise<unknown> {
    const url = new URL(`${BASE}${path}`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return this.request(url, { method: "GET" });
  }

  async post(path: string, body: unknown): Promise<unknown> {
    return this.request(new URL(`${BASE}${path}`), {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  private async request(url: URL, init: RequestInit): Promise<unknown> {
    if (!this.tokenValue) await this.accessToken();
    return this.raw(url, init);
  }

  private async accessToken(): Promise<void> {
    const json = await this.raw(new URL(`${BASE}/authentication/getAccessToken`), {
      method: "POST",
      body: JSON.stringify({ apiKey: this.apiKey }),
    });
    const token = (json as Json).data && typeof (json as Json).data === "object"
      ? String((json as Json & { data: { accessToken?: string } }).data.accessToken || "")
      : "";
    if (!token) throw new CjError("A CJ não devolveu token.");
    this.tokenValue = token;
  }

  private lastCall = 0;

  private async raw(url: URL, init: RequestInit, attempt = 0): Promise<unknown> {
    const gap = 1100 - (Date.now() - this.lastCall);
    if (this.lastCall && gap > 0) await this.wait(gap);
    this.lastCall = Date.now();
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    if (this.tokenValue) headers.set("CJ-Access-Token", this.tokenValue);
    const response = await this.fetchImpl(url, { ...init, headers });
    const json = (await response.json()) as Json;
    const limited = response.status === 429 || json.code === 429 || json.code === 1600200 || json.code === 16900500;
    if (limited && attempt < 1) {
      await this.wait(2000);
      return this.raw(url, init, attempt + 1);
    }
    if (limited || json.result === false || (json.code && json.code !== 200)) {
      throw new CjError(json.message || "A CJ não respondeu.");
    }
    return json;
  }
}

let cached: CjHttp | undefined;

export function cjClient(): CjHttp | null {
  const apiKey = process.env.CJ_API_KEY?.trim();
  if (!apiKey) return null;
  if (!cached) cached = new CjHttp(apiKey);
  return cached;
}

export function sourceFromCj(cj: CjHttp, category: Category, zip: string): BatchSource {
  const keyword = CATEGORY_SEARCH[category].keyword;
  return {
    async list(page) {
      return parseProductList(
        await cj.get("/product/listV2", {
          page,
          size: 10,
          keyWord: keyword,
          countryCode: "US",
          startWarehouseInventory: 1,
          orderBy: 1,
          sort: "desc",
        }),
      );
    },
    async variants(productId) {
      return parseVariants(await cj.get("/product/variant/query", { pid: productId, countryCode: "US" }));
    },
    async stock(vid) {
      return parseUsStock(await cj.get("/product/stock/queryByVid", { vid }));
    },
    async freight(vid, warehouseId) {
      return parseFreight(
        await cj.post("/logistic/freightCalculate", {
          startCountryCode: "US",
          endCountryCode: "US",
          zip,
          ...(warehouseId ? { storageIdList: [warehouseId] } : {}),
          products: [{ quantity: 1, vid }],
        }),
      );
    },
  };
}
