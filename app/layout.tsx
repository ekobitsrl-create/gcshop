import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { CookieNotice } from "@/components/cookie-notice";
import "./globals.css";

const fallbackSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#181714",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const incomingHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (incomingHost?.startsWith("localhost") ? "http" : "https");
  const base = new URL(incomingHost ? `${protocol}://${incomingHost}` : fallbackSiteUrl);
  const socialImage = new URL("/og.png", base).toString();

  return {
    metadataBase: base,
    title: {
      default: "Lusso Concept Store | Abbigliamento e accessori",
      template: "%s | Lusso Concept Store",
    },
    description:
      "Abbigliamento e accessori firmati, selezionati e presentati con informazioni semplici e chiare.",
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
      title: "Lusso Concept Store | Nuovi arrivi",
      description: "Scopri abbigliamento e accessori firmati selezionati da Lusso Concept Store.",
      url: base,
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: "Lusso Concept Store — Nuovi arrivi",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Lusso Concept Store | Nuovi arrivi",
      description: "Scopri abbigliamento e accessori firmati selezionati da Lusso Concept Store.",
      images: [socialImage],
    },
  };
}

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
