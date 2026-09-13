import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productTranslations, productVariants } from "@/db/schema";
import { translateCatalogFallback, type Locale } from "@/lib/i18n";
import { comparisonPrice, parseComparisonIds, type ComparisonProduct } from "@/lib/product-comparison";

function attributesFrom(raw: string | null): Record<string, unknown> {
  try {
    const attributes: unknown = JSON.parse(raw ?? "{}").attributes;
    return attributes && typeof attributes === "object" && !Array.isArray(attributes) ? attributes as Record<string, unknown> : {};
  } catch { return {}; }
}
const textAttribute = (value: unknown) => typeof value === "string" && value.trim() ? value : null;

export async function getComparisonProducts(requestedIds: string[], locale: Locale, database?: ReturnType<typeof getDb>): Promise<ComparisonProduct[]> {
  const ids = parseComparisonIds(requestedIds.join(","));
  if (!ids.length) return [];
  const db = database ?? getDb();
  const rows = await db.select({
    id: products.id, slug: products.slug, brand: products.brand, currency: products.currency,
    name: sql<string>`coalesce(${productTranslations.name}, ${products.name})`,
    basePriceCents: products.basePriceCents, metadataJson: products.metadataJson, originCountry: products.originCountry,
    category: sql<string | null>`coalesce(${productTranslations.subcategory}, ${productTranslations.category}, ${categories.name})`,
    color: productTranslations.color, composition: productTranslations.composition, season: productTranslations.season,
    imageUrl: sql<string | null>`(select ${productImages.url} from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder}, ${productImages.id} limit 1)`,
  }).from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
    .where(and(inArray(products.id, ids), eq(products.status, "active")));
  if (!rows.length) return [];
  const variants = await db.select({
    id: productVariants.id, productId: productVariants.productId, priceCents: productVariants.priceCents,
    stockQuantity: productVariants.stockQuantity, size: productVariants.size, color: productVariants.color,
  }).from(productVariants)
    .where(and(inArray(productVariants.productId, rows.map((row) => row.id)), eq(productVariants.isActive, true)))
    .orderBy(asc(productVariants.title), asc(productVariants.id));

  return ids.flatMap((id) => {
    const row = rows.find((product) => product.id === id);
    if (!row) return [];
    const attributes = attributesFrom(row.metadataJson);
    const productVariants = variants.filter((variant) => variant.productId === id);
    return [{
      id: row.id, name: row.name, slug: row.slug, brand: row.brand, currency: row.currency,
      imageUrl: row.imageUrl, originCountry: row.originCountry, category: row.category,
      composition: row.composition ?? textAttribute(attributes.composition),
      season: row.season ?? textAttribute(attributes.season),
      color: row.color ?? textAttribute(attributes.color) ?? translateCatalogFallback(locale, productVariants.find((variant) => variant.color)?.color ?? null),
      ...comparisonPrice(row.basePriceCents, productVariants),
    }];
  });
}
