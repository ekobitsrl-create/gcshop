import { and, asc, eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductPurchase } from "@/components/product-purchase";
import { StoreFooter } from "@/components/store-footer";
import { formatMoney } from "@/lib/store-utils";
import "../../commerce.css";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const result = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .limit(1);
  if (!result.length) notFound();

  const product = result[0].product;
  const [images, variants] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db
      .select({ id: productVariants.id, title: productVariants.title, stockQuantity: productVariants.stockQuantity })
      .from(productVariants)
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
      .orderBy(asc(productVariants.title)),
  ]);

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
          <div className="product-breadcrumb"><a href="/shop">Shop</a><span>/</span><span>{result[0].categoryName ?? "Selection"}</span></div>
          <p className="commerce-kicker">{result[0].categoryName ?? "Luxury Concept Store"}</p>
          <h1>{product.name}</h1>
          <p className="product-price">{formatMoney(product.basePriceCents, product.currency)}</p>
          <p className="product-copy">{product.description || product.shortDescription || "Una selezione contemporanea, scelta per la qualità dei materiali e il carattere delle forme."}</p>
          <ProductPurchase variants={variants} />
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
