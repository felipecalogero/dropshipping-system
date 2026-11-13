import { describe, expect, it } from "vitest";
import { decideSend } from "../../src/cj/send-order";

describe("decideSend", () => {
  it("não cria pedido na CJ sem saldo e permanece pago", () => {
    expect(decideSend({ balanceCents: 1000, landedCents: 2800 })).toEqual({
      create: false,
      internalStatus: "paid",
    });
  });

  it("envia quando o saldo cobre o custo", () => {
    expect(decideSend({ balanceCents: 3000, landedCents: 2800 })).toEqual({
      create: true,
      internalStatus: "sent_to_cj",
    });
  });
});
