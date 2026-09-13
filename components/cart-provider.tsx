"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/locale-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { emptyCart, type CartSnapshot } from "@/lib/cart-types";

type CartContextValue = {
  cart: CartSnapshot; loading: boolean; busy: boolean; error: string; open: boolean; notice: string;
  openCart: () => void; closeCart: () => void;
  addItem: (variantId: string, quantity: number, showCart?: boolean) => Promise<boolean>;
  setQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { locale, t } = useI18n();
  const [cart, setCart] = useState<CartSnapshot>(emptyCart);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pending = useRef(false);
  const revision = useRef(0);
  const channel = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(() => {
    if (pending.current) return Promise.resolve();
    const current = ++revision.current;
    return fetch("/api/cart", { cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<CartSnapshot>; })
      .then((next) => { if (current === revision.current) setCart(next); })
      .catch(() => { if (current === revision.current) setError(t("cart.loadError")); })
      .finally(() => { if (current === revision.current) setLoading(false); });
  }, [t]);

  useEffect(() => {
    void refresh();
    const onFocus = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel("lcs-cart");
      channel.current.onmessage = () => { void refresh(); };
    }
    return () => {
      revision.current += 1;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      channel.current?.close(); channel.current = null;
    };
  }, [locale, refresh]);

  async function mutate(method: "POST" | "PATCH" | "DELETE", body: object) {
    // Claim synchronously: a second click cannot start another first-cart request
    // before React disables the buttons and the cookie has reached the browser.
    if (pending.current) return false;
    pending.current = true; revision.current += 1;
    setBusy(true); setLoading(false); setError(""); setNotice("");
    let succeeded = false;
    try {
      const response = await fetch("/api/cart", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("purchase.cartError"));
      setCart(payload as CartSnapshot);
      channel.current?.postMessage("updated");
      succeeded = true;
      return true;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t("purchase.connectionError"));
      return false;
    } finally {
      pending.current = false; setBusy(false);
      if (!succeeded) void refresh();
    }
  }

  const value: CartContextValue = {
    cart, loading, busy, error, open, notice,
    openCart: () => { setOpen(true); setNotice(""); setError(""); void refresh(); },
    closeCart: () => setOpen(false),
    addItem: async (variantId, quantity, showCart = true) => {
      const added = await mutate("POST", { variantId, quantity });
      if (added && showCart) { setNotice(t("cart.added")); setOpen(true); }
      return added;
    },
    setQuantity: (itemId, quantity) => mutate("PATCH", { itemId, quantity }),
    removeItem: (itemId) => mutate("DELETE", { itemId }),
  };

  return <CartContext.Provider value={value}>{children}<CartDrawer /></CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
