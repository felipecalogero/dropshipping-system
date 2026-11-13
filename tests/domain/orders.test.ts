import { describe, expect, it } from "vitest";
import { emailForTransition } from "../../src/domain/orders";
import { orderEmail } from "../../src/email/messages";

describe("emails de status", () => {
  it("não envia e-mail ao mandar para a CJ", () => {
    expect(emailForTransition("paid", "sent_to_cj")).toBeNull();
  });

  it("envia Shipped ao lançar rastreio e o texto não cita fornecedor", () => {
    expect(emailForTransition("sent_to_cj", "shipped")).toBe("shipped");
    const body = orderEmail("shipped", {
      publicToken: "tok",
      carrier: "USPS",
      trackingCode: "1Z",
    });
    expect(body).toContain("USPS");
    expect(body.toLowerCase()).not.toContain("cj");
    expect(body).not.toContain("internal");
  });

  it("problem não envia e-mail", () => {
    expect(emailForTransition("paid", "problem")).toBeNull();
  });
});
