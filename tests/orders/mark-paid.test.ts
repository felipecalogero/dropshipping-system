import { describe, expect, it } from "vitest";
import { markPaidFromWebhook } from "../../src/orders/mark-paid";

describe("markPaidFromWebhook", () => {
  it("não muda o pedido quando a assinatura é inválida", () => {
    const order = { internalStatus: "awaiting_payment" as const, paymentReference: null };
    const result = markPaidFromWebhook(order, { signatureOk: false, reference: "pi_1" });
    expect(result.changed).toBe(false);
    expect(result.order.internalStatus).toBe("awaiting_payment");
    expect(result.sendEmail).toBe(false);
  });

  it("não envia segundo e-mail para a mesma referência", () => {
    const order = { internalStatus: "paid" as const, paymentReference: "pi_1" };
    const result = markPaidFromWebhook(order, { signatureOk: true, reference: "pi_1" });
    expect(result.changed).toBe(false);
    expect(result.sendEmail).toBe(false);
  });

  it("marca pago uma vez", () => {
    const order = { internalStatus: "awaiting_payment" as const, paymentReference: null };
    const result = markPaidFromWebhook(order, { signatureOk: true, reference: "pi_1" });
    expect(result.changed).toBe(true);
    expect(result.sendEmail).toBe(true);
    expect(result.order).toEqual({ internalStatus: "paid", paymentReference: "pi_1" });
  });
});
