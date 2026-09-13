export type CartItem = {
  id: string; productId: string; variantId: string; name: string; slug: string;
  variantName: string; quantity: number; unitPriceCents: number; lineTotalCents: number;
  stockQuantity: number; imageUrl: string | null;
};

export type CartSnapshot = {
  cartId: string | null; currency: string; items: CartItem[]; itemCount: number; subtotalCents: number; checkoutUrl?: string;
};

export const emptyCart: CartSnapshot = { cartId: null, currency: "EUR", items: [], itemCount: 0, subtotalCents: 0 };
