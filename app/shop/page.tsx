import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDb } from "@/db";
import { categories, productImages, products } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { catalogCategories } from "@/lib/catalog";
import { placeholderProducts } from "@/lib/placeholder-products";
import { formatProductPrice } from "@/lib/store-utils";
import "../commerce.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop — Abbigliamento e accessori",
  description: "Scopri la selezione di abbigliamento e accessori firmati di Lusso Concept Store.",
  alternates: { canonical: "/shop" },
};

const filters = [
  { label: "Tutto", value: "tutto" },
  ...catalogCategories.map((category) => ({ label: category.name, value: category.slug })),
];

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  currency: string;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const activeFilter = categoria?.toLowerCase() ?? "tutto";
  let baseRows: ProductRow[] = [];

  try {
    const db = getDb();
    const productsFromDatabase = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        brand: products.brand,
        price: products.basePriceCents,
        currency: products.currency,
        categoryName: categories.name,
        categorySlug: categories.slug,
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
    // L'anteprima locale usa lo stesso catalogo incluso nella migrazione.
  }

  if (!baseRows.length) {
    baseRows = placeholderProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      categoryName: product.categoryName,
      categorySlug: filters.find((filter) => filter.label === product.categoryName)?.value ?? null,
      imageUrl: product.imageUrl,
    }));
  }

  const rows = activeFilter === "tutto"
    ? baseRows
    : baseRows.filter((product) => product.categorySlug === activeFilter);

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero simple-commerce-hero">
          <p className="commerce-kicker">Catalogo</p>
          <h1>Tutti i prodotti</h1>
          <p className="commerce-hero-copy">Una selezione essenziale di abbigliamento e accessori. I prezzi mancanti e le disponibilità saranno aggiunti appena verificati.</p>
        </header>

        <nav className="shop-filters" aria-label="Filtra il catalogo">
          {filters.map((filter) => {
            const href = filter.value === "tutto" ? "/shop" : `/shop?categoria=${filter.value}`;
            return <Link className={activeFilter === filter.value ? "is-active" : ""} href={href} key={filter.value}>{filter.label}</Link>;
          })}
          <span>{rows.length} {rows.length === 1 ? "prodotto" : "prodotti"}</span>
        </nav>

        <section className="commerce-main shop-content">
          {rows.length ? (
            <div className="commerce-product-grid">
              {rows.map((product) => (
                <article className="commerce-product-card" key={product.id}>
                  <Link className="product-card-link" href={`/prodotto/${product.slug}`}>
                    <div className="product-card-media">
                      {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill unoptimized sizes="(max-width: 430px) 100vw, (max-width: 760px) 50vw, 33vw" /> : <span>Lusso</span>}
                    </div>
                    <div className="product-card-copy">
                      <p>{product.brand ?? product.categoryName ?? "Lusso Concept Store"}</p>
                      <h2>{product.name}</h2>
                      <strong>{formatProductPrice(product.price, product.currency)}</strong>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="commerce-empty">
              <div>
                <p className="commerce-kicker">Nessun prodotto</p>
                <h2>Questa categoria è ancora vuota.</h2>
                <p>Esplora tutto il catalogo oppure torna a trovarci per i prossimi arrivi.</p>
                <Link href="/shop">Vedi tutti i prodotti <span>→</span></Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
