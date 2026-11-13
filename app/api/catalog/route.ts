import { NextResponse } from "next/server";
import { money } from "../../../src/catalog";
import { prisma } from "../../../src/db";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  return NextResponse.json(products.map((product) => ({
    id: product.id,
    name: product.name,
    price: money(product.priceCents),
    image: product.images[0]?.path ?? "",
    imageAlt: product.images[0]?.alt ?? product.name,
  })));
}
