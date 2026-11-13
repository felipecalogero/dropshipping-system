import { BackLink } from "../../components/back-link";

export default function ReturnsPage() {
  return (
    <main className="wrap plain">
      <BackLink href="/">Back to shop</BackLink>
      <h1>Returns</h1>
      <p>You have 30 days after delivery to return an unused item in its original condition.</p>
      <p>Email the shop with your order link. We reply with the return address and, after the return arrives, refund the payment through the card processor.</p>
    </main>
  );
}
