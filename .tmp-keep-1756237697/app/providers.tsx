"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "../hooks/useCart";
import CartBadge from "@/components/cart/CartBadge";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>
  {children}
  <CartBadge />
        <Toaster position="top-right" richColors />
      </CartProvider>
    </ThemeProvider>
  );
}
