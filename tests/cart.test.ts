import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test, { after, beforeEach } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import type { getDb } from "../db/index";
import * as schema from "../db/schema";
import { CartError, mutateCart, parseCartMutation } from "../lib/cart-mutations";
import { getCartSnapshot } from "../lib/cart";

const pg = new PGlite();
for (const file of (await readdir(new URL("../drizzle/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort()) await pg.exec(await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8"));
const db = drizzle(pg, { schema }) as unknown as ReturnType<typeof getDb>;
let variantId: string;
beforeEach(async () => {
  await pg.exec("TRUNCATE luxury.products, luxury.carts CASCADE");
  const productId = crypto.randomUUID(); variantId = crypto.randomUUID();
  await db.insert(schema.products).values({ id: productId, name: "Test cashmere", slug: "test-cashmere", sku: "CART", status: "active", basePriceCents: 6000 });
  await db.insert(schema.productVariants).values({ id: variantId, productId, sku: "CART-V", title: "UNI · Beige", stockQuantity: 6 });
});
after(async () => { await pg.close(); });

const add = (token?: string, quantity = 1) => mutateCart(token, { action: "add", variantId, quantity }, "it", db);

test("repeated additions update one line, the total quantity and the current price", async () => {
  const first = await add();
  const second = await add(first.token, 2);
  assert.equal(second.token, first.token);
  assert.equal(second.cart.items.length, 1);
  assert.equal(second.cart.items[0].quantity, 3);
  assert.equal(second.cart.itemCount, 3);
  assert.equal(second.cart.subtotalCents, 18000);
  assert.equal((await db.select().from(schema.productVariants))[0].stockQuantity, 6, "adding to a cart never reserves stock");
});

test("simultaneous additions cannot overwrite each other's quantities", async () => {
  const first = await add();
  await Promise.all([add(first.token), add(first.token), add(first.token)]);
  const snapshot = await getCartSnapshot(first.token, "it", db);
  assert.equal(snapshot.items.length, 1);
  assert.equal(snapshot.itemCount, 4);
  assert.equal(snapshot.subtotalCents, 24000);
});

test("reaching stock returns a clear conflict instead of a false success", async () => {
  await db.update(schema.productVariants).set({ stockQuantity: 1 });
  const first = await add();
  await assert.rejects(add(first.token), (error: unknown) => error instanceof CartError && error.status === 409 && error.code === "cart.stockLimit" && error.limit === 1);
  assert.equal((await getCartSnapshot(first.token, "it", db)).itemCount, 1);
});

test("quantity edits and removal update totals and remain scoped to the owning cart", async () => {
  const first = await add(undefined, 3);
  const second = await add();
  const itemId = first.cart.items[0].id;
  await assert.rejects(mutateCart(second.token, { action: "remove", itemId }, "it", db), /cart.itemMissing/);
  await assert.rejects(mutateCart(second.token, { action: "set", itemId, quantity: 2 }, "it", db), /cart.itemMissing/);
  const changed = await mutateCart(first.token, { action: "set", itemId, quantity: 2 }, "it", db);
  assert.equal(changed.cart.subtotalCents, 12000);
  assert.equal(changed.cart.itemCount, 2);
  const removed = await mutateCart(first.token, { action: "remove", itemId }, "it", db);
  assert.equal(removed.cart.itemCount, 0);
  assert.equal(removed.cart.subtotalCents, 0);
  assert.equal((await getCartSnapshot(second.token, "it", db)).itemCount, 1);
});

test("reserved carts cannot be edited while completed carts can start a new selection", async () => {
  const first = await add();
  const itemId = first.cart.items[0].id;
  await db.update(schema.carts).set({ status: "checkout" }).where(eq(schema.carts.id, first.cart.cartId!));
  await assert.rejects(add(first.token), /cart.locked/);
  await assert.rejects(mutateCart(first.token, { action: "remove", itemId }, "it", db), /cart.locked/);
  assert.equal((await getCartSnapshot(first.token, "it", db)).checkoutUrl, "/checkout");
  await db.update(schema.carts).set({ status: "converted" }).where(eq(schema.carts.id, first.cart.cartId!));
  const next = await add(first.token);
  assert.notEqual(next.token, first.token);
  assert.equal(next.cart.itemCount, 1);
});

test("invalid input and unavailable products do not create empty carts", async () => {
  for (const quantity of [0, -1, 1.5, "2", null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseCartMutation("add", { variantId, quantity }), /cart.invalidQuantity/);
  }
  assert.throws(() => parseCartMutation("set", { itemId: crypto.randomUUID() }), /cart.invalidQuantity/);
  assert.throws(() => parseCartMutation("add", { variantId: "bad" }), /cart.invalidRequest/);
  await assert.rejects(add(undefined, 7), /cart.stockLimit/);
  await db.update(schema.productVariants).set({ isActive: false });
  await assert.rejects(add(), /cart.unavailable/);
  assert.equal((await db.select().from(schema.carts)).length, 0);
});
