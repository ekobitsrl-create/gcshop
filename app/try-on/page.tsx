import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Pagina non disponibile",
  robots: { index: false, follow: false },
};

export default function TryOnPage(): never {
  notFound();
}
