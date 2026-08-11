import { and, asc, eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
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
  basePriceCents: number;
  currency: string;
  description: string | null;
  shortDescription: string | null;
};
type ImageView = { id: string; url: string; altText: string | null };
type VariantView = { id: string; title: string; stockQuantity: number };

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  let product: ProductView | null = null;
  let categoryName = "Selection";
  let images: ImageView[] = [];
  let variants: VariantView[] = [];
  let isPlaceholder = false;

  try {
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
    if (!placeholder) notFound();
    product = {
      id: placeholder.id,
      name: placeholder.name,
      basePriceCents: placeholder.price,
      currency: placeholder.currency,
      description: placeholder.description,
      shortDescription: placeholder.shortDescription,
    };
    categoryName = placeholder.categoryName;
    images = [{ id: `${placeholder.id}-image`, url: placeholder.imageUrl, altText: placeholder.name }];
    isPlaceholder = true;
  }

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
          )) : <div className="product-placeholder"><span>LCS</span><small>Image coming soon</small></div>}
        </div>
        <section className="product-info-panel">
          <div className="product-breadcrumb"><a href="/shop">Shop</a><span>/</span><span>{categoryName}</span></div>
          <p className="commerce-kicker">{categoryName}</p>
          <h1>{product.name}</h1>
          <p className="product-price">{formatMoney(product.basePriceCents, product.currency)}</p>
          <p className="product-copy">{product.description || product.shortDescription || "Una selezione contemporanea, scelta per la qualità dei materiali e il carattere delle forme."}</p>
          {isPlaceholder ? (
            <div className="placeholder-purchase"><span>Anteprima catalogo</span><p>Questo articolo dimostrativo sarà acquistabile appena il catalogo definitivo verrà pubblicato.</p></div>
          ) : <ProductPurchase variants={variants} />}
          <a className="product-tryon-cta" href={`/try-on?prodotto=${slug}`}>
            <span><small>Innovation preview / In sviluppo</small><strong>Scopri il Try-On AR</strong></span>
            <b>↗</b>
          </a>
          <div className="product-services">
            <p><span>01</span>Spedizione gratuita</p>
            <p><span>02</span>Reso entro 14 giorni</p>
            <p><span>03</span>Assistenza dedicata</p>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
