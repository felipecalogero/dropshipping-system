import { saveProduct } from "../app/admin/actions";

function readBenefits(product?: { [key: string]: unknown }): string[] {
  if (typeof product?.benefits !== "string") return ["", "", ""];
  try {
    const parsed = JSON.parse(product.benefits) as string[];
    return [parsed[0] || "", parsed[1] || "", parsed[2] || ""];
  } catch {
    return ["", "", ""];
  }
}

function readFaq(product?: { [key: string]: unknown }): { q: string; a: string }[] {
  const empty = [{ q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }];
  if (typeof product?.faq !== "string") return empty;
  try {
    const parsed = JSON.parse(product.faq) as { q: string; a: string }[];
    return [0, 1, 2].map((index) => parsed[index] || empty[index]);
  } catch {
    return empty;
  }
}

export function ProductForm({ product }: { product?: { [key: string]: unknown } }) {
  const benefits = readBenefits(product);
  const faq = readFaq(product);
  return (
    <form className="form" action={saveProduct}>
      {product?.id ? <input type="hidden" name="id" value={String(product.id)} /> : null}
      <label>Nome<input name="name" defaultValue={String(product?.name || "")} required /></label>
      <label>Endereço na loja<input name="slug" defaultValue={String(product?.slug || "")} required /></label>
      <label>Descrição<input name="description" defaultValue={String(product?.description || "")} /></label>
      <label>
        Categoria
        <select name="category" defaultValue={String(product?.category || "bed")}>
          <option value="bed">Cama</option>
          <option value="travel">Viagem</option>
          <option value="feeding">Alimentação</option>
          <option value="grooming">Higiene</option>
          <option value="home">Casa</option>
        </select>
      </label>
      <label>SKU da CJ<input name="cjVid" defaultValue={String(product?.cjVid || "")} /></label>
      <label>Armazém nos EUA<input name="cjWarehouseId" defaultValue={String(product?.cjWarehouseId || "")} /></label>
      <label>Custo, em centavos<input name="supplierCostCents" type="number" defaultValue={Number(product?.supplierCostCents || 0)} /></label>
      <label>Frete cotado, em centavos<input name="shippingCents" type="number" defaultValue={Number(product?.shippingCents || 0)} /></label>
      <label>Preço, em centavos<input name="priceCents" type="number" defaultValue={Number(product?.priceCents || 0)} /></label>
      <label>Estoque no armazém dos EUA<input name="usStock" type="number" defaultValue={Number(product?.usStock || 0)} /></label>
      <label>Entrega mínima, em dias<input name="deliveryMinDays" type="number" defaultValue={Number(product?.deliveryMinDays || 2)} /></label>
      <label>Entrega máxima, em dias<input name="deliveryMaxDays" type="number" defaultValue={Number(product?.deliveryMaxDays || 5)} /></label>
      <label>Benefício 1<input name="benefit1" defaultValue={benefits[0]} /></label>
      <label>Benefício 2<input name="benefit2" defaultValue={benefits[1]} /></label>
      <label>Benefício 3<input name="benefit3" defaultValue={benefits[2]} /></label>
      <label>O que vem na caixa<textarea name="included" defaultValue={String(product?.included || "")} /></label>
      <label>Cuidado<textarea name="care" defaultValue={String(product?.care || "")} /></label>
      <label>Pergunta 1<input name="q1" defaultValue={faq[0].q} /></label>
      <label>Resposta 1<input name="a1" defaultValue={faq[0].a} /></label>
      <label>Pergunta 2<input name="q2" defaultValue={faq[1].q} /></label>
      <label>Resposta 2<input name="a2" defaultValue={faq[1].a} /></label>
      <label>Pergunta 3<input name="q3" defaultValue={faq[2].q} /></label>
      <label>Resposta 3<input name="a3" defaultValue={faq[2].a} /></label>
      <label><input type="checkbox" name="photoConfirmed" defaultChecked={Boolean(product?.photoConfirmed)} /> Foto conferida</label>
      <label><input type="checkbox" name="quoted" /> Cotação da CJ registrada agora</label>
      <button type="submit">Salvar inativo</button>
    </form>
  );
}
