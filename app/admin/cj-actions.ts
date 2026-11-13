"use server";

import { redirect } from "next/navigation";
import { cjClient, sourceFromCj } from "../../src/cj/client";
import { collectBatch, productSlug, CATEGORY_SEARCH } from "../../src/cj/select-batch";
import { currentAdmin } from "../../src/auth";
import { contributionCents } from "../../src/domain/money";
import type { Category } from "../../src/domain/pricing";
import { prisma } from "../../src/db";

async function requireAdmin() {
  if (!(await currentAdmin())) redirect("/admin/login");
}

function categoryOf(value: FormDataEntryValue | null): Category | null {
  const category = String(value || "");
  return category in CATEGORY_SEARCH ? (category as Category) : null;
}

async function knownVids() {
  const [saved, pending] = await Promise.all([
    prisma.product.findMany({ select: { cjVid: true } }),
    prisma.cjCandidate.findMany({ select: { vid: true } }),
  ]);
  return new Set([...saved.map((item) => item.cjVid), ...pending.map((item) => item.vid)]);
}

async function runBatch(
  category: Category,
  client: NonNullable<ReturnType<typeof cjClient>>,
  setting: { referenceZip: string; minContributionCents: number; adContributionCents: number },
  vids: Set<string>,
  limits?: { target?: number; maxPages?: number; maxQuotes?: number },
) {
  const cursor = await prisma.cjSearchCursor.findUnique({ where: { category } });
  const batch = await collectBatch({
    source: sourceFromCj(client, category, setting.referenceZip || "64108"),
    startPage: cursor?.nextPage ?? 1,
    startOffset: cursor?.nextOffset ?? 0,
    knownVids: vids,
    category,
    settings: setting,
    ...limits,
  });
  await prisma.$transaction([
    prisma.cjSearchCursor.upsert({
      where: { category },
      create: { category, nextPage: batch.nextPage, nextOffset: batch.nextOffset },
      update: { nextPage: batch.nextPage, nextOffset: batch.nextOffset },
    }),
    prisma.cjCandidate.createMany({
      data: batch.candidates.map((item) => ({ ...item, category })),
      skipDuplicates: true,
    }),
  ]);
  return batch;
}

export async function searchCj(formData: FormData) {
  await requireAdmin();
  const category = categoryOf(formData.get("category"));
  if (!category) redirect("/admin/products/search");
  const client = cjClient();
  if (!client) redirect("/admin/products/search?aviso=chave");
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  if (!setting) redirect("/admin/products/search?aviso=cj");
  let aviso = "cj";
  try {
    const batch = await runBatch(category, client, setting, await knownVids());
    aviso = batch.candidates.length > 0 ? "" : batch.catalogEnd ? "fim" : "vazio";
  } catch {
    aviso = "cj";
  }
  const query = new URLSearchParams({ categoria: category });
  if (aviso) query.set("aviso", aviso);
  redirect(`/admin/products/search?${query.toString()}`);
}

export async function searchCjFeatured() {
  await requireAdmin();
  const client = cjClient();
  if (!client) redirect("/admin/products/search?aviso=chave");
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  if (!setting) redirect("/admin/products/search?aviso=cj");
  const vids = await knownVids();
  let found = 0;
  let ended = 0;
  let failed = false;
  for (const category of Object.keys(CATEGORY_SEARCH) as Category[]) {
    try {
      const batch = await runBatch(category, client, setting, vids, { target: 2, maxPages: 1, maxQuotes: 3 });
      found += batch.candidates.length;
      if (batch.catalogEnd) ended += 1;
    } catch {
      failed = true;
      break;
    }
  }
  const categories = Object.keys(CATEGORY_SEARCH).length;
  const aviso = found > 0 ? (failed ? "cj" : "") : failed ? "cj" : ended === categories ? "fim" : "vazio";
  redirect(aviso ? `/admin/products/search?aviso=${aviso}` : "/admin/products/search");
}

export async function addCjCandidate(formData: FormData) {
  await requireAdmin();
  const vid = String(formData.get("vid") || "");
  const candidate = await prisma.cjCandidate.findUnique({ where: { vid } });
  if (!candidate) redirect("/admin/products/search?aviso=sumiu");
  const existing = await prisma.product.findFirst({ where: { cjVid: vid } });
  if (existing) {
    await prisma.cjCandidate.delete({ where: { vid } });
    redirect(`/admin/products/${existing.id}`);
  }
  const base = productSlug(candidate.name, vid);
  const clash = await prisma.product.findUnique({ where: { slug: base } });
  const slug = clash ? `${base}-${vid.replace(/[^a-z0-9]/gi, "").slice(0, 4).toLowerCase()}` : base;
  const contribution = contributionCents({
    priceCents: candidate.priceCents,
    shippingCents: candidate.shippingCents,
    supplierCostCents: candidate.supplierCostCents,
  });
  const product = await prisma.product.create({
    data: {
      slug,
      name: candidate.name,
      description: "",
      benefits: JSON.stringify(["", "", ""]),
      included: "",
      care: "",
      faq: JSON.stringify([
        { q: "", a: "" },
        { q: "", a: "" },
        { q: "", a: "" },
      ]),
      category: candidate.category,
      priceCents: candidate.priceCents,
      cjVid: candidate.vid,
      cjWarehouseId: candidate.warehouseId,
      supplierCostCents: candidate.supplierCostCents,
      shippingCents: candidate.shippingCents,
      deliveryMinDays: candidate.deliveryMinDays,
      deliveryMaxDays: candidate.deliveryMaxDays,
      contributionCents: contribution,
      usStock: candidate.usStock,
      quotedAt: new Date(),
      photoConfirmed: Boolean(candidate.imageUrl),
      active: false,
      images: candidate.imageUrl
        ? { create: [{ path: candidate.imageUrl, alt: candidate.name, position: 0 }] }
        : undefined,
    },
  });
  await prisma.cjCandidate.delete({ where: { vid } });
  redirect(`/admin/products/${product.id}`);
}
