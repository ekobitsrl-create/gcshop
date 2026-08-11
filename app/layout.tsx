import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lcs-edit.vercel.app";

export const viewport: Viewport = {
  themeColor: "#111210",
  colorScheme: "light",
};

export function generateMetadata(): Metadata {
  const base = new URL(siteUrl);
  const socialImage = new URL("/og-lcs.png", base).toString();

  return {
    metadataBase: base,
    title: {
      default: "LCS | The Selected Edit",
      template: "%s | LCS",
    },
    description:
      "Moda contemporanea e accessori selezionati per materia, proporzione e carattere. The Selected Edit by LCS.",
    applicationName: "LCS",
    creator: "LCS",
    publisher: "LCS",
    category: "fashion",
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: "LCS",
      title: "LCS | The Selected Edit",
      description: "Fashion, edited by instinct. Moda e accessori selezionati da LCS.",
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
      description: "Fashion, edited by instinct. Moda e accessori selezionati da LCS.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
