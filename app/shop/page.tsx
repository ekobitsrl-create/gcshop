import { asc, eq } from "drizzle-orm";
import Image from "next/image";
import { getDb } from "@/db";
import { categories, productImages, products } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { placeholderProducts } from "@/lib/placeholder-products";
import { formatMoney } from "@/lib/store-utils";
import "../commerce.css";

export const dynamic = "force-dynamic";

const filters = ["Tutto", "Donna", "Uomo", "Accessori"];
type ProductRow = { id: string; name: string; slug: string; price: number; currency: string; categoryName: string | null; imageUrl: string | null };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const activeFilter = categoria?.toLowerCase() ?? "tutto";
  const db = getDb();
  let baseRows: ProductRow[] = [];
  try {
    const productsFromDatabase = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.basePriceCents,
        currency: products.currency,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.status, "active"))
      .orderBy(asc(products.name));
    baseRows = await Promise.all(productsFromDatabase.map(async (product) => ({
      ...product,
      imageUrl: (await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(asc(productImages.sortOrder))
        .limit(1))[0]?.url ?? null,
    })));
  } catch {
    // Il catalogo pubblico resta presentabile anche durante una sospensione temporanea del database.
  }

  if (!baseRows.length) {
    baseRows = placeholderProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      currency: product.currency,
      categoryName: product.categoryName,
      imageUrl: product.imageUrl,
    }));
  }

  const filteredRows = activeFilter === "tutto"
    ? baseRows
    : baseRows.filter((product) => product.categoryName?.toLowerCase().includes(activeFilter));
  const rows = filteredRows;

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero">
          <p className="commerce-kicker">Collection / 2026</p>
          <h1>Shop<br /><em>the edit.</em></h1>
          <p className="commerce-hero-copy">Una selezione in continua evoluzione. Pochi pezzi, scelti con intenzione.</p>
        </header>

        <nav className="shop-filters" aria-label="Filtra il catalogo">
          {filters.map((filter) => {
            const value = filter.toLowerCase();
            const href = value === "tutto" ? "/shop" : `/shop?categoria=${value}`;
            return <a className={activeFilter === value ? "is-active" : ""} href={href} key={filter}>{filter}</a>;
          })}
          <span>{String(rows.length).padStart(2, "0")} pezzi</span>
        </nav>

        <section className="commerce-main shop-content">
          {rows.length ? (
            <div className="commerce-product-grid">
              {rows.map((product, index) => (
                <article className="commerce-product-card" key={product.id}>
                  <a className="product-card-link" href={`/prodotto/${product.slug}`}>
                    <div className="product-card-media">
                      {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill unoptimized sizes="(max-width: 430px) 100vw, (max-width: 760px) 50vw, 25vw" /> : <span>LCS</span>}
                      <small>{String(index + 1).padStart(2, "0")}</small>
                    </div>
                    <div className="product-card-copy">
                      <p>{product.categoryName ?? "Luxury Concept Store"}</p>
                      <h2>{product.name}</h2>
                      <strong>{formatMoney(product.price, product.currency)}</strong>
                    </div>
                  </a>
                  <a className="product-card-tryon" href={`/try-on?prodotto=${product.slug}`} aria-label={`Scopri l'anteprima AR di ${product.name}`}>AR preview <span>↗</span></a>
                </article>
              ))}
            </div>
          ) : (
            <div className="commerce-empty">
              <div className="empty-number">00</div>
              <div>
                <p className="commerce-kicker">La selezione sta arrivando</p>
                <h2>Il catalogo è pronto.<br /><em>Ora servono le cose giuste.</em></h2>
                <p>Nessun riempitivo. I prodotti appariranno qui solo quando saranno stati scelti e pubblicati dal pannello amministrativo.</p>
                <a href="/admin/prodotti">Gestisci il catalogo <span>↗</span></a>
              </div>
            </div>
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
