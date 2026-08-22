import type { PlaceholderProduct } from "./placeholder-products";

export type DisplayVariant = { id: string; title: string; stockQuantity: number };

const colorsBySlug: Record<string, string> = {
  "dior-t-shirt-christian-dior-couture": "Bianco / nero",
  "gucci-cintura-interlocking-g-in-pelle-avorio": "Avorio / argento",
  "dior-cardigan-reversibile-cappuccio-oblique": "Grigio",
  "dior-jeans-cargo-twill-cotone-blu": "Blu denim",
  "gucci-camicia-bowling-seta-jacquard-gg-nera": "Nero",
  "gucci-camicia-bowling-canvas-gg-beige": "Beige / blu",
  "gucci-t-shirt-jersey-ricamo-logo": "Bianco / nero",
  "balenciaga-t-shirt-logo-distorto-nera": "Nero / grigio",
  "balenciaga-loop-sports-icon-track-pants": "Blu / nero / bianco",
  "balenciaga-flipped-uni-felpa-zip-nera": "Nero",
  "balenciaga-soccer-tracksuit-jacket-nera": "Nero / bianco / oro",
  "burberry-polo-icon-stripe": "Bianco / nero / beige / rosso",
  "burberry-giacca-cappuccio-vintage-check": "Beige / nero / rosso",
  "burberry-cintura-reversibile-pelle-fibbia-tb": "Nero / oro",
  "prada-camicia-giacca-re-nylon-nera": "Nero",
  "prada-cintura-saffiano-fibbia-triangolare": "Nero / argento",
  "prada-giacca-re-nylon-cappuccio-nera": "Nero",
  "prada-jeans-gamba-ampia-effetto-vernice": "Blu denim / bianco",
  "prada-cintura-pelle-fibbia-ovale-incisa": "Nero / argento",
};

function variantTitles(categoryName: PlaceholderProduct["categoryName"]) {
  if (categoryName === "Cinture") return ["80 cm", "85 cm", "90 cm", "95 cm", "100 cm"];
  if (categoryName === "Pantaloni") return ["44", "46", "48", "50", "52"];
  return ["S", "M", "L", "XL"];
}

export function createPreviewVariants(product: PlaceholderProduct): DisplayVariant[] {
  return variantTitles(product.categoryName).map((title, index) => ({
    id: `${product.id}-${index + 1}`,
    title,
    stockQuantity: 10,
  }));
}

export function getProductFacts(product: PlaceholderProduct) {
  return [
    { label: "Marca", value: product.brand },
    { label: "Categoria", value: product.categoryName },
    { label: "Codice articolo", value: product.sku },
    { label: "Colori", value: colorsBySlug[product.slug] ?? "Come da immagine" },
    { label: "Composizione", value: "Da confermare sull’etichetta del prodotto" },
    { label: "Stato scheda", value: "Anteprima · disponibilità da confermare" },
  ];
}
