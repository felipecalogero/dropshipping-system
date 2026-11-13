import { BackLink } from "../../components/back-link";

export default function ShippingPage() {
  return (
    <main className="wrap plain">
      <BackLink href="/">Back to shop</BackLink>
      <h1>Shipping</h1>
      <p>Orders ship from a warehouse in the United States to the 50 states and Washington, DC.</p>
      <p>The delivery window on each product is the one confirmed for that item. The shipping amount appears at checkout, after the address is quoted. It is not marked up.</p>
      <p>Puerto Rico and addresses outside the United States are not served in this shop.</p>
    </main>
  );
}
