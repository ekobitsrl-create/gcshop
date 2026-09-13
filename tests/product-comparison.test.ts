import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test, { after, beforeEach } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import type { getDb } from "../db/index";
import * as schema from "../db/schema";
import { comparisonPrice, comparePrices, parseComparisonIds, readComparisonSelection, toggleComparison } from "../lib/product-comparison";
import { getComparisonProducts } from "../lib/comparison-catalog";

const firstId = "00000000-0000-4000-8000-000000000001";
const secondId = "00000000-0000-4000-8000-000000000002";
const thirdId = "00000000-0000-4000-8000-000000000003";

test("comparison selection never exceeds two products and can replace a removed item", () => {
  const first = toggleComparison([], { id: firstId, name: "One" });
  const pair = toggleComparison(first.items, { id: secondId, name: "Two" });
  const rejected = toggleComparison(pair.items, { id: thirdId, name: "Three" });
  assert.equal(rejected.notice, "compare.limit");
  assert.deepEqual(rejected.items, pair.items);
  const removed = toggleComparison(pair.items, { id: firstId, name: "One" });
  assert.deepEqual(toggleComparison(removed.items, { id: thirdId, name: "Three" }).items.map((item) => item.id), [secondId, thirdId]);
});

test("stored selections recover from malformed data, drop duplicates and retain only public identifiers and names", () => {
  for (const raw of [null, "{", "null", "{}", '"text"']) assert.deepEqual(readComparisonSelection(raw), []);
  const restored = readComparisonSelection(JSON.stringify([
    { id: "bad", name: "bad" }, { id: firstId, name: "One", priceCents: 1 }, { id: firstId, name: "duplicate" },
    { id: secondId, name: "Two" }, { id: thirdId, name: "Three" },
  ]));
  assert.deepEqual(restored, [{ id: firstId, name: "One" }, { id: secondId, name: "Two" }]);
});

test("server input rejects invalid or more than two IDs before querying", () => {
  assert.deepEqual(parseComparisonIds(""), []);
  assert.deepEqual(parseComparisonIds(`${firstId},${firstId}`), [firstId]);
  for (const input of ["bad", `${firstId},`, `${firstId},${secondId},${thirdId}`]) assert.throws(() => parseComparisonIds(input), /compare.invalid/);
});

test("price comparison uses the cheapest in-stock variant, never a cheaper sold-out size", () => {
  const price = comparisonPrice(10000, [
    { id: "sold", priceCents: 2000, stockQuantity: 0, size: "XS" },
    { id: "m", priceCents: null, stockQuantity: 1, size: "M" },
    { id: "l", priceCents: 9000, stockQuantity: 2, size: "L" },
  ]);
  assert.equal(price.priceCents, 9000);
  assert.equal(price.priceVaries, true);
  assert.equal(price.cheapestVariantId, "l");
  assert.deepEqual(price.sizes, ["M", "L"]);
});

test("equal prices, sold-out products, missing prices and different currencies have no false winner", () => {
  const first = { id: firstId, priceCents: 6000, currency: "EUR", inStock: true };
  const second = { ...first, id: secondId };
  assert.equal(comparePrices([first, second]).kind, "equal");
  for (const changed of [{ ...second, currency: "USD" }, { ...second, inStock: false }, { ...second, priceCents: null }]) assert.equal(comparePrices([first, changed]).kind, "unavailable");
  assert.equal(comparePrices([first]).kind, "unavailable");
  assert.deepEqual(comparePrices([first, { ...second, priceCents: 7999 }]), { kind: "winner", winnerId: firstId, savingCents: 1999, currency: "EUR" });
  assert.deepEqual(comparePrices([{ ...first, priceCents: 7999 }, second]), { kind: "winner", winnerId: secondId, savingCents: 1999, currency: "EUR" });
});

