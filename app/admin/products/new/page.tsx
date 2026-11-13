import { redirect } from "next/navigation";
import { BackLink } from "../../../../components/back-link";
import { ProductForm } from "../../../../components/product-form";
import { currentAdmin } from "../../../../src/auth";

export default async function NewProductPage() {
  if (!(await currentAdmin())) redirect("/admin/login");
  return (
    <main className="wrap admin">
      <BackLink href="/admin/products">Produtos</BackLink>
      <h1>Novo produto</h1>
      <ProductForm />
    </main>
  );
}
