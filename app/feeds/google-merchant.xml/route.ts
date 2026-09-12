import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { buildGoogleMerchantFeedResult, type GoogleMerchantFeedRow } from "@/lib/google-merchant";
import { SITE_URL } from "@/lib/site-url.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  const startedAt = Date.now();

  try {
    const db = getDb();
    const [productRows, variantRows, imageRows] = await Promise.all([
      db
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
        })
        .from(products)
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .where(eq(products.status, "active")),
      db
        .select({
          productId: productVariants.productId,
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
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(and(eq(products.status, "active"), eq(productVariants.isActive, true)))
        .orderBy(asc(productVariants.productId), asc(productVariants.id)),
      db
        .select({ productId: productImages.productId, imageUrl: productImages.url })
        .from(productImages)
        .innerJoin(products, eq(products.id, productImages.productId))
        .where(eq(products.status, "active"))
        .orderBy(asc(productImages.productId), asc(productImages.sortOrder)),
    ]);

    const productsById = new Map(productRows.map((product) => [product.productId, product]));
    const variantCounts = new Map<string, number>();
    const imagesByProduct = new Map<string, string[]>();

    for (const variant of variantRows) {
      variantCounts.set(variant.productId, (variantCounts.get(variant.productId) ?? 0) + 1);
    }
    for (const image of imageRows) {
      const urls = imagesByProduct.get(image.productId) ?? [];
      if (urls.length < 6) urls.push(image.imageUrl);
      imagesByProduct.set(image.productId, urls);
    }

    const feedRows = variantRows.flatMap((variant): GoogleMerchantFeedRow[] => {
      const product = productsById.get(variant.productId);
      if (!product) return [];
      return [{
        ...product,
        ...variant,
        variantCount: variantCounts.get(variant.productId) ?? 1,
        imageUrls: imagesByProduct.get(variant.productId) ?? [],
      }];
    });

    const feed = buildGoogleMerchantFeedResult(feedRows, SITE_URL);
    const warningCount = Object.values(feed.warnings).reduce((sum, value) => sum + value, 0);

    console.info("[google-merchant-feed] generated", {
      durationMs: Date.now() - startedAt,
      includedItems: feed.includedItems,
      excludedItems: feed.excludedItems,
      warnings: feed.warnings,
    });

    return new Response(streamXml(feed.xml), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": "inline; filename=\"google-merchant.xml\"",
        "Content-Language": "it-IT",
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "X-Content-Type-Options": "nosniff",
        "X-Merchant-Items": String(feed.includedItems),
        "X-Merchant-Excluded": String(feed.excludedItems),
        "X-Merchant-Warnings": String(warningCount),
      },
    });
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause : null;
    console.error("[google-merchant-feed] generation failed", {
      durationMs: Date.now() - startedAt,
      name: error instanceof Error ? error.name : "UnknownError",
      error: error instanceof Error ? error.message : String(error),
      cause: cause ? { name: cause.name, message: cause.message } : undefined,
    });

    return new Response("Feed temporaneamente non disponibile.", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
