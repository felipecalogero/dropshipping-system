import { describe, expect, it } from "vitest";
import { publicHtmlAllowsPixels } from "../../src/privacy/pixels";

describe("pixels", () => {
  it("não inclui pixel antes do aceite", () => {
    const html = publicHtmlAllowsPixels(false);
    expect(html).not.toContain("fbq");
    expect(html).not.toContain("gtag");
  });

  it("inclui pixel depois do aceite", () => {
    const html = publicHtmlAllowsPixels(true);
    expect(html).toContain("fbq");
    expect(html).toContain("gtag");
  });
});
