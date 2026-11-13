import { BackLink } from "../../components/back-link";
import { prisma } from "../../src/db";

export default async function LegalPage() {
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  return (
    <main className="wrap plain">
      <BackLink href="/">Back to shop</BackLink>
      <h1>Legal</h1>
      <p>{setting?.legalName || "The legal name will be published before the shop takes payment."}</p>
      <p>{setting?.address}</p>
      <p>Prices are in US dollars. Cards are charged in US dollars. This shop does not sell food, supplements, or medical products, and it does not make health claims.</p>
    </main>
  );
}
