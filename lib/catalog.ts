export const catalogCategories = [
  {
    id: "11000000-0000-4000-8000-000000000001",
    name: "T-shirt",
    slug: "t-shirt",
    description: "T-shirt e maglie leggere.",
  },
  {
    id: "11000000-0000-4000-8000-000000000002",
    name: "Cinture",
    slug: "cinture",
    description: "Cinture e accessori da vita.",
  },
  {
    id: "11000000-0000-4000-8000-000000000003",
    name: "Felpe e cardigan",
    slug: "felpe-e-cardigan",
    description: "Felpe, cardigan e capi con zip.",
  },
  {
    id: "11000000-0000-4000-8000-000000000004",
    name: "Pantaloni",
    slug: "pantaloni",
    description: "Jeans, pantaloni cargo e modelli sportivi.",
  },
  {
    id: "11000000-0000-4000-8000-000000000005",
    name: "Camicie e polo",
    slug: "camicie-e-polo",
    description: "Camicie a maniche corte e polo.",
  },
  {
    id: "11000000-0000-4000-8000-000000000006",
    name: "Giacche",
    slug: "giacche",
    description: "Giacche leggere, tecniche e con cappuccio.",
  },
] as const;

export type CatalogCategoryName = (typeof catalogCategories)[number]["name"];
export type CatalogBrand = "Dior" | "Gucci" | "Balenciaga" | "Burberry" | "Prada";
