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
import { findPlaceholderProduct } from "@/lib/placeholder-products";
import { formatProductPrice } from "@/lib/store-utils";
import "../../commerce.css";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type ProductView = {
  id: string;
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
      name: placeholder.name,
      basePriceCents: placeholder.price,
      currency: placeholder.currency,
      brand: placeholder.brand,
      description: placeholder.description,
      shortDescription: placeholder.shortDescription,
    };
    categoryName = placeholder.categoryName;
    images = [{ id: `${placeholder.id}-image`, url: placeholder.imageUrl, altText: placeholder.name }];
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

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="commerce-main product-detail">
        <div className="product-gallery">
          {images.length ? images.map((image, index) => (
            <figure key={image.id}>
              <Image src={image.url} alt={image.altText ?? product.name} fill unoptimized sizes="(max-width: 760px) 100vw, 38vw" />
              <figcaption>{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</figcaption>
            </figure>
          )) : <div className="product-placeholder"><span>Lusso</span><small>Immagine in arrivo</small></div>}
        </div>
        <section className="product-info-panel">
          <div className="product-breadcrumb"><Link href="/shop">Shop</Link><span>/</span><span>{categoryName}</span></div>
          <p className="commerce-kicker">{categoryName}</p>
          <h1>{product.name}</h1>
          <p className="product-price">{formatProductPrice(product.basePriceCents, product.currency)}</p>
          <p className="product-copy">{product.description || product.shortDescription || "Una selezione contemporanea, scelta per la qualità dei materiali e il carattere delle forme."}</p>
          {product.basePriceCents > 0 && !isPlaceholder ? <ProductPurchase variants={variants} /> : (
            <div className="placeholder-purchase">
              <span>{product.basePriceCents > 0 ? "Disponibilità in aggiornamento" : "Prezzo in aggiornamento"}</span>
              <p>{product.basePriceCents > 0 ? "Il prezzo è definito. Stiamo completando taglie e disponibilità prima di rendere acquistabile il prodotto." : "Stiamo completando prezzo, taglie e disponibilità. Il prodotto non può essere aggiunto alla borsa finché la scheda non sarà completa."}</p>
            </div>
          )}
          <div className="product-services">
            <p>Consegna in Italia in 7–12 giorni lavorativi</p>
            <p>Dettagli verificati prima della vendita</p>
            <p>Assistenza dedicata</p>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
