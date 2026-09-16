import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import { CartProvider } from "@/components/cart-provider";
import { ComparisonTray } from "@/components/comparison-controls";
import { localeTags, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { SITE_URL } from "@/lib/site-url.mjs";
import "./globals.css";
import "./cart.css";
import "./comparison.css";

export const viewport: Viewport = {
  themeColor: "#111210",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const base = new URL(SITE_URL);
  const socialImage = new URL("/og-lcs.png", base).toString();

  return {
    metadataBase: base,
    title: {
      default: "LCS | The Selected Edit",
      template: "%s | LCS",
    },
    description: translate(locale, "meta.description"),
    applicationName: "LCS",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    creator: "LCS",
    publisher: "LCS",
    category: "fashion",
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: localeTags[locale].replace("-", "_"),
      siteName: "LCS",
      title: "LCS | The Selected Edit",
      description: translate(locale, "meta.socialDescription"),
      url: base,
      images: [
        {
          url: socialImage,
          width: 1743,
          height: 902,
          alt: "LCS — The Selected Edit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "LCS | The Selected Edit",
      description: translate(locale, "meta.socialDescription"),
      images: [socialImage],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale}>
      <body><LocaleProvider locale={locale}><CartProvider>{children}<ComparisonTray /></CartProvider></LocaleProvider></body>
    </html>
  );
}
