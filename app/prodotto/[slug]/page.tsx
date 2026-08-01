import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductPurchase } from "@/components/product-purchase";
import { formatMoney } from "@/lib/store-utils";
import "../../commerce.css";

export const dynamic = "force-dynamic";
export default async function ProductPage({ params }: { params: Promise<{ slug:string }> }) {
  const { slug }=await params; const db=getDb(); const result=await db.select({product:products,categoryName:categories.name}).from(products).leftJoin(categories,eq(products.categoryId,categories.id)).where(and(eq(products.slug,slug),eq(products.status,"active"))).limit(1); if(!result.length) notFound();
  const images=await db.select().from(productImages).where(eq(productImages.productId,result[0].product.id)).orderBy(asc(productImages.sortOrder));
  const variants=await db.select({id:productVariants.id,title:productVariants.title,stockQuantity:productVariants.stockQuantity}).from(productVariants).where(and(eq(productVariants.productId,result[0].product.id),eq(productVariants.isActive,true))).orderBy(asc(productVariants.title)); const p=result[0].product;
  return <div className="commerce-shell"><CommerceHeader/><main className="commerce-main product-detail"><div className="product-gallery">{images.length?images.map(i=><img key={i.id} src={i.url} alt={i.altText??p.name}/>):<div className="product-placeholder">LC</div>}</div><section className="product-info"><p className="commerce-kicker">{result[0].categoryName??"Luxury Concept Store"}</p><h1>{p.name}</h1><p className="product-price">{formatMoney(p.basePriceCents,p.currency)}</p><p className="product-copy">{p.description||p.shortDescription||"Una selezione contemporanea curata nei dettagli."}</p><ProductPurchase variants={variants}/></section></main></div>;
}
