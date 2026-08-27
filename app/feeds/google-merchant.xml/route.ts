import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { buildGoogleMerchantFeed, type GoogleMerchantFeedRow } from "@/lib/google-merchant";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lcsedit.vercel.app";

function streamXml(xml: string) {
  const encoder = new TextEncoder();
  let offset = 0;
  const chunkSize = 64 * 1024;

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= xml.length) {
        controller.close();
        return;
      }

      let end = Math.min(offset + chunkSize, xml.length);
      const lastCodeUnit = xml.charCodeAt(end - 1);
      if (end < xml.length && lastCodeUnit >= 0xd800 && lastCodeUnit <= 0xdbff) end -= 1;
      controller.enqueue(encoder.encode(xml.slice(offset, end)));
      offset = end;
    },
  });
}

export async function GET() {
  const db = getDb();
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      slug: products.slug,
      productSku: products.sku,
      description: products.description,
      shortDescription: products.shortDescription,
      brand: products.brand,
      gender: products.gender,
      currency: products.currency,
      basePriceCents: products.basePriceCents,
      productCompareAtPriceCents: products.compareAtPriceCents,
      catalogSource: products.catalogSource,
      originCountry: products.originCountry,
      productWeightGrams: products.weightGrams,
      metadataJson: products.metadataJson,
      categoryName: categories.name,
      variantId: productVariants.id,
      variantSku: productVariants.sku,
      variantTitle: productVariants.title,
      color: productVariants.color,
      size: productVariants.size,
      variantPriceCents: productVariants.priceCents,
      variantCompareAtPriceCents: productVariants.compareAtPriceCents,
      stockQuantity: productVariants.stockQuantity,
      backorder: productVariants.backorder,
      supplierCode: productVariants.supplierCode,
      barcode: productVariants.barcode,
      variantWeightGrams: productVariants.weightGrams,
      variantCount: sql<number>`(
        select count(*)
        from ${productVariants} grouped_variant
        where grouped_variant.product_id = ${products.id}
          and grouped_variant.is_active = true
      )`,
      imageUrls: sql<string[]>`coalesce(array(
        select ${productImages.url}
        from ${productImages}
        where ${productImages.productId} = ${products.id}
        order by ${productImages.sortOrder} asc
        limit 11
      ), array[]::text[])`,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.status, "active"), eq(productVariants.isActive, true)))
    .orderBy(asc(products.id), asc(productVariants.id));

  const xml = buildGoogleMerchantFeed(rows as GoogleMerchantFeedRow[], siteUrl);

  return new Response(streamXml(xml), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
