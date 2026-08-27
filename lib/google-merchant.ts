const DEFAULT_SITE_URL = "https://lcsedit.vercel.app";

export type GoogleMerchantFeedRow = {
  productId: string;
  productName: string;
  slug: string;
  productSku: string;
  description: string | null;
  shortDescription: string | null;
  brand: string | null;
  gender: string;
  currency: string;
  basePriceCents: number;
  productCompareAtPriceCents: number | null;
  catalogSource: string;
  originCountry: string | null;
  productWeightGrams: number | null;
  metadataJson: string | null;
  categoryName: string | null;
  variantId: string;
  variantSku: string;
  variantTitle: string;
  color: string | null;
  size: string | null;
  variantPriceCents: number | null;
  variantCompareAtPriceCents: number | null;
  stockQuantity: number;
  backorder: boolean;
  supplierCode: string | null;
  barcode: string | null;
  variantWeightGrams: number | null;
  variantCount: number;
  imageUrls: string[];
};

type CatalogAttributes = {
  brand?: string;
  category?: string;
  subcategory?: string;
  gender?: string;
  color?: string | null;
  composition?: string | null;
  season?: string | null;
  model?: string | null;
};

function compactText(value: string | null | undefined, maxLength: number) {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function escapeXml(value: string | number | boolean) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlElement(name: string, value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return `<${name}>${escapeXml(value)}</${name}>`;
}

function parseAttributes(metadataJson: string | null): CatalogAttributes {
  if (!metadataJson) return {};
  try {
    const parsed = JSON.parse(metadataJson) as { attributes?: CatalogAttributes };
    return parsed.attributes ?? {};
  } catch {
    return {};
  }
}

function validWebUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeGtin(value: string | null | undefined) {
  if (!value || !/^[\d\s-]+$/.test(value)) return null;
  const digits = value.replace(/[\s-]/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return null;

  const body = digits.slice(0, -1);
  const expectedCheckDigit = Number(digits.at(-1));
  let sum = 0;
  for (let index = body.length - 1, position = 0; index >= 0; index -= 1, position += 1) {
    sum += Number(body[index]) * (position % 2 === 0 ? 3 : 1);
  }
  const actualCheckDigit = (10 - (sum % 10)) % 10;
  return actualCheckDigit === expectedCheckDigit ? digits : null;
}

function googleGender(value: string | null | undefined) {
  const normalized = (value ?? "").toLocaleLowerCase("it-IT");
  if (/donna|woman|women|female|femmina/.test(normalized)) return "female";
  if (/uomo|man|men|male|maschio/.test(normalized)) return "male";
  return "unisex";
}

function googleAgeGroup(value: string | null | undefined) {
  return /junior|kid|kids|bambin|baby|infant/i.test(value ?? "") ? "kids" : "adult";
}

function googleProductCategory(category?: string | null, subcategory?: string | null) {
  const value = `${category ?? ""} ${subcategory ?? ""}`.toLocaleLowerCase("it-IT");

  if (/sneaker|stival|sandali|ciabatt|décolleté|decollete|mocassin|pantofol|scarpe/.test(value)) return "187";
  if (/portafogli/.test(value)) return "2668";
  if (/bors|shopping bag|pochette|marsupi/.test(value)) return "3032";
  if (/cinture/.test(value)) return "169";
  if (/cappelli|berretti/.test(value)) return "173";
  if (/passamontagna/.test(value)) return "1786";
  if (/guanti/.test(value)) return "170";
  if (/sciarp/.test(value)) return "543673";
  if (/scaldacollo/.test(value)) return "7230";
  if (/scaldamuscoli/.test(value)) return "5941";
  if (/cravatt/.test(value)) return "176";
  if (/portachiavi/.test(value)) return "175";
  if (/costumi/.test(value)) return "211";
  if (/intimo/.test(value)) return "2562";
  if (/gonne/.test(value)) return "1581";
  if (/shorts/.test(value)) return "207";
  if (/pantaloni|jeans|leggings/.test(value)) return "204";
  if (/body/.test(value)) return "5490";
  if (/tute/.test(value)) return "5250";
  if (/abiti/.test(value)) return "2271";
  if (/gilet/.test(value)) return "1831";
  if (/giacch|cappott|trench|parka|poncho|coprispalle/.test(value)) return "5598";
  if (/magli|t-shirt|top|felpe|camicie|bluse|polo/.test(value)) return "212";
  if (/abbigliamento|completi/.test(value)) return "1604";
  return "166";
}

function productType(row: GoogleMerchantFeedRow, attributes: CatalogAttributes) {
  const segments = [
    "Moda",
    attributes.gender || row.gender,
    attributes.category,
    attributes.subcategory,
    row.categoryName,
  ]
    .map((value) => compactText(value, 750))
    .filter(Boolean)
    .filter((value, index, all) => all.findIndex((candidate) => candidate.toLocaleLowerCase("it-IT") === value.toLocaleLowerCase("it-IT")) === index);
  return segments.join(" > ").slice(0, 750);
}

function variantOption(name: string, value: string | null | undefined) {
  const cleanValue = compactText(value, 250);
  if (!cleanValue) return "";
  return `<g:variant_option>${xmlElement("g:name", name)}${xmlElement("g:value", cleanValue)}</g:variant_option>`;
}

function priceValue(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function buildItem(row: GoogleMerchantFeedRow, siteUrl: string) {
  const attributes = parseAttributes(row.metadataJson);
  const brand = compactText(row.brand || attributes.brand, 70);
  const color = compactText(row.color || attributes.color, 100);
  const size = compactText(row.size || row.variantTitle, 100);
  const material = compactText(attributes.composition, 200);
  const titlePrefix = brand && !row.productName.toLocaleLowerCase("it-IT").includes(brand.toLocaleLowerCase("it-IT")) ? `${brand} ` : "";
  const title = compactText(`${titlePrefix}${row.productName}${color ? ` - ${color}` : ""}${size ? ` - ${size}` : ""}`, 150);
  const description = compactText(
    row.description || row.shortDescription || `${title}. Scopri dettagli, disponibilità e varianti nella selezione LCS.`,
    5000,
  );
  const productUrl = new URL(`/prodotto/${encodeURIComponent(row.slug)}`, siteUrl);
  productUrl.searchParams.set("variant", row.variantId);

  const imageUrls = row.imageUrls.map(validWebUrl).filter((value): value is string => Boolean(value));
  const currentPrice = row.variantPriceCents ?? row.basePriceCents;
  const compareAtPrice = row.variantCompareAtPriceCents ?? row.productCompareAtPriceCents;
  const hasSalePrice = Boolean(compareAtPrice && compareAtPrice > currentPrice);
  const gtin = normalizeGtin(row.barcode);
  const mpn = compactText(row.supplierCode, 70);
  const availability = row.stockQuantity > 0 ? "in_stock" : row.backorder ? "backorder" : "out_of_stock";
  const category = row.categoryName || attributes.category;
  const weightGrams = row.variantWeightGrams ?? row.productWeightGrams;
  const isVariantGroup = row.variantCount > 1;

  const elements = [
    xmlElement("g:id", row.variantId),
    xmlElement("title", title),
    xmlElement("description", description),
    xmlElement("link", productUrl.toString()),
    xmlElement("g:image_link", imageUrls[0]),
    ...imageUrls.slice(1, 11).map((url) => xmlElement("g:additional_image_link", url)),
    xmlElement("g:availability", availability),
    xmlElement("g:condition", "new"),
    xmlElement("g:price", priceValue(hasSalePrice ? compareAtPrice! : currentPrice, row.currency)),
    hasSalePrice ? xmlElement("g:sale_price", priceValue(currentPrice, row.currency)) : "",
    xmlElement("g:brand", brand),
    xmlElement("g:gtin", gtin),
    xmlElement("g:mpn", mpn),
    !brand && !gtin && !mpn ? xmlElement("g:identifier_exists", "no") : "",
    isVariantGroup ? xmlElement("g:item_group_id", row.productId) : "",
    isVariantGroup ? xmlElement("g:item_group_title", compactText(`${titlePrefix}${row.productName}`, 150)) : "",
    xmlElement("g:color", color),
    xmlElement("g:size", size),
    xmlElement("g:gender", googleGender(attributes.gender || row.gender)),
    xmlElement("g:age_group", googleAgeGroup(attributes.gender || row.gender)),
    xmlElement("g:material", material),
    xmlElement("g:product_type", productType(row, attributes)),
    xmlElement("g:google_product_category", googleProductCategory(category, attributes.subcategory)),
    weightGrams && weightGrams > 0 ? xmlElement("g:shipping_weight", `${weightGrams} g`) : "",
    xmlElement("g:custom_label_0", compactText(attributes.season, 100)),
    xmlElement("g:custom_label_1", compactText(row.catalogSource, 100)),
    isVariantGroup ? variantOption("size", size) : "",
    isVariantGroup ? variantOption("color", color) : "",
  ].filter(Boolean);

  return `<item>${elements.join("")}</item>`;
}

export function buildGoogleMerchantFeed(rows: GoogleMerchantFeedRow[], configuredSiteUrl?: string) {
  const siteUrl = validWebUrl(configuredSiteUrl) ?? DEFAULT_SITE_URL;
  const items = rows
    .filter((row) => (row.variantPriceCents ?? row.basePriceCents) > 0)
    .filter((row) => row.imageUrls.some((url) => Boolean(validWebUrl(url))))
    .filter((row) => {
      const attributes = parseAttributes(row.metadataJson);
      return Boolean(
        compactText(row.brand || attributes.brand, 70)
        && compactText(row.size || row.variantTitle, 100)
        && compactText(row.color || attributes.color, 100),
      );
    })
    .map((row) => buildItem(row, siteUrl));

  return `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel>${xmlElement("title", "LCS — Catalogo prodotti")}${xmlElement("link", siteUrl)}${xmlElement("description", "Feed prodotti ufficiale LCS per Google Merchant Center")}${items.join("")}</channel></rss>`;
}
