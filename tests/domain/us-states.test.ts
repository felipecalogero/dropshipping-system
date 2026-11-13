import { describe, expect, it } from "vitest";
import { isUsState } from "../../src/domain/us-states";

describe("isUsState", () => {
  it("aceita estado e o Distrito de Columbia", () => {
    expect(isUsState("CA")).toBe(true);
    expect(isUsState("DC")).toBe(true);
  });

  it("recusa território, Brasil e vazio", () => {
    expect(isUsState("PR")).toBe(false);
    expect(isUsState("BR")).toBe(false);
    expect(isUsState("")).toBe(false);
  });
});
