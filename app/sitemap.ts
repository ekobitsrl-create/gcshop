import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { placeholderProducts } from "@/lib/placeholder-products";
import { SITE_URL } from "@/lib/site-url.mjs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let catalog: Array<{ slug: string; updatedAt?: string }> = [];

  try {
    catalog = await getDb()
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.status, "active"));
  } catch {
    // Il catalogo dimostrativo mantiene completa la sitemap anche senza database.
  }

  if (!catalog.length) catalog = placeholderProducts.map(({ slug }) => ({ slug }));

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/shop?categoria=donna`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/shop?categoria=uomo`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/shop?categoria=accessori`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/informazioni-societarie`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/spedizioni-e-resi`, changeFrequency: "yearly", priority: 0.4 },
    ...["privacy", "cookie", "termini", "pagamenti", "guida-taglie"].map(path => ({ url: `${SITE_URL}/${path}`, changeFrequency: "yearly" as const, priority: 0.2 })),
    ...catalog.map((product) => ({
      url: `${SITE_URL}/prodotto/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
