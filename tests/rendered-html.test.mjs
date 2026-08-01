import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://luxuryconceptstore.test/", {
      headers: { accept: "text/html", host: "luxuryconceptstore.test" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Luxury Concept Store home", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Luxury Concept Store \| Moda contemporanea selezionata<\/title>/i);
  assert.match(html, /Il lusso,/);
  assert.match(html, /Luxury Concept Store/);
  assert.match(html, /Ekobit SRL/);
  assert.match(html, /02424510796/);
  assert.match(html, /Via Firenze 185/);
  assert.match(html, /338 134 6675/);
  assert.match(html, /info@ekobit\.it/);
  assert.doesNotMatch(html, /InStyleShop|instyleshop|codex-preview|Building your site/i);
});

test("removes the disposable starter preview", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Luxury Concept Store/);
  assert.match(layout, /og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app\/_sites-preview", templateRoot)));
});
