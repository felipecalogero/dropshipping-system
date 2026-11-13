import { describe, expect, it } from "vitest";
import { CjHttp } from "../../src/cj/client";
import { parseProductList } from "../../src/cj/parse";

describe("CjHttp", () => {
  it("pede o token e envia ele na lista", async () => {
    const seen: { url: string; token: string | null }[] = [];
    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      seen.push({ url: String(input), token: headers.get("CJ-Access-Token") });
      if (String(input).includes("getAccessToken")) {
        return new Response(JSON.stringify({ code: 200, result: true, data: { accessToken: "tok" } }));
      }
      return new Response(JSON.stringify({ code: 200, result: true, data: { content: [{ productList: [] }] } }));
    };
    const cj = new CjHttp("key", fetchImpl as typeof fetch, async () => {});
    expect(parseProductList(await cj.get("/product/listV2", { page: 1 }))).toEqual([]);
    expect(seen[0].token).toBeNull();
    expect(seen[1].token).toBe("tok");
    expect(seen[1].url).toContain("/product/listV2");
  });
});
