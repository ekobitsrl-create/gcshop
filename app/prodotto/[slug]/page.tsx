import { and, asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductPurchase } from "@/components/product-purchase";
import { StoreFooter } from "@/components/store-footer";
import { findPlaceholderProduct } from "@/lib/placeholder-products";
import { formatMoney } from "@/lib/store-utils";
import "../../commerce.css";

export const dynamic = "force-dynamic";

type ProductView = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePriceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  brand: string | null;
  gender: string;
  description: string | null;
  shortDescription: string | null;
  originCountry: string | null;
  weightGrams: number | null;
  metadataJson: string | null;
};
type ImageView = { id: string; url: string; altText: string | null };
type VariantView = { id: string; title: string; size: string | null; color: string | null; priceCents: number | null; compareAtPriceCents: number | null; stockQuantity: number };
type Attributes = { brand?: string; category?: string; subcategory?: string; gender?: string; color?: string | null; composition?: string | null; season?: string | null; model?: string | null; promo?: string | null };
type ProductPageData = { product: ProductView; categoryName: string; images: ImageView[]; variants: VariantView[]; attributes: Attributes; isPlaceholder: boolean };

function attributesFrom(value: string | null): Attributes {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as { attributes?: Attributes };
    return parsed.attributes ?? {};
  } catch {
    return {};
  }
}

const getProductPageData = cache(async (slug: string): Promise<ProductPageData | null> => {
  const db = getDb();
  let product: ProductView | null = null;
  let categoryName = "Selection";
  let images: ImageView[] = [];
  let variants: VariantView[] = [];
  let isPlaceholder = false;

  try {
    const result = await db.select({ product: products, categoryName: categories.name })
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
        db.select({
          id: productVariants.id,
          title: productVariants.title,
          size: productVariants.size,
          color: productVariants.color,
          priceCents: productVariants.priceCents,
          compareAtPriceCents: productVariants.compareAtPriceCents,
          stockQuantity: productVariants.stockQuantity,
        }).from(productVariants)
          .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
          .orderBy(asc(productVariants.title)),
      ]);
    }
  } catch {
    // Le anteprime locali restano navigabili durante una sospensione temporanea del database.
  }

  if (!product) {
    const placeholder = findPlaceholderProduct(slug);
    if (!placeholder) return null;
    product = {
      id: placeholder.id,
      name: placeholder.name,
      slug: placeholder.slug,
      sku: placeholder.sku,
      basePriceCents: placeholder.price,
      compareAtPriceCents: null,
      currency: placeholder.currency,
      brand: null,
      gender: "unisex",
      description: placeholder.description,
      shortDescription: placeholder.shortDescription,
      originCountry: null,
      weightGrams: null,
      metadataJson: null,
    };
    categoryName = placeholder.categoryName;
    images = [{ id: `${placeholder.id}-image`, url: placeholder.imageUrl, altText: placeholder.name }];
    isPlaceholder = true;
  }

  return { product, categoryName, images, variants, attributes: attributesFrom(product.metadataJson), isPlaceholder };
});

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductPageData(slug);
  if (!data) return { title: "Prodotto non disponibile", robots: { index: false, follow: false } };
  const { product, categoryName, images } = data;
  const brandPrefix = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) ? `${product.brand} ` : "";
  const title = `${brandPrefix}${product.name}`;
  const rawDescription = product.shortDescription || product.description || `${title}: dettagli, disponibilità e varianti nella selezione LCS.`;
  const description = rawDescription.replace(/\s+/g, " ").trim().slice(0, 160);
  const primaryImage = images[0];
  return {
    title,
    description,
    alternates: { canonical: `/prodotto/${slug}` },
    keywords: [product.brand, categoryName, product.name, "LCS"].filter((value): value is string => Boolean(value)),
    openGraph: { type: "website", title, description, images: primaryImage ? [{ url: primaryImage.url, alt: primaryImage.altText ?? title }] : undefined },
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await getProductPageData(slug);
  if (!data) notFound();
  const { product, categoryName, images, variants, attributes, isPlaceholder } = data;
  const requestedVariantId = Array.isArray(query.variant) ? query.variant[0] : query.variant;
  const requestedVariant = variants.find((variant) => variant.id === requestedVariantId);
  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const detailRows = [
    ["Composizione", attributes.composition],
    ["Colore", attributes.color || variants.find((variant) => variant.color)?.color],
    ["Stagione", attributes.season],
    ["Made in", product.originCountry],
    ["Codice", product.sku],
    ["Peso", product.weightGrams ? `${(product.weightGrams / 1000).toLocaleString("it-IT")} kg` : null],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: requestedVariant ? `${product.sku}-${requestedVariant.title}` : product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    description: product.shortDescription || product.description,
    image: images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: ((requestedVariant?.priceCents ?? product.basePriceCents) / 100).toFixed(2),
      availability: (requestedVariant ? requestedVariant.stockQuantity : totalStock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://lcsedit.vercel.app/prodotto/${product.slug}${requestedVariant ? `?variant=${requestedVariant.id}` : ""}`,
    },
  };

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <main>
        <div className="commerce-main product-detail">
          <div className="product-gallery">
            {images.length ? images.map((image, index) => (
              <figure className={index === 0 ? "is-primary" : ""} key={image.id}>
                <Image src={image.url} alt={image.altText ?? product.name} fill unoptimized priority={index === 0} sizes="(max-width: 760px) 100vw, 38vw" />
                <figcaption>{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</figcaption>
              </figure>
            )) : <div className="product-placeholder"><span>LCS</span><small>Image coming soon</small></div>}
          </div>
          <section className="product-info-panel">
            <div className="product-breadcrumb"><a href="/shop">Shop</a><span>/</span><span>{attributes.gender || product.gender}</span><span>/</span><span>{categoryName}</span></div>
            <p className="product-brand">{product.brand ?? "LCS Selection"}</p>
            <h1>{product.name}</h1>
            <p className="product-reference">{categoryName} · Ref. {product.sku}</p>
            <p className="product-copy">{product.description || product.shortDescription || "Una selezione contemporanea, scelta per la qualità dei materiali e il carattere delle forme."}</p>
            {isPlaceholder ? (
              <div className="placeholder-purchase"><span>Anteprima catalogo</span><p>Questo articolo dimostrativo sarà acquistabile appena il catalogo definitivo verrà pubblicato.</p><strong>{formatMoney(product.basePriceCents, product.currency)}</strong></div>
            ) : <ProductPurchase variants={variants} defaultVariantId={requestedVariant?.id} basePriceCents={product.basePriceCents} compareAtPriceCents={product.compareAtPriceCents} currency={product.currency} />}
            <div className="product-details-list" id="product-details">
              <details open><summary>Dettagli prodotto <span>+</span></summary><dl>{detailRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
              <details><summary>Spedizioni e resi <span>+</span></summary><p>Spedizione gratuita. Puoi richiedere il reso entro 14 giorni dalla consegna, nel rispetto delle condizioni di vendita.</p></details>
              <details><summary>Autenticità <span>+</span></summary><p>Ogni articolo proviene da canali distributivi professionali ed è accompagnato dai controlli previsti prima della spedizione.</p></details>
            </div>
          </section>
        </div>
        <section className="product-trust-panel">
          <p>Provenienza e autenticità</p>
          <h2>Scelto con cura.<br /><em>Verificato prima di arrivare a te.</em></h2>
          <div><span>01</span><p>Canali distributivi professionali</p><span>02</span><p>Controllo articolo e confezione</p><span>03</span><p>Assistenza prima e dopo l’acquisto</p></div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
