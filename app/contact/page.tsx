import { BackLink } from "../../components/back-link";
import { prisma } from "../../src/db";

export default async function ContactPage() {
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  return (
    <main className="wrap plain">
      <BackLink href="/">Back to shop</BackLink>
      <h1>Contact</h1>
      <p>{setting?.email || "Email will be published before the shop takes payment."}</p>
      <p>{setting?.address || "The legal address will be published before the shop takes payment."}</p>
    </main>
  );
}