const pg = new PGlite();
for (const file of (await readdir(new URL("../drizzle/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort()) await pg.exec(await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8"));
const db = drizzle(pg, { schema }) as unknown as ReturnType<typeof getDb>;
beforeEach(async () => {
  await pg.exec("TRUNCATE luxury.products CASCADE");
  await db.insert(schema.products).values([
    { id: firstId, name: "Maglia", slug: "maglia", sku: "COMPARE-1", status: "active", basePriceCents: 6000, supplierCostCents: 1000, metadataJson: JSON.stringify({ attributes: { composition: "100% cotone", color: "Bianco" }, supplierSecret: "private" }) },
    { id: secondId, name: "Borsa", slug: "borsa", sku: "COMPARE-2", status: "active", basePriceCents: 9000, metadataJson: "{broken" },
    { id: thirdId, name: "Draft", slug: "draft", sku: "COMPARE-3", status: "draft", basePriceCents: 1 },
  ]);
  await db.insert(schema.productVariants).values([
    { id: crypto.randomUUID(), productId: firstId, sku: "C1-M", title: "M", size: "M", stockQuantity: 3 },
    { id: crypto.randomUUID(), productId: firstId, sku: "C1-S", title: "S", size: "S", stockQuantity: 0, priceCents: 1000 },
    { id: crypto.randomUUID(), productId: firstId, sku: "C1-X", title: "Inactive", stockQuantity: 2, isActive: false, priceCents: 500 },
    { id: crypto.randomUUID(), productId: secondId, sku: "C2", title: "UNI", size: "UNI", stockQuantity: 1 },
  ]);
});
after(async () => { await pg.close(); });

test("catalog comparison reads live prices in selection order and exposes only public product details", async () => {
  const products = await getComparisonProducts([secondId, firstId], "it", db);
  assert.deepEqual(products.map((product) => product.id), [secondId, firstId]);
  assert.equal(products[1].priceCents, 6000);
  assert.equal(products[1].priceVaries, false);
  assert.deepEqual(products[1].sizes, ["M"]);
  assert.equal(products[1].composition, "100% cotone");
  assert.equal(products[0].composition, null);
  assert.equal(JSON.stringify(products).includes("supplier"), false);
  assert.equal(JSON.stringify(products).includes("metadataJson"), false);
  await db.update(schema.products).set({ basePriceCents: 9500 }).where(eq(schema.products.id, firstId));
  const updated = await getComparisonProducts([firstId, secondId], "it", db);
  assert.equal(updated[0].priceCents, 9500);
  assert.equal(comparePrices(updated).kind, "winner");
  assert.equal(comparePrices(updated).winnerId, secondId);
});

test("catalog comparison applies translations and hides inactive or removed products", async () => {
  await db.insert(schema.productTranslations).values({ productId: firstId, locale: "en", name: "Top", color: "White", composition: "100% cotton", subcategory: "Tops" });
  const products = await getComparisonProducts([firstId, thirdId], "en", db);
  assert.equal(products.length, 1);
  assert.equal(products[0].name, "Top");
  assert.equal(products[0].composition, "100% cotton");
  assert.equal(products[0].category, "Tops");
  assert.equal(products[0].color, "White");
  await db.delete(schema.products).where(eq(schema.products.id, firstId));
  assert.deepEqual(await getComparisonProducts([firstId], "it", db), []);
  await assert.rejects(getComparisonProducts([firstId, secondId, thirdId], "it", db), /compare.invalid/);
});

test("a newly sold-out product cannot win even with backordering enabled", async () => {
  await db.update(schema.productVariants).set({ stockQuantity: 0, backorder: true }).where(eq(schema.productVariants.productId, firstId));
  const products = await getComparisonProducts([firstId, secondId], "it", db);
  assert.equal(products[0].inStock, false);
  assert.equal(products[0].cheapestVariantId, null);
  assert.deepEqual(products[0].sizes, []);
  assert.equal(comparePrices(products).kind, "unavailable");
});
