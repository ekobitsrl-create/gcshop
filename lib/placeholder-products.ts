export type PlaceholderProduct = {
  id: string;
  categoryName: "Donna" | "Uomo" | "Accessori";
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  currency: "EUR";
  imageUrl: string;
  shortDescription: string;
  description: string;
};

const categoryIds = {
  Donna: "10000000-0000-4000-8000-000000000001",
  Uomo: "10000000-0000-4000-8000-000000000002",
  Accessori: "10000000-0000-4000-8000-000000000003",
} as const;

export const placeholderProducts: PlaceholderProduct[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    categoryName: "Donna",
    categoryId: categoryIds.Donna,
    name: "Blazer Seta Notturna",
    slug: "blazer-seta-notturna",
    sku: "LCS-DON-001",
    price: 14900,
    currency: "EUR",
    imageUrl: "/images/category-woman.jpg",
    shortDescription: "Blazer fluido dalla costruzione essenziale.",
    description: "Una silhouette precisa e leggera, pensata per accompagnare il movimento. Finiture pulite, spalla definita e proporzioni contemporanee.",
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    categoryName: "Donna",
    categoryId: categoryIds.Donna,
    name: "Abito Sculpted Bordeaux",
    slug: "abito-sculpted-bordeaux",
    sku: "LCS-DON-002",
    price: 18900,
    currency: "EUR",
    imageUrl: "/images/product-2.jpg",
    shortDescription: "Abito midi dalle linee scultoree.",
    description: "Volumi calibrati e tono bordeaux profondo. Un abito dalla presenza netta, costruito per essere indossato con naturalezza.",
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    categoryName: "Uomo",
    categoryId: categoryIds.Uomo,
    name: "Overshirt Lana Grafite",
    slug: "overshirt-lana-grafite",
    sku: "LCS-UOM-001",
    price: 15900,
    currency: "EUR",
    imageUrl: "/images/category-man.jpg",
    shortDescription: "La giacca quotidiana in lana compatta.",
    description: "Taglio rilassato, superficie materica e costruzione essenziale. Una sovraccamicia pensata per attraversare le stagioni.",
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    categoryName: "Uomo",
    categoryId: categoryIds.Uomo,
    name: "Pantalone Sartoriale Sabbia",
    slug: "pantalone-sartoriale-sabbia",
    sku: "LCS-UOM-002",
    price: 11900,
    currency: "EUR",
    imageUrl: "/images/product-3.jpg",
    shortDescription: "Pantalone ampio, costruzione sartoriale.",
    description: "Vita pulita, gamba morbida e una tonalità sabbia facile da combinare. La sartorialità interpretata senza rigidità.",
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    categoryName: "Accessori",
    categoryId: categoryIds.Accessori,
    name: "Borsa Atelier 01",
    slug: "borsa-atelier-01",
    sku: "LCS-ACC-001",
    price: 17900,
    currency: "EUR",
    imageUrl: "/images/category-accessories.jpg",
    shortDescription: "Borsa strutturata dalle proporzioni compatte.",
    description: "Geometrie nette, manico corto e dettagli ridotti all’essenziale. Un oggetto quotidiano con carattere da collezione.",
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    categoryName: "Accessori",
    categoryId: categoryIds.Accessori,
    name: "Frame 02",
    slug: "occhiali-frame-02",
    sku: "LCS-ACC-002",
    price: 9900,
    currency: "EUR",
    imageUrl: "/images/product-4.jpg",
    shortDescription: "Occhiale deciso dalla montatura grafica.",
    description: "Una montatura dal profilo deciso e dalle proporzioni misurate, costruita per definire il volto senza sovrastarlo.",
  },
];

export function findPlaceholderProduct(slug: string) {
  return placeholderProducts.find((product) => product.slug === slug);
}
