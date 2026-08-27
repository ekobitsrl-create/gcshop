import { and, asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { categories, productImages, products, productTranslations, productVariants } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductPurchase } from "@/components/product-purchase";
import { StoreFooter } from "@/components/store-footer";
import { findPlaceholderProduct } from "@/lib/placeholder-products";
import { formatMoney } from "@/lib/store-utils";
import { localeTags, translate, translateCatalogFallback, type Locale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
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
type TranslationView = { name: string; shortDescription: string | null; description: string | null; color: string | null; composition: string | null; category: string | null; subcategory: string | null; season: string | null };
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

const getProductPageData = cache(async (slug: string, locale: Locale): Promise<ProductPageData | null> => {
  const db = getDb();
  let product: ProductView | null = null;
  let categoryName = "Selection";
  let images: ImageView[] = [];
  let variants: VariantView[] = [];
  let isPlaceholder = false;
  let translation: TranslationView | null = null;

  try {
    const result = await db.select({ product: products, categoryName: categories.name, translation: productTranslations })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
      .where(and(eq(products.slug, slug), eq(products.status, "active")))
      .limit(1);
    if (result.length) {
      translation = result[0].translation;
      product = {
        ...result[0].product,
        name: translation?.name ?? result[0].product.name,
        shortDescription: translation?.shortDescription ?? result[0].product.shortDescription,
        description: translation?.description ?? result[0].product.description,
      };
      categoryName = translation?.subcategory ?? translation?.category ?? result[0].categoryName ?? "Selection";
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
    product.name = translateCatalogFallback(locale, product.name) ?? product.name;
    categoryName = translateCatalogFallback(locale, placeholder.categoryName) ?? placeholder.categoryName;
    images = [{ id: `${placeholder.id}-image`, url: placeholder.imageUrl, altText: placeholder.name }];
    isPlaceholder = true;
  }

  const attributes = attributesFrom(product.metadataJson);
  if (translation) {
    attributes.color = translation.color ?? attributes.color;
    attributes.composition = translation.composition ?? attributes.composition;
    attributes.category = translation.category ?? attributes.category;
    attributes.subcategory = translation.subcategory ?? attributes.subcategory;
    attributes.season = translation.season ?? attributes.season;
  }
  variants = variants.map((variant) => ({
    ...variant,
    color: translation?.color ?? translateCatalogFallback(locale, variant.color),
  }));
  return { product, categoryName, images, variants, attributes, isPlaceholder };
});

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const data = await getProductPageData(slug, locale);
  if (!data) return { title: translate(locale, "product.unavailableTitle"), robots: { index: false, follow: false } };
  const { product, categoryName, images } = data;
  const brandPrefix = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) ? `${product.brand} ` : "";
  const title = `${brandPrefix}${product.name}`;
  const rawDescription = product.shortDescription || product.description || translate(locale, "product.metaFallback", { title });
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
  const locale = await getRequestLocale();
  const localeTag = localeTags[locale];
  const t = (key: string, values?: Record<string, string | number>) => translate(locale, key, values);
  const data = await getProductPageData(slug, locale);
  if (!data) notFound();
  const { product, categoryName, images, variants, attributes, isPlaceholder } = data;
  const requestedVariantId = Array.isArray(query.variant) ? query.variant[0] : query.variant;
  const requestedVariant = variants.find((variant) => variant.id === requestedVariantId);
  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const detailRows = [
    [t("product.composition"), attributes.composition],
    [t("product.color"), attributes.color || variants.find((variant) => variant.color)?.color],
    [t("product.season"), attributes.season],
    [t("product.madeIn"), product.originCountry],
    [t("product.code"), product.sku],
    [t("product.weight"), product.weightGrams ? `${(product.weightGrams / 1000).toLocaleString(localeTag)} kg` : null],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    inLanguage: localeTag,
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
                <Image src={image.url} alt={product.name} fill unoptimized priority={index === 0} sizes="(max-width: 760px) 100vw, 38vw" />
                <figcaption>{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</figcaption>
              </figure>
            )) : <div className="product-placeholder"><span>LCS</span><small>{t("product.imageSoon")}</small></div>}
          </div>
          <section className="product-info-panel">
            <div className="product-breadcrumb"><a href="/shop">{t("common.shop")}</a><span>/</span><span>{product.gender === "donna" ? t("common.woman") : product.gender === "uomo" ? t("common.man") : attributes.gender || product.gender}</span><span>/</span><span>{categoryName}</span></div>
            <p className="product-brand">{product.brand ?? "LCS Selection"}</p>
            <h1>{product.name}</h1>
            <p className="product-reference">{categoryName} · {t("product.ref")} {product.sku}</p>
            <p className="product-copy">{product.description || product.shortDescription || t("product.copyFallback")}</p>
            {isPlaceholder ? (
              <div className="placeholder-purchase"><span>{t("product.preview")}</span><p>{t("product.previewCopy")}</p><strong>{formatMoney(product.basePriceCents, product.currency, localeTag)}</strong></div>
            ) : <ProductPurchase variants={variants} defaultVariantId={requestedVariant?.id} basePriceCents={product.basePriceCents} compareAtPriceCents={product.compareAtPriceCents} currency={product.currency} />}
            <div className="product-details-list" id="product-details">
              <details open><summary>{t("product.details")} <span>+</span></summary><dl>{detailRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
              <details><summary>{t("product.shippingReturns")} <span>+</span></summary><p>{t("product.shippingCopy")}</p></details>
              <details><summary>{t("product.authenticity")} <span>+</span></summary><p>{t("product.authenticityCopy")}</p></details>
            </div>
          </section>
        </div>
        <section className="product-trust-panel">
          <p>{t("home.originAuthenticity")}</p>
          <h2>{t("product.trustTitle")}<br /><em>{t("product.trustEmphasis")}</em></h2>
          <div><span>01</span><p>{t("product.trustOne")}</p><span>02</span><p>{t("product.trustTwo")}</p><span>03</span><p>{t("product.trustThree")}</p></div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
