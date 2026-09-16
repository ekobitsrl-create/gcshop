import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { getDb } from "../db/index";
import * as schema from "../db/schema";
import { catalogTitle } from "../lib/catalog-titles";
import { parseSubscription, subscribe, NEWSLETTER_CONSENT_VERSION } from "../lib/newsletter";
import { POST } from "../app/api/newsletter/route";

const pg = new PGlite();
await pg.exec("CREATE SCHEMA luxury");
await pg.exec(await readFile(new URL("../drizzle/0006_newsletter_subscribers.sql", import.meta.url), "utf8"));
const db = drizzle(pg, { schema }) as unknown as ReturnType<typeof getDb>;
after(async () => { await pg.close(); });

test("newsletter requires a valid email and explicit consent", () => {
  for (const body of [null, [], {}, { email: "a@example.org" }, { email: "a@example.org", consent: "true" }, { email: "invalid", consent: true }, { email: "a@example.org", consent: true, website: "spam" }]) assert.throws(() => parseSubscription(body));
  assert.deepEqual(parseSubscription({ email: " TEST@Example.org ", consent: true, locale: "en" }), { email: "test@example.org", locale: "en" });
});
test("newsletter stores consent once and rejects a failed database write", async () => {
  const input = parseSubscription({ email: "test@example.org", consent: true, locale: "it" });
  await Promise.all([subscribe(input, db), subscribe(input, db)]);
  const rows = await db.select().from(schema.newsletterSubscribers);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].consentVersion, NEWSLETTER_CONSENT_VERSION);
  assert.match(rows[0].consentText, /Acconsento/);
  assert.ok(rows[0].subscribedAt);
  const failedDb = { insert() { throw new Error("offline"); } } as unknown as ReturnType<typeof getDb>;
  await assert.rejects(subscribe(input, failedDb), /offline/);
});
test("newsletter API rejects foreign origins, malformed requests and missing consent", async () => {
  const request = (body: string, origin = "https://shop.example", type = "application/json") => new Request("https://shop.example/api/newsletter", { method: "POST", headers: { origin, "Content-Type": type }, body });
  assert.equal((await POST(request("{}", "https://other.example"))).status, 403);
  assert.equal((await POST(request("{}", "https://shop.example", "text/plain"))).status, 415);
  assert.equal((await POST(request("{"))).status, 400);
  assert.equal((await POST(request(JSON.stringify({ email: "test@example.org", consent: false })))).status, 400);
  assert.equal((await POST(request(" ".repeat(2049)))).status, 413);
});
test("catalog corrections localize coded titles without modifying slugs or brand models", () => {
  const product = { slug: "add-5am1101-2310-taupe-5am1101-2310-taupe-13442", name: "5AM1101-2310-TAUPE", brand: "Add" };
  assert.equal(catalogTitle(product, "it"), "Giacca Add · 5AM1101");
  assert.equal(catalogTitle(product, "en"), "Jacket Add · 5AM1101");
  assert.equal(product.name, "5AM1101-2310-TAUPE");
  assert.equal(catalogTitle({ name: "NEW COLLECTION 2022", slug: "aquascutum-new-collection-2022-x", brand: "Aquascutum" }, "it"), "Giacca Aquascutum");
  assert.equal(catalogTitle({ name: "Beanie in cashmere", slug: "beanie" }, "it"), "Berretto in cashmere");
  assert.equal(catalogTitle({ name: "Gore G-Type Lens Jacket", slug: "gore-jacket" }, "it"), "Gore G-Type Lens Jacket");
});
