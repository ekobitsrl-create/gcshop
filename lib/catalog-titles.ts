import type { Locale } from "@/lib/i18n";

// Editorial labels based on the supplier's category. Keep supplier names/SKUs
// and public slugs intact so imports, old links and orders remain compatible.
const labels = {
  jacket: { it: "Giacca", en: "Jacket", fr: "Veste", es: "Chaqueta", de: "Jacke" },
  belt: { it: "Cintura", en: "Belt", fr: "Ceinture", es: "Cinturón", de: "Gürtel" },
  dress: { it: "Abito", en: "Dress", fr: "Robe", es: "Vestido", de: "Kleid" },
  knit: { it: "Maglia", en: "Knitwear", fr: "Pull", es: "Jersey", de: "Pullover" },
  jeans: { it: "Jeans", en: "Jeans", fr: "Jean", es: "Vaqueros", de: "Jeans" },
};
const codeCategories: Record<string, keyof typeof labels> = {
  "5AM1101-2310-TAUPE": "jacket", "X2AM104-4169-TROOP": "jacket", "X2AM105-8225-TAUPE": "jacket",
  "X2AM922-8752-GUNMETAL": "jacket", "X2AM924-8506-BLACK": "jacket", "E35.119-999": "belt",
  "W5C9101_E2374-A966": "dress", "W5D0601_M4432-C74": "dress", "WK49000_T359A-0009": "jacket",
  "WK49000_T359A-0010": "jacket", "WK53701_T420A-Y57": "jacket",
};
const italianTitles: Record<string, string> = {
  "Beanie in cashmere": "Berretto in cashmere",
  "Long bomber down padding": "Bomber lungo imbottito in piuma",
  "Crewneck longsleeve cashmere": "Maglia girocollo a maniche lunghe in cashmere",
  "Sweatshirt polo collar": "Felpa con collo polo",
  "Lounge crew logo sweatshirt": "Felpa girocollo Lounge con logo",
  "Man shirt dobby poplin": "Camicia uomo in popeline dobby",
  "Cashmere shirt": "Camicia in cashmere", "Knit shirt": "Camicia in maglia", "Wool shirt": "Camicia in lana",
  "Cropped t-shirt": "T-shirt corta", "Sneakers low-top multicolor": "Sneakers basse multicolore",
  "Sneakers patent leather": "Sneakers in vernice", "Sneakers calf and mesh": "Sneakers in vitello e mesh",
  "Nylon red jacket": "Giacca rossa in nylon", "Maglia cashmere docevita": "Maglia dolcevita in cashmere",
};

export function catalogTitle(product: { name: string; slug: string; brand?: string | null }, locale: Locale): string {
  // Identify coded products by the stable slug too, since imported translations
  // may change the case of the supplier code.
  const code = Object.keys(codeCategories).find(value => product.slug.includes(value.toLowerCase().replace(/[_.]/g, "-")));
  if (code) return `${labels[codeCategories[code]][locale]} ${product.brand ?? ""} · ${code.split(/[-_]/)[0]}`.replace(/\s+/g, " ").trim();
  if (product.slug.includes("-new-collection-2022-")) {
    const category = product.slug.startsWith("aquascutum-") ? "jacket" : product.slug.startsWith("emilio-romanelli-") ? "knit" : product.slug.startsWith("yes-zee-") ? "jeans" : null;
    if (category) return `${labels[category][locale]} ${product.brand ?? ""}`.trim();
  }
  return locale === "it" ? italianTitles[product.name] ?? product.name : product.name;
}
