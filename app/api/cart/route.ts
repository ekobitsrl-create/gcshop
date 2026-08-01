import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { cartItems, carts, products, productVariants } from "@/db/schema";
import { getCartSnapshot } from "@/lib/cart";

const COOKIE = "lcs_cart";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value;
  return Response.json(await getCartSnapshot(token));
}

export async function POST(request: Request) {
  const body = await request.json() as { variantId?: string; quantity?: number };
  const quantity = Math.max(1, Math.min(20, Math.trunc(body.quantity ?? 1)));
  if (!body.variantId) return Response.json({ error: "Variante mancante." }, { status: 400 });
  const db = getDb();
  const variant = await db.select({
    id: productVariants.id, productId: productVariants.productId, priceCents: productVariants.priceCents,
    stock: productVariants.stockQuantity, active: productVariants.isActive, basePriceCents: products.basePriceCents,
    productStatus: products.status,
  }).from(productVariants).innerJoin(products, eq(productVariants.productId, products.id)).where(eq(productVariants.id, body.variantId)).limit(1);
  if (!variant.length || !variant[0].active || variant[0].productStatus !== "active") return Response.json({ error: "Prodotto non disponibile." }, { status: 404 });
  if (variant[0].stock < quantity) return Response.json({ error: "Quantità non disponibile." }, { status: 409 });
  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE)?.value;
  let cart = token ? await db.select({ id: carts.id }).from(carts).where(and(eq(carts.token, token), eq(carts.status, "active"))).limit(1) : [];
  if (!cart.length) {
    token = crypto.randomUUID(); const id = crypto.randomUUID();
    await db.insert(carts).values({ id, token }); cart = [{ id }];
    cookieStore.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  const existing = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart[0].id), eq(cartItems.variantId, body.variantId))).limit(1);
  const nextQuantity = Math.min(variant[0].stock, quantity + (existing[0]?.quantity ?? 0));
  if (existing.length) await db.update(cartItems).set({ quantity: nextQuantity, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(cartItems.id, existing[0].id));
  else await db.insert(cartItems).values({ id: crypto.randomUUID(), cartId: cart[0].id, productId: variant[0].productId, variantId: body.variantId, quantity, unitPriceCents: variant[0].priceCents ?? variant[0].basePriceCents });
  return Response.json(await getCartSnapshot(token));
}

export async function DELETE(request: Request) {
  const body = await request.json() as { itemId?: string };
  const token = (await cookies()).get(COOKIE)?.value;
  const snapshot = await getCartSnapshot(token);
  if (!body.itemId || !snapshot.cartId) return Response.json(snapshot);
  await getDb().delete(cartItems).where(and(eq(cartItems.id, body.itemId), eq(cartItems.cartId, snapshot.cartId)));
  return Response.json(await getCartSnapshot(token));
}
