import type { Metadata, Viewport } from "next";
import { CookieNotice } from "@/components/cookie-notice";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lussoconcept.store";

export const viewport: Viewport = {
  themeColor: "#181714",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lusso Concept Store | Selezione privata",
    template: "%s | Lusso Concept Store",
  },
  description: "Ricerca, cura e assistenza diretta per una selezione privata seguita personalmente.",
  applicationName: "Lusso Concept Store",
  creator: "Lusso Concept Store",
  publisher: "Lusso Concept Store",
  category: "fashion",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Lusso Concept Store",
    title: "Lusso Concept Store | Selezione privata",
    description: "Ricerca, cura e assistenza diretta per una selezione privata.",
    url: siteUrl,
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Lusso Concept Store — Selezione privata",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lusso Concept Store | Selezione privata",
    description: "Ricerca, cura e assistenza diretta per una selezione privata.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
