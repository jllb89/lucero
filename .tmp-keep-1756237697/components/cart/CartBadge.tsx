"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import Cart from "./Cart";

export default function CartBadge() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 w-[350px] max-w-[90vw] rounded-xl border bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">Tu carrito</div>
            <button className="text-sm underline" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </div>
          <Cart />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white shadow-lg transition-colors hover:bg-zinc-800"
        aria-label="Abrir carrito"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        <span className="text-sm">Carrito</span>
        <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-lucero-light px-2 py-0.5 text-xs font-semibold text-black">
          {count}
        </span>
      </button>
    </div>
  );
}
