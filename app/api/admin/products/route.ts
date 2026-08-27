import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { catalogImports, categories, productImages, products, productVariants } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";
import { parseEuroToCents, slugify } from "@/lib/store-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "all";
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(80, Math.max(20, Number.parseInt(url.searchParams.get("limit") ?? "40", 10) || 40));
  const filters = [];
  if (query) {
    const term = `%${query}%`;
    filters.push(or(ilike(products.name, term), ilike(products.brand, term), ilike(products.sku, term), ilike(products.slug, term))!);
  }
  if (["active", "draft", "archived"].includes(status)) filters.push(eq(products.status, status));
  const where = filters.length ? and(...filters) : undefined;
  const db = getDb();

  const [baseRows, countRows, productStats, stockStats, latestImport] = await Promise.all([
    db.select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      sku: products.sku,
      slug: products.slug,
      status: products.status,
      basePriceCents: products.basePriceCents,
      compareAtPriceCents: products.compareAtPriceCents,
      supplierRetailPriceCents: products.supplierRetailPriceCents,
      supplierCostCents: products.supplierCostCents,
      priceLocked: products.priceLocked,
      catalogSource: products.catalogSource,
      currency: products.currency,
      createdAt: products.createdAt,
      stockQuantity: sql<number>`coalesce((select sum(${productVariants.stockQuantity}) from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.isActive} = true), 0)`,
      supplierStockQuantity: sql<number>`coalesce((select sum(${productVariants.supplierStockQuantity}) from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.isActive} = true), 0)`,
      variantCount: sql<number>`coalesce((select count(*) from ${productVariants} where ${productVariants.productId} = ${products.id}), 0)`,
      lowStockCount: sql<number>`coalesce((select count(*) from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.isActive} = true and ${productVariants.stockQuantity} <= ${productVariants.lowStockThreshold}), 0)`,
      imageUrl: sql<string | null>`(select ${productImages.url} from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
    }).from(products).where(where).orderBy(asc(products.brand), asc(products.name)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ value: sql<number>`count(*)` }).from(products).where(where),
    db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${products.status} = 'active')`,
      draft: sql<number>`count(*) filter (where ${products.status} = 'draft')`,
    }).from(products),
    db.select({
      units: sql<number>`coalesce(sum(${productVariants.stockQuantity}), 0)`,
      low: sql<number>`count(*) filter (where ${productVariants.isActive} = true and ${productVariants.stockQuantity} <= ${productVariants.lowStockThreshold})`,
    }).from(productVariants),
    db.select().from(catalogImports).orderBy(desc(catalogImports.startedAt)).limit(1),
  ]);

  const total = Number(countRows[0]?.value ?? 0);
  return Response.json({
    products: baseRows,
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
    stats: {
      total: Number(productStats[0]?.total ?? 0),
      active: Number(productStats[0]?.active ?? 0),
      draft: Number(productStats[0]?.draft ?? 0),
      units: Number(stockStats[0]?.units ?? 0),
      lowStock: Number(stockStats[0]?.low ?? 0),
    },
    latestImport: latestImport[0] ?? null,
  });
}

export async function POST(request: Request) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const body = await request.json() as Record<string, string>;
  const name = body.name?.trim();
  const sku = body.sku?.trim().toUpperCase();
  const price = parseEuroToCents(body.price);
  if (!name || !sku || price < 0) {
    return Response.json({ error: "Nome, SKU e prezzo valido sono obbligatori." }, { status: 400 });
  }
  const db = getDb();
  const productId = crypto.randomUUID();
  let categoryId: string | null = null;
  if (body.categoryName?.trim()) {
    const categorySlug = slugify(body.categoryName);
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, categorySlug)).limit(1);
    categoryId = existing[0]?.id ?? crypto.randomUUID();
    if (!existing.length) await db.insert(categories).values({ id: categoryId, name: body.categoryName.trim(), slug: categorySlug });
  }
  try {
    await db.insert(products).values({
      id: productId,
      categoryId,
      name,
      sku,
      slug: slugify(body.slug || name),
      shortDescription: body.shortDescription?.trim() || null,
      description: body.description?.trim() || null,
      brand: body.brand?.trim() || null,
      gender: body.gender?.trim() || "unisex",
      status: body.status === "active" ? "active" : "draft",
      statusLocked: true,
      basePriceCents: price,
      compareAtPriceCents: body.compareAtPrice ? parseEuroToCents(body.compareAtPrice) : null,
      priceLocked: true,
      catalogSource: "manual",
    });
    await db.insert(productVariants).values({
      id: crypto.randomUUID(),
      productId,
      sku,
      title: [body.size, body.color].filter(Boolean).join(" · ") || "Standard",
      color: body.color?.trim() || null,
      size: body.size?.trim() || null,
      priceCents: price,
      compareAtPriceCents: body.compareAtPrice ? parseEuroToCents(body.compareAtPrice) : null,
      stockQuantity: Math.max(0, Number.parseInt(body.stockQuantity || "0", 10) || 0),
      supplierStockQuantity: 0,
      stockLocked: true,
    });
    if (body.imageUrl?.trim()) await db.insert(productImages).values({ id: crypto.randomUUID(), productId, url: body.imageUrl.trim(), altText: name });
  } catch {
    return Response.json({ error: "SKU o slug già esistente." }, { status: 409 });
  }
  await recordAdminAction(auth.user, "create", "product", productId, { name, sku });
  return Response.json({ id: productId }, { status: 201 });
}
