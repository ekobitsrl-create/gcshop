export const LOCAL_CART_STORAGE_KEY = "lusso_preview_bag_v1";
export const LOCAL_CART_EVENT = "lusso:preview-bag-updated";

export type LocalCartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string;
  variantId: string;
  variantTitle: string;
  quantity: number;
  unitPriceCents: number;
  currency: "EUR";
};

function isCartItem(value: unknown): value is LocalCartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LocalCartItem>;
  return typeof item.key === "string"
    && typeof item.productId === "string"
    && typeof item.slug === "string"
    && typeof item.name === "string"
    && typeof item.variantId === "string"
    && typeof item.variantTitle === "string"
    && typeof item.quantity === "number"
    && typeof item.unitPriceCents === "number"
    && item.currency === "EUR";
}

export function readLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_CART_STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items: LocalCartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(LOCAL_CART_EVENT));
}

export function addLocalCartItem(item: Omit<LocalCartItem, "key">) {
  const key = `${item.productId}:${item.variantId}`;
  const items = readLocalCart();
  const existing = items.find((entry) => entry.key === key);
  const next = existing
    ? items.map((entry) => entry.key === key
      ? { ...entry, quantity: Math.min(20, entry.quantity + item.quantity) }
      : entry)
    : [...items, { ...item, key, quantity: Math.min(20, Math.max(1, item.quantity)) }];
  writeLocalCart(next);
  return next;
}

export function updateLocalCartItem(key: string, quantity: number) {
  const next = readLocalCart().map((item) => item.key === key
    ? { ...item, quantity: Math.min(20, Math.max(1, quantity)) }
    : item);
  writeLocalCart(next);
  return next;
}

export function removeLocalCartItem(key: string) {
  const next = readLocalCart().filter((item) => item.key !== key);
  writeLocalCart(next);
  return next;
}

export function getLocalCartCount() {
  return readLocalCart().reduce((total, item) => total + item.quantity, 0);
}
