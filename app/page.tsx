import Link from "next/link";
import { prisma } from "../src/db";
import { money } from "../src/catalog";

const CATEGORIES = [
  ["bed", "Beds"],
  ["travel", "Travel"],
  ["feeding", "Feeding"],
  ["grooming", "Grooming"],
  ["home", "Home"],
] as const;

type CardProduct = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  images: { path: string; alt: string }[];
};

function ProductCard({ product, heading }: { product: CardProduct; heading: "h2" | "h3" }) {
  const Title = heading;
  return (
    <Link className="card" href={`/p/${product.slug}`}>
      <div className="photo">
        {product.images[0] ? <img src={product.images[0].path} alt={product.images[0].alt} /> : null}
      </div>
      <div className="card-body">
        <Title>{product.name}</Title>
        <p className="price">{money(product.priceCents)}</p>
        <p className="muted">Delivery in {product.deliveryMinDays}–{product.deliveryMaxDays} days</p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [setting, products] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    prisma.product.findMany({
      where: { active: true },
      include: { images: { orderBy: { position: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);
  const groups = CATEGORIES.map(([category, label]) => ({
    category,
    label,
    products: products.filter((product) => product.category === category),
  })).filter((group) => group.products.length > 0);
  const showSections = groups.length > 1;

  return (
    <main>
      <section className="wrap hero">
        <div>
          <h1>Quiet comfort for the animals at home.</h1>
          <p className="lede">{setting?.tagline}</p>
        </div>
        <p className="muted">Ships from a United States warehouse. Thirty-day returns. No account required.</p>
      </section>
      <section className="wrap catalog">
        {products.length === 0 ? <p>New pieces are being prepared.</p> : null}
        {showSections ? groups.map((group) => (
          <div className="catalog-group" key={group.category}>
            <h2>{group.label}</h2>
            <div className="grid">
              {group.products.map((product) => <ProductCard product={product} heading="h3" key={product.id} />)}
            </div>
          </div>
        )) : (
          <div className={products.length === 1 ? "grid grid-single" : "grid"}>
            {products.map((product) => <ProductCard product={product} heading="h2" key={product.id} />)}
          </div>
        )}
      </section>
    </main>
  );
}
