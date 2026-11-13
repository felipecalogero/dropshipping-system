import Link from "next/link";
import { BackLink } from "../../../components/back-link";
import { redirect } from "next/navigation";
import { currentAdmin } from "../../../src/auth";
import { prisma } from "../../../src/db";

export default async function ProductsPage() {
  if (!(await currentAdmin())) redirect("/admin/login");
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="wrap admin">
      <BackLink href="/admin">Pedidos</BackLink>
      <div className="bar">
        <h1>Produtos</h1>
        <span className="choices">
          <Link className="button quiet" href="/admin/products/search">Buscar na CJ</Link>
          <Link className="button" href="/admin/products/new">Novo produto</Link>
        </span>
      </div>
      <ul className="admin-list">
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/admin/products/${product.id}`}>{product.name}</Link>
            {product.active ? " — ativo" : " — inativo"}
          </li>
        ))}
      </ul>
    </main>
  );
}
