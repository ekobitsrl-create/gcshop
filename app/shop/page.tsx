import { and, asc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Metadata } from "next";
import Image from "next/image";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { placeholderProducts } from "@/lib/placeholder-products";
import { formatMoney } from "@/lib/store-utils";
import "../commerce.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop — Donna, Uomo e Accessori",
  description: "Esplora la selezione LCS: moda donna, uomo e accessori scelti per forma, materia e carattere.",
  alternates: { canonical: "/shop" },
};

const filters = [
  { label: "Tutto", value: "tutto" },
  { label: "Donna", value: "donna" },
  { label: "Uomo", value: "uomo" },
  { label: "Accessori", value: "accessori" },
];
const PAGE_SIZE = 48;

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  categoryName: string | null;
  categoryGroup: string | null;
  imageUrl: string | null;
  stockQuantity: number;
};

function shopUrl({ category, query, page = 1 }: { category: string; query: string; page?: number }) {
  const params = new URLSearchParams();
  if (category !== "tutto") params.set("categoria", category);
  if (query) params.set("q", query);
  if (page > 1) params.set("pagina", String(page));
  const suffix = params.toString();
  return suffix ? `/shop?${suffix}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string; pagina?: string }> }) {
  const params = await searchParams;
  const activeFilter = filters.some((filter) => filter.value === params.categoria) ? params.categoria! : "tutto";
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const db = getDb();
  const parentCategories = alias(categories, "parent_categories");
  const conditions: SQL[] = [eq(products.status, "active")];
  if (activeFilter === "donna" || activeFilter === "uomo") conditions.push(eq(products.gender, activeFilter));
  if (activeFilter === "accessori") {
    conditions.push(or(
      eq(parentCategories.name, "Accessori"), eq(parentCategories.name, "Borse"), eq(parentCategories.name, "Scarpe"),
      eq(categories.name, "Accessori"), eq(categories.name, "Borse"), eq(categories.name, "Scarpe"),
    )!);
  }
  if (query) {
    const term = `%${query}%`;
    conditions.push(or(ilike(products.name, term), ilike(products.brand, term), ilike(products.sku, term))!);
  }
  const where = and(...conditions);
  let rows: ProductRow[] = [];
  let total = 0;

  try {
    const [databaseRows, countRows] = await Promise.all([
      db.select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        brand: products.brand,
        price: products.basePriceCents,
        compareAtPrice: products.compareAtPriceCents,
        currency: products.currency,
        categoryName: categories.name,
        categoryGroup: parentCategories.name,
        imageUrl: sql<string | null>`(select ${productImages.url} from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
        stockQuantity: sql<number>`coalesce((select sum(${productVariants.stockQuantity}) from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.isActive} = true), 0)`,
      }).from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
        .where(where)
        .orderBy(asc(products.brand), asc(products.name))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db.select({ value: sql<number>`count(*)` }).from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
        .where(where),
    ]);
    rows = databaseRows;
    total = Number(countRows[0]?.value ?? 0);
  } catch {
    // L’anteprima locale usa i segnaposto solo quando il database non è raggiungibile.
  }

  if (!rows.length && !query && activeFilter === "tutto" && total === 0) {
    rows = placeholderProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: null,
      price: product.price,
      compareAtPrice: null,
      currency: product.currency,
      categoryName: product.categoryName,
      categoryGroup: product.categoryName,
      imageUrl: product.imageUrl,
      stockQuantity: 0,
    }));
    total = rows.length;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero shop-collection-hero">
          <p className="commerce-kicker">The selected edit / 2026</p>
          <h1>Shop<br /><em>the edit.</em></h1>
          <p className="commerce-hero-copy">Capi scelti per forma, materia e presenza. Il catalogo cambia, il criterio resta.</p>
        </header>

        <nav className="shop-filters" aria-label="Filtra il catalogo">
          {filters.map((filter) => <a className={activeFilter === filter.value ? "is-active" : ""} href={shopUrl({ category: filter.value, query })} key={filter.value}>{filter.label}</a>)}
          <span>{total.toLocaleString("it-IT")} capi</span>
        </nav>

        <section className="commerce-main shop-content">
          <div className="shop-tools">
            <div><p className="commerce-kicker">{filters.find((filter) => filter.value === activeFilter)?.label}</p><h2>{query ? `Risultati per “${query}”` : "La selezione completa"}</h2></div>
            <form action="/shop" method="get"><input name="q" defaultValue={query} placeholder="Cerca brand, capo o codice" /><input type="hidden" name="categoria" value={activeFilter === "tutto" ? "" : activeFilter} /><button>Cerca</button></form>
          </div>
          {rows.length ? (
            <div className="commerce-product-grid">
              {rows.map((product, index) => (
                <article className="commerce-product-card" key={product.id}>
                  <a className="product-card-link" href={`/prodotto/${product.slug}`}>
                    <div className="product-card-media">
                      {product.imageUrl ? <Image src={product.imageUrl} alt={`${product.brand ?? "LCS"} ${product.name}`} fill unoptimized sizes="(max-width: 430px) 100vw, (max-width: 760px) 50vw, 25vw" /> : <span>LCS</span>}
                      <small>{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}</small>
                      {product.stockQuantity <= 2 && product.stockQuantity > 0 ? <em>Ultimi pezzi</em> : null}
                    </div>
                    <div className="product-card-copy">
                      <p>{product.brand ?? product.categoryName ?? "LCS selection"}</p>
                      <h2>{product.name}</h2>
                      <div className="product-card-price"><strong>{formatMoney(product.price, product.currency)}</strong>{product.compareAtPrice && product.compareAtPrice > product.price ? <del>{formatMoney(product.compareAtPrice, product.currency)}</del> : null}</div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          ) : <div className="commerce-empty"><div className="empty-number">00</div><div><p className="commerce-kicker">Nessun risultato</p><h2>Prova un altro<br /><em>punto di vista.</em></h2><p>Modifica la ricerca o torna alla selezione completa.</p><a href="/shop">Torna allo shop <span>↗</span></a></div></div>}
          {pages > 1 ? <nav className="shop-pagination" aria-label="Pagine catalogo"><a aria-disabled={page <= 1} href={shopUrl({ category: activeFilter, query, page: Math.max(1, page - 1) })}>← Precedente</a><span>{page} / {pages}</span><a aria-disabled={page >= pages} href={shopUrl({ category: activeFilter, query, page: Math.min(pages, page + 1) })}>Successiva →</a></nav> : null}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
