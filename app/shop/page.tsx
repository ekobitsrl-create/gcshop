import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { productImages, products } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { formatMoney } from "@/lib/store-utils";
import "../commerce.css";

export const dynamic = "force-dynamic";
export default async function ShopPage() {
  const db = getDb();
  const baseRows = await db.select({ id:products.id,name:products.name,slug:products.slug,price:products.basePriceCents,currency:products.currency }).from(products).where(eq(products.status,"active")).orderBy(asc(products.name));
  const rows = await Promise.all(baseRows.map(async (product) => ({ ...product, imageUrl: (await db.select({ url: productImages.url }).from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)).limit(1))[0]?.url ?? null })));
  return <div className="commerce-shell"><CommerceHeader/><main className="commerce-main"><p className="commerce-kicker">La selezione</p><h1 className="commerce-title">Shop</h1>{rows.length?<div className="product-grid">{rows.map((p)=><a className="product-card" href={`/prodotto/${p.slug}`} key={p.id}><div className="product-card-media">{p.imageUrl?<img src={p.imageUrl} alt={p.name}/>:<span>LC</span>}</div><h2>{p.name}</h2><p>{formatMoney(p.price,p.currency)}</p></a>)}</div>:<div className="commerce-empty"><span className="commerce-kicker">Catalogo pronto</span><h2>Nessun prodotto pubblicato.</h2><p>Il nuovo database è vuoto. I prodotti aggiunti dal pannello admin compariranno qui.</p><a href="/admin/prodotti">Apri il pannello admin →</a></div>}</main></div>;
}
