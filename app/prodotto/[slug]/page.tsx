import { and, asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductPurchase } from "@/components/product-purchase";
import { StoreFooter } from "@/components/store-footer";
import { catalogCategories } from "@/lib/catalog";
import { findPlaceholderProduct, placeholderProducts } from "@/lib/placeholder-products";
import { createPreviewVariants, getProductFacts } from "@/lib/product-merchandising";
import { formatProductPrice } from "@/lib/store-utils";
import "../../commerce.css";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type ProductView = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  basePriceCents: number;
  currency: string;
  brand: string | null;
  description: string | null;
  shortDescription: string | null;
};
type ImageView = { id: string; url: string; altText: string | null };
type VariantView = { id: string; title: string; stockQuantity: number };
type ProductPageData = {
  product: ProductView;
  categoryName: string;
  images: ImageView[];
  variants: VariantView[];
  isPlaceholder: boolean;
};

const getProductPageData = cache(async (slug: string): Promise<ProductPageData | null> => {
  let product: ProductView | null = null;
  let categoryName = "Selection";
  let images: ImageView[] = [];
  let variants: VariantView[] = [];
  let isPlaceholder = false;

  try {
    const db = getDb();
    const result = await db
      .select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.status, "active")))
      .limit(1);
    if (result.length) {
      product = result[0].product;
      categoryName = result[0].categoryName ?? "Selection";
      [images, variants] = await Promise.all([
        db.select({ id: productImages.id, url: productImages.url, altText: productImages.altText })
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .orderBy(asc(productImages.sortOrder)),
        db.select({ id: productVariants.id, title: productVariants.title, stockQuantity: productVariants.stockQuantity })
          .from(productVariants)
          .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
          .orderBy(asc(productVariants.title)),
      ]);
    }
  } catch {
    // Le anteprime locali mantengono navigabile il catalogo durante indisponibilità del database.
  }

  if (!product) {
    const placeholder = findPlaceholderProduct(slug);
    if (!placeholder) return null;
    product = {
      id: placeholder.id,
      slug: placeholder.slug,
      sku: placeholder.sku,
      name: placeholder.name,
      basePriceCents: placeholder.price,
      currency: placeholder.currency,
      brand: placeholder.brand,
      description: placeholder.description,
      shortDescription: placeholder.shortDescription,
    };
    categoryName = placeholder.categoryName;
    images = [{ id: `${placeholder.id}-image`, url: placeholder.imageUrl, altText: placeholder.name }];
    variants = createPreviewVariants(placeholder);
    isPlaceholder = true;
  }

  return { product, categoryName, images, variants, isPlaceholder };
});

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductPageData(slug);
  if (!data) return { title: "Prodotto non disponibile", robots: { index: false, follow: false } };

  const { product, categoryName, images } = data;
  const brandPrefix = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())
    ? `${product.brand} `
    : "";
  const title = `${brandPrefix}${product.name}`;
  const rawDescription = product.shortDescription || product.description || `${title}: scopri dettagli, disponibilità e varianti nella selezione Lusso Concept Store.`;
  const description = rawDescription.replace(/\s+/g, " ").trim().slice(0, 160);
  const primaryImage = images[0];
  const requestHeaders = await headers();
  const incomingHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (incomingHost?.startsWith("localhost") ? "http" : "https");
  const requestSiteUrl = incomingHost ? `${protocol}://${incomingHost}` : siteUrl;
  const socialImage = primaryImage ? new URL(primaryImage.url, requestSiteUrl).toString() : null;

  return {
    title,
    description,
    alternates: { canonical: `/prodotto/${slug}` },
    keywords: [product.brand, categoryName, product.name, "Lusso Concept Store"].filter((value): value is string => Boolean(value)),
    openGraph: {
      type: "website",
      title,
      description,
      images: socialImage ? [{ url: socialImage, alt: primaryImage?.altText ?? title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImage ? [socialImage] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getProductPageData(slug);
  if (!data) notFound();
  const { product, categoryName, images, variants, isPlaceholder } = data;
  const placeholder = isPlaceholder ? findPlaceholderProduct(slug) : null;
  const categorySlug = catalogCategories.find((category) => category.name === categoryName)?.slug;
  const primaryImage = images[0];
  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const facts = placeholder ? getProductFacts(placeholder) : [
    { label: "Marca", value: product.brand ?? "Lusso selection" },
    { label: "Categoria", value: categoryName },
    { label: "Codice articolo", value: product.sku },
    { label: "Disponibilità", value: totalStock > 0 ? "Disponibile" : "Non disponibile" },
  ];
  const relatedProducts = placeholder
    ? placeholderProducts.filter((item) => item.categoryName === placeholder.categoryName && item.id !== placeholder.id).slice(0, 4)
    : [];
  const requestHeaders = await headers();
  const incomingHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (incomingHost?.startsWith("localhost") ? "http" : "https");
  const requestSiteUrl = incomingHost ? `${protocol}://${incomingHost}` : siteUrl;
  const productUrl = new URL(`/prodotto/${slug}`, requestSiteUrl).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand ?? "Lusso Concept Store" },
    image: images.map((image) => new URL(image.url, requestSiteUrl).toString()),
    url: productUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.basePriceCents / 100).toFixed(2),
      availability: `https://schema.org/${totalStock > 0 ? "InStock" : "OutOfStock"}`,
      url: productUrl,
    },
  };

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <div className="product-breadcrumb-bar">
          <Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span>
          <Link href={categorySlug ? `/shop?categoria=${categorySlug}` : "/shop"}>{categoryName}</Link>
        </div>
        <section className="commerce-main product-detail">
          <div className="product-gallery">
            {images.length ? images.map((image, index) => (
              <figure key={image.id}>
                <Image src={image.url} alt={image.altText ?? product.name} fill priority={index === 0} unoptimized sizes="(max-width: 900px) 100vw, 55vw" />
                <figcaption>{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</figcaption>
              </figure>
            )) : <div className="product-placeholder"><span>Lusso</span><small>Immagine in arrivo</small></div>}
            {images.length === 1 && primaryImage ? (
              <figure className="product-gallery-detail">
                <Image src={primaryImage.url} alt={`Dettaglio di ${product.name}`} fill unoptimized sizes="(max-width: 900px) 100vw, 55vw" />
                <figcaption>Dettaglio immagine</figcaption>
              </figure>
            ) : null}
          </div>
          <div className="product-info-column">
            <section className="product-info-panel">
              <div className="product-heading-row">
                <p className="commerce-kicker">{product.brand ?? categoryName}</p>
                <span>{totalStock > 0 ? "Disponibile" : "Esaurito"}</span>
              </div>
              <h1>{product.name}</h1>
              <p className="product-price">{formatProductPrice(product.basePriceCents, product.currency)} <small>IVA inclusa</small></p>
              <p className="product-copy">{product.shortDescription || product.description || "Una selezione contemporanea, scelta per la qualità dei materiali e il carattere delle forme."}</p>

              {product.basePriceCents > 0 && variants.length ? (
                <ProductPurchase
                  variants={variants}
                  categoryName={categoryName}
                  preview={isPlaceholder}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand ?? "Lusso selection",
                    imageUrl: primaryImage?.url ?? "",
                    priceCents: product.basePriceCents,
                    currency: product.currency,
                  }}
                />
              ) : (
                <div className="placeholder-purchase">
                  <span>{product.basePriceCents > 0 ? "Disponibilità in aggiornamento" : "Prezzo in aggiornamento"}</span>
                  <p>La scheda non è ancora completa e il prodotto non può essere aggiunto al carrello.</p>
                </div>
              )}

              <div className="product-services" aria-label="Servizi inclusi">
                <p><strong>Spedizione gratuita</strong><span>Consegna stimata in 7–12 giorni lavorativi</span></p>
                <p><strong>Reso entro 14 giorni</strong><span>Secondo le condizioni di vendita</span></p>
                <p><strong>Pagamento sicuro</strong><span>Checkout protetto con Stripe quando attivato</span></p>
              </div>
            </section>

            <div className="product-accordions">
              <details open>
                <summary>Descrizione <span>+</span></summary>
                <p>{product.description || product.shortDescription}</p>
              </details>
              <details>
                <summary>Dettagli prodotto <span>+</span></summary>
                <dl>{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
              </details>
              <details>
                <summary>Spedizioni e resi <span>+</span></summary>
                <p>Spedizione standard gratuita in Italia. Consegna stimata in 7–12 giorni lavorativi e diritto di recesso entro 14 giorni dalla consegna.</p>
                <Link href="/spedizioni-e-resi">Leggi tutte le condizioni →</Link>
              </details>
              <details>
                <summary>Verifica e trasparenza <span>+</span></summary>
                <p>Composizione, taglie, condizioni, provenienza e riferimenti definitivi saranno verificati sul prodotto prima di attivare la vendita.</p>
              </details>
            </div>
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="related-products" aria-labelledby="related-title">
            <div className="related-products-heading"><div><p className="commerce-kicker">Potrebbero piacerti</p><h2 id="related-title">Altri dalla selezione</h2></div><Link href={categorySlug ? `/shop?categoria=${categorySlug}` : "/shop"}>Vedi la categoria →</Link></div>
            <div className="related-products-grid">
              {relatedProducts.map((item) => (
                <article key={item.id}>
                  <Link href={`/prodotto/${item.slug}`}>
                    <div><Image src={item.imageUrl} alt={item.name} fill unoptimized sizes="(max-width: 680px) 50vw, 25vw" /></div>
                    <p>{item.brand}</p><h3>{item.name}</h3><span>{formatProductPrice(item.price, item.currency)}</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
      <StoreFooter />
    </div>
  );
}
