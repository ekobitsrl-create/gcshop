import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/accesso-admin", "/api/", "/shop", "/prodotto/", "/try-on", "/checkout", "/ordine/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
