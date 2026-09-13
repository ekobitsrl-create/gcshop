export const COMPARISON_LIMIT = 2;
export const COMPARISON_STORAGE_KEY = "lcs.comparison.v1";
const productIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ComparisonSelection = { id: string; name: string };
export type ComparisonProduct = {
  id: string; name: string; slug: string; brand: string | null; imageUrl: string | null;
  currency: string; priceCents: number | null; priceVaries: boolean; inStock: boolean;
  cheapestVariantId: string | null; sizes: string[]; color: string | null;
  category: string | null; composition: string | null; season: string | null; originCountry: string | null;
};

export function isComparisonId(value: string): boolean { return productIdPattern.test(value); }

export function parseComparisonIds(value: string): string[] {
  if (!value) return [];
  const ids = value.split(",");
  if (ids.length > COMPARISON_LIMIT || ids.some((id) => !isComparisonId(id))) throw new Error("compare.invalid");
  return [...new Set(ids.map((id) => id.toLowerCase()))];
}

export function readComparisonSelection(raw: string | null): ComparisonSelection[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const result: ComparisonSelection[] = [];
    for (const item of parsed) {
      if (!item || typeof item.id !== "string" || !isComparisonId(item.id) || typeof item.name !== "string") continue;
      const id = item.id.toLowerCase();
      if (!result.some((existing) => existing.id === id)) result.push({ id, name: item.name.slice(0, 240) });
      if (result.length === COMPARISON_LIMIT) break;
    }
    return result;
  } catch { return []; }
}

export function toggleComparison(items: ComparisonSelection[], item: ComparisonSelection) {
  const id = item.id.toLowerCase();
  if (items.some((entry) => entry.id === id)) return { items: items.filter((entry) => entry.id !== id), notice: "compare.removed" };
  if (items.length >= COMPARISON_LIMIT) return { items, notice: "compare.limit" };
  if (!isComparisonId(id)) return { items, notice: "compare.invalid" };
  return { items: [...items, { id, name: item.name.slice(0, 240) }], notice: "compare.added" };
}

type PriceVariant = { id: string; priceCents: number | null; stockQuantity: number; size: string | null };
export function comparisonPrice(basePriceCents: number, variants: PriceVariant[]) {
  const available = variants.filter((variant) => variant.stockQuantity > 0);
  const priced = (available.length ? available : variants)
    .map((variant) => ({ ...variant, price: variant.priceCents ?? basePriceCents }))
    .filter((variant) => Number.isSafeInteger(variant.price) && variant.price >= 0)
    .sort((left, right) => left.price - right.price);
  return {
    priceCents: priced[0]?.price ?? null,
    priceVaries: new Set(priced.map((variant) => variant.price)).size > 1,
    inStock: available.length > 0,
    cheapestVariantId: available.length ? priced[0]?.id ?? null : null,
    sizes: [...new Set(available.flatMap((variant) => variant.size ? [variant.size] : []))],
  };
}

export function comparePrices(items: Pick<ComparisonProduct, "id" | "currency" | "priceCents" | "inStock">[]) {
  const [left, right] = items;
  if (items.length !== 2 || left.currency !== right.currency || !left.inStock || !right.inStock ||
    left.priceCents === null || right.priceCents === null) return { kind: "unavailable" as const };
  if (left.priceCents === right.priceCents) return { kind: "equal" as const };
  return {
    kind: "winner" as const,
    winnerId: left.priceCents < right.priceCents ? left.id : right.id,
    savingCents: Math.abs(left.priceCents - right.priceCents),
    currency: left.currency,
  };
}
