import { SITE_URL } from "./site-url.mjs";

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

type ExclusionReason = "duplicate_id" | "missing_image" | "missing_price" | "missing_product_data";

export type GoogleMerchantFeedResult = {
  xml: string;
  includedItems: number;
  excludedItems: number;
  exclusions: Record<ExclusionReason, number>;
  warnings: {
    invalidGtin: number;
    missingBrand: number;
    missingColor: number;
    missingMpn: number;
    missingSize: number;
  };
};

function stripInvalidXmlCharacters(value: string) {
  return Array.from(value).filter((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint === 0x09
      || codePoint === 0x0a
      || codePoint === 0x0d
      || (codePoint >= 0x20 && codePoint <= 0xd7ff)
      || (codePoint >= 0xe000 && codePoint <= 0xfffd)
      || (codePoint >= 0x10000 && codePoint <= 0x10ffff);
  }).join("");
}

function compactText(value: string | null | undefined, maxLength: number) {
  if (!value) return "";
  return stripInvalidXmlCharacters(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function escapeXml(value: string | number | boolean) {
  return stripInvalidXmlCharacters(String(value))
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
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
  if (/^(02|04|2|98|99)/.test(digits)) return null;

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
  if (/donna|woman|women|female|femmina|femme|mujer|damen/.test(normalized)) return "female";
  if (/uomo|man|men|male|maschio|homme|hombre|herr/.test(normalized)) return "male";
  return "unisex";
}

function googleAgeGroup(value: string | null | undefined) {
  const normalized = value ?? "";
  if (/newborn|neonat/i.test(normalized)) return "newborn";
  if (/infant|baby|beb[eè]/i.test(normalized)) return "infant";
  if (/toddler/i.test(normalized)) return "toddler";
  if (/junior|kid|kids|bambin/i.test(normalized)) return "kids";
  return "adult";
}

function googleColor(value: string | null | undefined) {
  const color = compactText(value, 100);
  if (!color || /^\d+$/.test(color) || /^(n\/?a|various|vario|assortit|see image|vedi foto|multicolou?r|multicolore)$/i.test(color)) return "";
  return color.replace(/\s*\/\s*/g, "/");
}

function googleProductCategory(category?: string | null, subcategory?: string | null) {
  const value = `${subcategory ?? ""} ${category ?? ""}`.toLocaleLowerCase("it-IT");

  if (/coperte/.test(value)) return "1985";
  if (/ombrelli/.test(value)) return "4358";
  if (/zaini/.test(value)) return "100";
  if (/borsoni/.test(value)) return "103";
  if (/marsupi/.test(value)) return "104";
  if (/valigie/.test(value)) return "107";
  if (/shopping bag/.test(value)) return "5608";
  if (/sneaker|stival|sandali|ciabatt|décolleté|decollete|mocassin|pantofol|scarpe/.test(value)) return "187";
  if (/portafogli/.test(value)) return "2668";
  if (/bors|pochette/.test(value)) return "3032";
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
  if (/completi/.test(value)) return "1594";
  if (/magli|t-shirt|top|felpe|camicie|bluse|polo/.test(value)) return "212";
  if (/accessori/.test(value)) return "167";
  if (/abbigliamento/.test(value)) return "1604";
  if (/borse/.test(value)) return "6551";
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

function sentence(value: string) {
  const text = value.trim();
  return text && !/[.!?]$/.test(text) ? `${text}.` : text;
}

function productDescription(
  row: GoogleMerchantFeedRow,
  attributes: CatalogAttributes,
  brand: string,
  color: string,
  material: string,
  category: string,
) {
  const base = sentence(compactText(
    row.description || row.shortDescription || `${brand} ${row.productName}`,
    4200,
  ));
  const details = [
    brand ? `Marca: ${brand}.` : "",
    category ? `Categoria: ${category}.` : "",
    color ? `Colore: ${color}.` : "",
    material ? `Composizione: ${material}.` : "",
    row.originCountry ? `Paese di origine: ${compactText(row.originCountry, 80)}.` : "",
    attributes.model ? `Modello: ${compactText(attributes.model, 120)}.` : "",
  ].filter(Boolean);
  return compactText([base, ...details].join(" "), 5000);
}

function shippingXml() {
  return `<g:shipping>${xmlElement("g:country", "IT")}${xmlElement("g:service", "Standard")}${xmlElement("g:price", "0.00 EUR")}</g:shipping>`;
}

function buildItem(row: GoogleMerchantFeedRow, siteUrl: string) {
  const attributes = parseAttributes(row.metadataJson);
  const brand = compactText(row.brand || attributes.brand, 70);
  const color = googleColor(row.color || attributes.color);
  const size = compactText(row.size, 100);
  const material = compactText(attributes.composition, 200);
  const category = compactText(row.categoryName || attributes.subcategory || attributes.category, 200);
  const titlePrefix = brand && !row.productName.toLocaleLowerCase("it-IT").includes(brand.toLocaleLowerCase("it-IT")) ? `${brand} ` : "";
  const title = compactText(`${titlePrefix}${row.productName}${color ? ` - ${color}` : ""}${size ? ` - ${size}` : ""}`, 150);
  const description = productDescription(row, attributes, brand, color, material, category);
  const productUrl = new URL(`/prodotto/${encodeURIComponent(row.slug)}`, siteUrl);
  productUrl.searchParams.set("variant", row.variantId);

  const imageUrls = row.imageUrls.map(validWebUrl).filter((value): value is string => Boolean(value));
  const currentPrice = row.variantPriceCents ?? row.basePriceCents;
  const compareAtPrice = row.variantCompareAtPriceCents ?? row.productCompareAtPriceCents;
  const hasSalePrice = Boolean(compareAtPrice && compareAtPrice > currentPrice);
  const gtin = normalizeGtin(row.barcode);
  const mpn = compactText(row.supplierCode, 70);
  const availability = row.stockQuantity > 0 ? "in_stock" : row.backorder ? "backorder" : "out_of_stock";
  const weightGrams = row.variantWeightGrams ?? row.productWeightGrams;
  const isVariantGroup = row.variantCount > 1;

  const elements = [
    xmlElement("g:id", row.variantId),
    xmlElement("g:title", title),
    xmlElement("g:description", description),
    xmlElement("g:link", productUrl.toString()),
    xmlElement("g:image_link", imageUrls[0]),
    ...imageUrls.slice(1, 6).map((url) => xmlElement("g:additional_image_link", url)),
    xmlElement("g:availability", availability),
    xmlElement("g:condition", "new"),
    xmlElement("g:price", priceValue(hasSalePrice ? compareAtPrice! : currentPrice, row.currency)),
    hasSalePrice ? xmlElement("g:sale_price", priceValue(currentPrice, row.currency)) : "",
    shippingXml(),
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
    xmlElement("g:google_product_category", googleProductCategory(attributes.category || row.categoryName, attributes.subcategory || row.categoryName)),
    weightGrams && weightGrams > 0 ? xmlElement("g:shipping_weight", `${weightGrams} g`) : "",
    xmlElement("g:custom_label_0", compactText(attributes.season, 100)),
    xmlElement("g:custom_label_1", compactText(row.catalogSource, 100)),
    isVariantGroup ? variantOption("size", size) : "",
    isVariantGroup ? variantOption("color", color) : "",
  ].filter(Boolean);

  return `<item>${elements.join("")}</item>`;
}

export function buildGoogleMerchantFeedResult(rows: GoogleMerchantFeedRow[], configuredSiteUrl?: string): GoogleMerchantFeedResult {
  const siteUrl = validWebUrl(configuredSiteUrl) ?? SITE_URL;
  const items: string[] = [];
  const seenIds = new Set<string>();
  const exclusions: Record<ExclusionReason, number> = {
    duplicate_id: 0,
    missing_image: 0,
    missing_price: 0,
    missing_product_data: 0,
  };
  const warnings = { invalidGtin: 0, missingBrand: 0, missingColor: 0, missingMpn: 0, missingSize: 0 };

  for (const row of rows) {
    if (seenIds.has(row.variantId) || !row.variantId) {
      exclusions.duplicate_id += 1;
      continue;
    }
    seenIds.add(row.variantId);

    if (!row.productName || !row.slug || !/^[A-Z]{3}$/i.test(row.currency)) {
      exclusions.missing_product_data += 1;
      continue;
    }
    if ((row.variantPriceCents ?? row.basePriceCents) <= 0) {
      exclusions.missing_price += 1;
      continue;
    }
    if (!row.imageUrls.some((url) => Boolean(validWebUrl(url)))) {
      exclusions.missing_image += 1;
      continue;
    }

    const attributes = parseAttributes(row.metadataJson);
    if (!compactText(row.brand || attributes.brand, 70)) warnings.missingBrand += 1;
    if (!googleColor(row.color || attributes.color)) warnings.missingColor += 1;
    if (!compactText(row.size, 100)) warnings.missingSize += 1;
    if (!compactText(row.supplierCode, 70)) warnings.missingMpn += 1;
    if (row.barcode && !normalizeGtin(row.barcode)) warnings.invalidGtin += 1;
    items.push(buildItem(row, siteUrl));
  }

  const excludedItems = Object.values(exclusions).reduce((sum, value) => sum + value, 0);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel>${xmlElement("title", "LCS — Catalogo prodotti")}${xmlElement("link", siteUrl)}${xmlElement("description", "Feed prodotti ufficiale LCS per Google Merchant Center")}${items.join("")}</channel></rss>`;

  return { xml, includedItems: items.length, excludedItems, exclusions, warnings };
}

export function buildGoogleMerchantFeed(rows: GoogleMerchantFeedRow[], configuredSiteUrl?: string) {
  return buildGoogleMerchantFeedResult(rows, configuredSiteUrl).xml;
}
