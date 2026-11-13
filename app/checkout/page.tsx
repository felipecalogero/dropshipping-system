import { BackLink } from "../../components/back-link";
import { CheckoutForm } from "./form";
import { prisma } from "../../src/db";
import { usStateCodes } from "../../src/domain/us-states";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  return (
    <main className="wrap plain">
      <BackLink href="/cart">Back to cart</BackLink>
      <h1>Checkout</h1>
      <CheckoutForm
        checkoutPublic={Boolean(setting?.checkoutPublic)}
        states={usStateCodes()}
        notice={notice}
      />
    </main>
  );
}
