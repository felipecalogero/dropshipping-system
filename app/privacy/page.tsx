import { BackLink } from "../../components/back-link";

export default function PrivacyPage() {
  return (
    <main className="wrap plain">
      <BackLink href="/">Back to shop</BackLink>
      <h1>Privacy</h1>
      <p>We store the name, email, phone, and address you type at checkout so the order can be delivered. Phone is required by the warehouse.</p>
      <p>Payment card numbers stay with Stripe. We keep the payment reference, not the card.</p>
      <p>Meta and Google tags load only after you accept cookies. Declining leaves the shop usable.</p>
    </main>
  );
}
