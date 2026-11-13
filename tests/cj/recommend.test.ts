import { describe, expect, it } from "vitest";
import { middleOptionVids } from "../../src/cj/recommend";

describe("opção do meio", () => {
  it("marca o tamanho central na cor neutra", () => {
    const picked = middleOptionVids([
      { vid: "s", cjProductId: "bed", option: "Red / S" },
      { vid: "m", cjProductId: "bed", option: "Grey / M" },
      { vid: "l", cjProductId: "bed", option: "Blue / L" },
    ]);
    expect([...picked]).toEqual(["m"]);
  });

  it("marca a cor neutra quando não há tamanho", () => {
    const picked = middleOptionVids([
      { vid: "pink", cjProductId: "bowl", option: "Pink" },
      { vid: "beige", cjProductId: "bowl", option: "Beige" },
    ]);
    expect([...picked]).toEqual(["beige"]);
  });

  it("não marca quando as opções são equivalentes", () => {
    const picked = middleOptionVids([
      { vid: "grey", cjProductId: "bed", option: "Grey" },
      { vid: "beige", cjProductId: "bed", option: "Beige" },
    ]);
    expect(picked.size).toBe(0);
  });

  it("escolhe a polegada do meio", () => {
    const picked = middleOptionVids([
      { vid: "s", cjProductId: "bed", option: "20 inch" },
      { vid: "m", cjProductId: "bed", option: "30 inch" },
      { vid: "l", cjProductId: "bed", option: "40 inch" },
    ]);
    expect([...picked]).toEqual(["m"]);
  });
});
