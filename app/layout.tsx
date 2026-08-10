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
  const socialImage = new URL("/og-v3.png", base).toString();

  return {
    metadataBase: base,
    title: {
      default: "Luxury Concept Store | Moda contemporanea selezionata",
      template: "%s | Luxury Concept Store",
    },
    description:
      "Luxury Concept Store: moda contemporanea e Virtual Try-On per provare il look sulla tua foto, direttamente nel browser.",
    applicationName: "Luxury Concept Store",
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: "Luxury Concept Store",
      title: "Luxury Concept Store | Virtual Try-On",
      description: "Provalo. Prima che diventi tuo. Scopri la nuova esperienza di prova virtuale.",
      url: base,
      images: [
        {
          url: socialImage,
          width: 1740,
          height: 900,
          alt: "Luxury Concept Store — Virtual Try-On",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Luxury Concept Store | Virtual Try-On",
      description: "Provalo. Prima che diventi tuo. La nuova prova virtuale di Luxury Concept Store.",
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
