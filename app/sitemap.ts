import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lussoconcept.store";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/informazioni-societarie`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/contatti`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/spedizioni-e-resi`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/termini-e-condizioni`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cookie-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
