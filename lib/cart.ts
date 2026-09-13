import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cartItems, carts, productImages, products, productTranslations, productVariants } from "@/db/schema";
import type { Locale } from "@/lib/i18n";
import { emptyCart, type CartSnapshot } from "@/lib/cart-types";

export async function getCartSnapshot(token?: string, locale: Locale = "it", connection?: Pick<ReturnType<typeof getDb>, "select">): Promise<CartSnapshot> {
  if (!token || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return emptyCart;
  const db = connection ?? getDb();
  const cart = await db.select().from(carts).where(eq(carts.token, token)).limit(1);
  if (!cart.length) return emptyCart;
  if (cart[0].status === "checkout") return { ...emptyCart, checkoutUrl: "/checkout" };
  if (cart[0].status !== "active") return emptyCart;
  const rows = await db.select({
    id: cartItems.id, productId: products.id, variantId: productVariants.id, name: sql<string>`coalesce(${productTranslations.name}, ${products.name})`,
    slug: products.slug, sku: productVariants.sku, variantName: productVariants.title,
    quantity: cartItems.quantity, unitPriceCents: sql<number>`coalesce(${productVariants.priceCents}, ${products.basePriceCents})`,
    stockQuantity: productVariants.stockQuantity, imageUrl: productImages.url,
  }).from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .leftJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.sortOrder, 0)))
    .where(eq(cartItems.cartId, cart[0].id)).orderBy(asc(cartItems.createdAt), asc(cartItems.id));
  const items = rows.map((item) => ({ ...item, lineTotalCents: item.unitPriceCents * item.quantity }));
  return {
    cartId: cart[0].id, currency: cart[0].currency, items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
  };
}
