import { notFound, redirect } from "next/navigation";
import { BackLink } from "../../../../components/back-link";
import { currentAdmin } from "../../../../src/auth";
import { prisma } from "../../../../src/db";
import { ProductForm } from "../../../../components/product-form";
import { activateProduct, productAdNote } from "../../actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  if (!(await currentAdmin())) redirect("/admin/login");
  const { id } = await params;
  const { erro } = await searchParams;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!product) notFound();
  const ad = await productAdNote(product.id);
  return (
    <main className="wrap admin">
      <BackLink href="/admin/products">Produtos</BackLink>
      <h1>{product.name}</h1>
      {product.images[0] ? <img className="admin-photo" src={product.images[0].path} alt={product.images[0].alt} /> : null}
      {product.cjVid ? <p className="muted">O nome veio do anúncio. Encurte se ele juntar vários tamanhos ou prometer resultado de saúde.</p> : null}
      {erro ? <p className="notice">Ainda não pode ativar: falta estoque nos EUA, foto, cotação, faixa ou sobra mínima.</p> : null}
      {ad ? <p className="notice">Este produto pode ir para o teste de anúncio. Separe US$ 150 e use só a foto do produto. A loja não liga nem pausa anúncio.</p> : null}
      <p>Sobra estimada: US$ {(product.contributionCents / 100).toFixed(2)}. Status: {product.active ? "ativo" : "inativo"}.</p>
      <ProductForm product={product} />
      <form action={activateProduct}>
        <input type="hidden" name="id" value={product.id} />
        <button type="submit">Ativar</button>
      </form>
    </main>
  );
}
