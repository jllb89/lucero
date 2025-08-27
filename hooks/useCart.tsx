"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type CartItem = {
  id: string;
  title: string;
  price: number; // store numeric price for totals
  image?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  count: number;
  subtotal: number;
};

type CartContextValue = CartState & {
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setQty: (id: string, qty: number) => void;
  lastAddedAt: number; // timestamp for last item added; for UI to react (e.g., open cart)
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAddedAt, setLastAddedAt] = useState<number>(0);

  // Persistence (client-side): use localStorage instead of cookies for capacity and not sending data to the server.
  const STORAGE_KEY = "lucero:cart:v1";

  // Load persisted items once on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        // Minimal validation
        const valid: CartItem[] = parsed
          .map((i: any) => ({
            id: String(i?.id ?? ""),
            title: String(i?.title ?? ""),
            price: typeof i?.price === "number" ? i.price : Number(i?.price) || 0,
            image: i?.image ? String(i.image) : undefined,
            qty: Number.isFinite(i?.qty) ? Math.max(1, Math.floor(i.qty)) : 1,
          }))
          .filter((i) => i.id && i.title && i.price >= 0 && i.qty > 0);
        if (valid.length) setItems(valid);
      }
    } catch (e) {
      // ignore corrupted storage
      console.warn("Failed to load cart from storage", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on changes
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist cart to storage", e);
    }
  }, [items]);

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === item.id);
        const next = [...prev];
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        else next.push({ ...item, qty });
        return next;
      });
      // Fire toast outside the state updater to avoid Strict Mode double-invoke
      toast.success("Agregado al carrito", { description: item.title });
  setLastAddedAt(Date.now());
    },
    []
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems(() => []);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ items, count, subtotal, add, remove, clear, setQty, lastAddedAt }),
    [items, count, subtotal, add, remove, clear, setQty, lastAddedAt]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
