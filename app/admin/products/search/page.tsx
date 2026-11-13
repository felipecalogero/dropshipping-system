import Link from "next/link";
import { redirect } from "next/navigation";
import { BackLink } from "../../../../components/back-link";
import { addCjCandidate, searchCj, searchCjFeatured } from "../../cj-actions";
import { currentAdmin } from "../../../../src/auth";
import { middleOptionVids } from "../../../../src/cj/recommend";
import { CATEGORY_SEARCH } from "../../../../src/cj/select-batch";
import { formatUsd } from "../../../../src/domain/money";
import { BAND_REFERENCE, pricePlace, type Category } from "../../../../src/domain/pricing";
import { prisma } from "../../../../src/db";

export const maxDuration = 120;

const NOTICES: Record<string, string> = {
  chave: "Falta a chave da CJ no servidor.",
  cj: "A CJ pediu para esperar ou não respondeu. O que já tinha passado continua na lista.",
  vazio: "Nesta leva nenhum produto passou nos filtros. Clique de novo para continuar.",
  fim: "A CJ não devolveu mais produtos.",
  sumiu: "Esse resultado já saiu da lista.",
};

function listedLabel(count: number): string | null {
  if (count <= 0) return null;
  return count === 1 ? "1 loja listou" : `${count} lojas listaram`;
}

export default async function SearchProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; aviso?: string }>;
}) {
  if (!(await currentAdmin())) redirect("/admin/login");
  const { categoria, aviso } = await searchParams;
  const selected = categoria && categoria in CATEGORY_SEARCH ? (categoria as Category) : null;
  const candidates = await prisma.cjCandidate.findMany({
    ...(selected ? { where: { category: selected } } : {}),
    orderBy: [{ listedCount: "desc" }, { foundAt: "desc" }],
  });
  const picks = middleOptionVids(
    candidates.map((item) => ({ vid: item.vid, cjProductId: item.cjProductId, option: item.option })),
  );

  return (
    <main className="wrap admin">
      <BackLink href="/admin/products">Produtos</BackLink>
      <h1>Buscar na CJ</h1>
      <p className="muted">
        A busca geral pede os mais listados em cada categoria, com estoque nos Estados Unidos, frete e sobra de pelo menos US$ 8.
        A opção do meio é a cor neutra no tamanho central. O total é o preço mais o frete. A espera fica nesta tela.
      </p>
      {aviso && NOTICES[aviso] ? <p className="notice">{NOTICES[aviso]}</p> : null}
      <form action={searchCjFeatured}>
        <button type="submit">Buscar os mais listados</button>
      </form>
      <div className="choices">
        <Link className={selected ? "button quiet" : "button quiet current"} href="/admin/products/search">
          Todos
        </Link>
        {(Object.entries(CATEGORY_SEARCH) as [Category, { label: string }][]).map(([category, meta]) => (
          <Link
            key={category}
            className={selected === category ? "button quiet current" : "button quiet"}
            href={`/admin/products/search?categoria=${category}`}
          >
            {meta.label}
          </Link>
        ))}
      </div>
      {selected ? (
        <form action={searchCj}>
          <input type="hidden" name="category" value={selected} />
          <button type="submit" className="quiet">
            Buscar mais {CATEGORY_SEARCH[selected].label.toLowerCase()}
          </button>
        </form>
      ) : (
        <p className="muted">Os filtros só organizam a lista. Para pedir outra leva de uma categoria, abra o filtro dela.</p>
      )}
      {candidates.length === 0 ? <p className="muted">Nenhum resultado nesta lista.</p> : null}
      <div className="candidate-grid">
        {candidates.map((item) => {
          const category = item.category in CATEGORY_SEARCH ? (item.category as Category) : null;
          const place = category ? pricePlace(category, item.priceCents, item.shippingCents) : null;
          const listed = listedLabel(item.listedCount);
          const total = item.priceCents + item.shippingCents;
          return (
            <article className="candidate" key={item.vid}>
              {item.imageUrl ? (
                <div className="photo">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              ) : null}
              <div className="card-body">
                {picks.has(item.vid) ? <p className="pick">Opção do meio</p> : null}
                <h2>{item.name}</h2>
                <p className="muted">
                  {[category ? CATEGORY_SEARCH[category].label : item.category, item.option || "uma opção", listed]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="price">{formatUsd(item.priceCents)}</p>
                {place ? (
                  <p className="muted">
                    Total {formatUsd(total)} {place === "meio" ? "no meio da faixa" : "no mínimo da faixa"}
                  </p>
                ) : null}
                {category ? <p className="muted">Referência {BAND_REFERENCE[category]}</p> : null}
                <p className="muted">
                  Sobra {formatUsd(item.contributionCents)} · estoque {item.usStock}
                </p>
                <form action={addCjCandidate}>
                  <input type="hidden" name="vid" value={item.vid} />
                  <button type="submit">Adicionar</button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
