import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cartItems, carts, productImages, products, productTranslations, productVariants } from "@/db/schema";
import type { Locale } from "@/lib/i18n";

export async function getCartSnapshot(token?: string, locale: Locale = "it") {
  if (!token) return { cartId: null, currency: "EUR", items: [], itemCount: 0, subtotalCents: 0 };
  const db = getDb();
  const cart = await db.select().from(carts).where(and(eq(carts.token, token), eq(carts.status, "active"))).limit(1);
  if (!cart.length) return { cartId: null, currency: "EUR", items: [], itemCount: 0, subtotalCents: 0 };
  const rows = await db.select({
    id: cartItems.id, productId: products.id, variantId: productVariants.id, name: sql<string>`coalesce(${productTranslations.name}, ${products.name})`,
    slug: products.slug, sku: productVariants.sku, variantName: productVariants.title,
    quantity: cartItems.quantity, unitPriceCents: cartItems.unitPriceCents,
    stockQuantity: productVariants.stockQuantity, imageUrl: productImages.url,
  }).from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .leftJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.sortOrder, 0)))
    .where(eq(cartItems.cartId, cart[0].id));
  const items = rows.map((item) => ({ ...item, lineTotalCents: item.unitPriceCents * item.quantity }));
  return {
    cartId: cart[0].id, currency: cart[0].currency, items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
  };
}
