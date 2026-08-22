import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { catalogCategories } from "@/lib/catalog";
import { placeholderProducts } from "@/lib/placeholder-products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...catalogCategories.map((category) => ({
      url: `${siteUrl}/shop?categoria=${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${siteUrl}/informazioni-societarie`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/contatti`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/spedizioni-e-resi`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/termini-e-condizioni`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cookie-policy`, changeFrequency: "yearly", priority: 0.2 },
    ...catalog.map((product) => ({
      url: `${siteUrl}/prodotto/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
