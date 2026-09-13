import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cartItems, carts, products, productVariants } from "@/db/schema";
import { getCartSnapshot } from "@/lib/cart";
import type { Locale } from "@/lib/i18n";

export class CartError extends Error {
  constructor(public code: string, public status = 400, public limit?: number) { super(code); }
}

type Mutation = { action: "add"; variantId: string; quantity: number } | { action: "set"; itemId: string; quantity: number } | { action: "remove"; itemId: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseCartMutation(action: Mutation["action"], value: unknown): Mutation {
  if (!value || typeof value !== "object") throw new CartError("cart.invalidRequest");
  const body = value as Record<string, unknown>;
  const id = body[action === "add" ? "variantId" : "itemId"];
  if (typeof id !== "string" || !uuid.test(id)) throw new CartError("cart.invalidRequest");
  if (action === "remove") return { action, itemId: id };
  const quantity = body.quantity === undefined ? (action === "add" ? 1 : undefined) : body.quantity;
  if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1) throw new CartError("cart.invalidQuantity");
  return action === "add" ? { action, variantId: id, quantity } : { action, itemId: id, quantity };
}

export async function mutateCart(token: string | undefined, mutation: Mutation, locale: Locale = "it", db = getDb()) {
  return db.transaction(async (tx) => {
    const [existingCart] = token && uuid.test(token) ? await tx.select().from(carts).where(eq(carts.token, token)).for("update") : [];
    if (existingCart?.status === "checkout") throw new CartError("cart.locked", 409);
    let cart = existingCart?.status === "active" ? existingCart : undefined;
    if (!cart) {
      if (mutation.action !== "add") throw new CartError("cart.itemMissing", 404);
      [cart] = await tx.insert(carts).values({ id: crypto.randomUUID(), token: crypto.randomUUID() }).returning();
    }

    // Cart and checkout share this lock order, preventing lost increments and
    // changes to an order whose stock has already been reserved.
    const [item] = mutation.action === "add"
      ? await tx.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, mutation.variantId)))
      : await tx.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, mutation.itemId)));
    if (mutation.action !== "add" && !item) throw new CartError("cart.itemMissing", 404);

    if (mutation.action === "remove") {
      await tx.delete(cartItems).where(eq(cartItems.id, item.id));
    } else {
      const [variant] = await tx.select({
        id: productVariants.id, productId: productVariants.productId, price: productVariants.priceCents,
        stock: productVariants.stockQuantity, active: productVariants.isActive, basePrice: products.basePriceCents, status: products.status,
      }).from(productVariants).innerJoin(products, eq(products.id, productVariants.productId))
        .where(eq(productVariants.id, mutation.action === "add" ? mutation.variantId : item.variantId));
      if (!variant?.active || variant.status !== "active") throw new CartError("cart.unavailable", 404);
      const nextQuantity = mutation.action === "add" ? (item?.quantity ?? 0) + mutation.quantity : mutation.quantity;
      if (nextQuantity > variant.stock) throw new CartError("cart.stockLimit", 409, variant.stock);
      if (item) await tx.update(cartItems).set({ quantity: nextQuantity, unitPriceCents: variant.price ?? variant.basePrice, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(cartItems.id, item.id));
      else await tx.insert(cartItems).values({ id: crypto.randomUUID(), cartId: cart.id, productId: variant.productId, variantId: variant.id, quantity: nextQuantity, unitPriceCents: variant.price ?? variant.basePrice });
    }
    await tx.update(carts).set({ updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(carts.id, cart.id));
    return { token: cart.token, cart: await getCartSnapshot(cart.token, locale, tx) };
  });
}
