import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";
import { parseEuroToCents, slugify } from "@/lib/store-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const db = getDb();
  const baseRows = await db.select({
    id: products.id, name: products.name, sku: products.sku, slug: products.slug,
    status: products.status, basePriceCents: products.basePriceCents, currency: products.currency,
    createdAt: products.createdAt,
  }).from(products).orderBy(asc(products.name));
  const rows = await Promise.all(baseRows.map(async (product) => {
    const [stock, image] = await Promise.all([
      db.select({ value: sql<number>`coalesce(sum(${productVariants.stockQuantity}), 0)` }).from(productVariants).where(eq(productVariants.productId, product.id)),
      db.select({ url: productImages.url }).from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)).limit(1),
    ]);
    return { ...product, stockQuantity: stock[0]?.value ?? 0, imageUrl: image[0]?.url ?? null };
  }));
  return Response.json({ products: rows });
}

export async function POST(request: Request) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const body = await request.json() as Record<string, string>;
  const name = body.name?.trim();
  const sku = body.sku?.trim().toUpperCase();
  const price = parseEuroToCents(body.price);
  if (!name || !sku || price === null || price < 0) {
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
      id: productId, categoryId, name, sku, slug: slugify(body.slug || name),
      shortDescription: body.shortDescription?.trim() || null, description: body.description?.trim() || null,
      status: body.status === "active" ? "active" : "draft", basePriceCents: price,
      compareAtPriceCents: parseEuroToCents(body.compareAtPrice),
    });
    await db.insert(productVariants).values({
      id: crypto.randomUUID(), productId, sku, title: [body.color, body.size].filter(Boolean).join(" / ") || "Standard",
      color: body.color?.trim() || null, size: body.size?.trim() || null, priceCents: price,
      compareAtPriceCents: parseEuroToCents(body.compareAtPrice), stockQuantity: Math.max(0, Number.parseInt(body.stockQuantity || "0", 10) || 0),
    });
    if (body.imageUrl?.trim()) await db.insert(productImages).values({ id: crypto.randomUUID(), productId, url: body.imageUrl.trim(), altText: name });
  } catch {
    return Response.json({ error: "SKU o slug già esistente." }, { status: 409 });
  }
  await recordAdminAction(auth.user, "create", "product", productId, { name, sku });
  return Response.json({ id: productId }, { status: 201 });
}
