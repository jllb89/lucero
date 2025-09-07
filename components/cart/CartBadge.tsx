"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useCart } from "@/hooks/useCart";
import Cart from "./Cart";

export default function CartBadge() {
  const { count, lastAddedAt } = useCart();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);

  // Auto-open when an item is added
  useEffect(() => {
    if (lastAddedAt) {
      setOpen(true);
    }
  }, [lastAddedAt]);

  // Build GSAP timeline once for opening (top -> bottom)
  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    // Initial state
    gsap.set(panel, { display: "none", transformOrigin: "top", y: 0, scaleY: 0 });
    gsap.set(content, { autoAlpha: 0 });

    const tl = gsap.timeline({ paused: true });
    // Step 1: show + expand panel (slower)
    tl.set(panel, { display: "block" });
    tl.set(panel, { transformOrigin: "top" });
    tl.to(panel, { scaleY: 1, duration: 0.9, ease: "power3.out" });
    // Step 2: fade in content
    tl.to(content, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, ">-0.05");
    // When fully closed (reversed), hide the panel for interactions
    tl.eventCallback("onReverseComplete", () => {
      gsap.set(panel, { display: "none", y: 0, scaleY: 0 });
      gsap.set(content, { autoAlpha: 0 });
    });

    tlRef.current = tl;
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, []);

  // Play open timeline or custom close (bottom -> top)
  useEffect(() => {
    const tl = tlRef.current;
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!tl || !panel || !content) return;
    if (open) {
      // Cancel any in-progress close
      if (closeTweenRef.current) {
        closeTweenRef.current.kill();
        closeTweenRef.current = null;
      }
      gsap.set(panel, { transformOrigin: "top" });
      tl.restart();
    } else {
      // Fade out content then collapse panel from bottom (with panel fade)
      const fade = gsap.to(content, { autoAlpha: 0, duration: 0.45, ease: "power1.out" });
      closeTweenRef.current = fade;
      fade.then(() => {
        closeTweenRef.current = gsap.to(panel, {
          transformOrigin: "top",
          scaleY: 0,
          duration: 0.9,
          ease: "power3.in",
          onComplete: () => {
            gsap.set(panel, { display: "none", autoAlpha: 1, scaleY: 0 });
            // Reset timeline so it can open cleanly next time
            tl.pause(0);
          },
        });
      });
    }
  }, [open]);

  // Counter pop on count change
  useEffect(() => {
    if (!countRef.current) return;
    gsap.fromTo(
      countRef.current,
      { scale: 1.05, autoAlpha: 0.75 },
      { scale: 1, autoAlpha: 1, duration: 0.25, ease: "power2.out" }
    );
  }, [count]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Dropdown panel */}
        <div
          ref={panelRef}
          className="absolute right-0 mt-14 z-10 w-[350px] max-w-[90vw] rounded-xl border bg-white p-5 shadow-xl"
          style={{ display: "none" }}
        >
          <div ref={contentRef} style={{ opacity: 0 }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium">Tu carrito</div>
              <button className="text-xs underline" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
            <div className="h-px w-full bg-zinc-200 mb-3" />
            <Cart isOpen={open} />
            {count > 0 && (
              <div className="mt-4 overflow-hidden rounded-md">
                <PaymentLinkButton />
              </div>
            )}

          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex items-center gap-2 bg-black px-4 py-2 text-white shadow-lg transition-colors hover:bg-zinc-800 rounded-full"
          style={{ borderRadius: 9999 }}
          aria-label="Abrir carrito"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="10" cy="20.5" r="1" />
            <circle cx="18" cy="20.5" r="1" />
            <path d="M2.5 2.5h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6l1.6-8.4H7.1" />
          </svg>
          <span className="text-sm">Carrito</span>
          <span ref={countRef} className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-lucero-light px-2 py-0.5 text-xs font-semibold text-black">
            {count}
          </span>
        </button>
      </div>
    </div>
  );
}
export function PaymentLinkButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(data?.error || "No se pudo crear el link de pago");
      window.location.href = data.url;
    } catch (e) {
      alert("No se pudo crear el link de pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="block w-full bg-black px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800 transition-colors rounded-md disabled:opacity-60"
      style={{ borderRadius: 8 }}
    >
      {loading ? "Procesando orden..." : "Finalizar compra"}
    </button>
  );
}
