"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const recalc = useCallback((next: CartItem[]): CartState => {
    const count = next.reduce((a, b) => a + b.qty, 0);
    const subtotal = next.reduce((a, b) => a + b.price * b.qty, 0);
    return { items: next, count, subtotal };
  }, []);

  const [derived, setDerived] = useState<CartState>(() => recalc([]));

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === item.id);
        const next = [...prev];
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        else next.push({ ...item, qty });
        const s = recalc(next);
        setDerived(s);
        toast.success("Agregado al carrito", { description: item.title });
        return next;
      });
    },
    [recalc]
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      const s = recalc(next);
      setDerived(s);
      return next;
    });
  }, [recalc]);

  const clear = useCallback(() => {
    setItems(() => {
      const s = recalc([]);
      setDerived(s);
      return [];
    });
  }, [recalc]);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0);
      const s = recalc(next);
      setDerived(s);
      return next;
    });
  }, [recalc]);

  const value = useMemo<CartContextValue>(
    () => ({ ...derived, add, remove, clear, setQty }),
    [derived, add, remove, clear, setQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
