import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#111210",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og-v2.png", base).toString();

  return {
    metadataBase: base,
    title: {
      default: "Luxury Concept Store | Moda contemporanea selezionata",
      template: "%s | Luxury Concept Store",
    },
    description:
      "Luxury Concept Store: moda e accessori selezionati in Italia. Nuovi arrivi, stile contemporaneo e dettagli senza tempo.",
    applicationName: "Luxury Concept Store",
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: "Luxury Concept Store",
      title: "Luxury Concept Store | Il lusso, nel tuo stile",
      description: "Una selezione indipendente di moda e accessori, curata in Italia.",
      url: base,
      images: [
        {
          url: socialImage,
          width: 1740,
          height: 900,
          alt: "Luxury Concept Store — Il lusso è un punto di vista",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Luxury Concept Store | Il lusso, nel tuo stile",
      description: "Moda contemporanea e accessori selezionati in Italia.",
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
