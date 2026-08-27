import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";
import { parseEuroToCents } from "@/lib/store-utils";

const allowedStatuses = new Set(["draft", "active", "archived"]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const { id } = await params;
  const db = getDb();
  const [row, images, variants] = await Promise.all([
    db.select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(asc(productVariants.title)),
  ]);
  if (!row.length) return Response.json({ error: "Prodotto non trovato." }, { status: 404 });
  return Response.json({ product: row[0].product, categoryName: row[0].categoryName, images, variants });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json() as {
    status?: string;
    price?: string;
    compareAtPrice?: string;
    variantId?: string;
    stockQuantity?: number;
    resetPrice?: boolean;
    resetStock?: boolean;
    isFeatured?: boolean;
  };
  const db = getDb();

  if (body.variantId && (body.stockQuantity !== undefined || body.resetStock)) {
    const variant = await db.select({ supplierStockQuantity: productVariants.supplierStockQuantity })
      .from(productVariants)
      .where(and(eq(productVariants.id, body.variantId), eq(productVariants.productId, id)))
      .limit(1);
    if (!variant.length) return Response.json({ error: "Variante non trovata." }, { status: 404 });
    const stock = body.resetStock
      ? variant[0].supplierStockQuantity
      : Math.max(0, Math.trunc(Number(body.stockQuantity) || 0));
    await db.update(productVariants).set({
      stockQuantity: stock,
      stockLocked: !body.resetStock,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(productVariants.id, body.variantId));
    await recordAdminAction(auth.user, body.resetStock ? "reset_stock" : "update_stock", "product", id, { variantId: body.variantId, stock });
    return Response.json({ ok: true });
  }

  if (body.resetPrice) {
    const row = await db.select({
      supplierCostCents: products.supplierCostCents,
      supplierRetailPriceCents: products.supplierRetailPriceCents,
    }).from(products).where(eq(products.id, id)).limit(1);
    if (!row.length) return Response.json({ error: "Prodotto non trovato." }, { status: 404 });
    const fallback = row[0].supplierCostCents !== null
      ? row[0].supplierCostCents * 2
      : (row[0].supplierRetailPriceCents ?? 0);
    await Promise.all([
      db.update(products).set({ basePriceCents: fallback, compareAtPriceCents: null, priceLocked: false, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(products.id, id)),
      db.update(productVariants).set({ priceCents: sql`coalesce(${productVariants.supplierCostCents} * 2, ${fallback})`, compareAtPriceCents: null, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(productVariants.productId, id)),
    ]);
    await recordAdminAction(auth.user, "reset_price", "product", id, { priceCents: fallback });
    return Response.json({ ok: true });
  }

  const update: Record<string, unknown> = { updatedAt: sql`CURRENT_TIMESTAMP` };
  const audit: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!allowedStatuses.has(body.status)) return Response.json({ error: "Stato non valido." }, { status: 400 });
    update.status = body.status;
    update.statusLocked = true;
    audit.status = body.status;
  }
  if (body.price !== undefined) {
    const price = parseEuroToCents(body.price);
    const compareAtPrice = body.compareAtPrice ? parseEuroToCents(body.compareAtPrice) : null;
    update.basePriceCents = price;
    update.compareAtPriceCents = compareAtPrice;
    update.priceLocked = true;
    audit.priceCents = price;
    await db.update(productVariants).set({
      priceCents: price,
      compareAtPriceCents: compareAtPrice,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(productVariants.productId, id));
  }
  if (body.isFeatured !== undefined) {
    update.isFeatured = Boolean(body.isFeatured);
    audit.isFeatured = Boolean(body.isFeatured);
  }
  if (Object.keys(audit).length === 0) return Response.json({ error: "Nessuna modifica valida." }, { status: 400 });
  await db.update(products).set(update).where(eq(products.id, id));
  await recordAdminAction(auth.user, "update", "product", id, audit);
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const { id } = await params;
  await getDb().update(products).set({ status: "archived", statusLocked: true, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(products.id, id));
  await recordAdminAction(auth.user, "archive", "product", id);
  return Response.json({ ok: true });
}
