import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import { localeTags, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lcsedit.vercel.app";

export const viewport: Viewport = {
  themeColor: "#111210",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const base = new URL(siteUrl);
  const socialImage = new URL("/og-lcs.png", base).toString();

  return {
    metadataBase: base,
    title: {
      default: "LCS | The Selected Edit",
      template: "%s | LCS",
    },
    description: translate(locale, "meta.description"),
    applicationName: "LCS",
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
      <body><LocaleProvider locale={locale}>{children}</LocaleProvider></body>
    </html>
  );
}
