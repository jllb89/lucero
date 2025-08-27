"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "¿En cuánto tiempo llega mi envío?",
    a: "Los pedidos se procesan en 24–48 horas hábiles. El tiempo de entrega típico es de 2 a 5 días hábiles dependiendo de tu ubicación.",
  },
  {
    q: "¿Cuál es el costo de envío?",
    a: "Calculamos el costo al finalizar la compra según tu dirección y el peso/volumen del pedido. Verás el total antes de pagar.",
  },
  {
    q: "¿El costo de envío es por cada libro?",
    a: "No necesariamente. Cuando agregas varios libros, optimizamos el paquete para que pagues lo mínimo posible por el envío.",
  },
  {
    q: "¿Hacen envíos a todo el país?",
    a: "Sí. Enviamos a toda la República Mexicana a través de paqueterías confiables con rastreo.",
  },
  {
    q: "¿Puedo rastrear mi pedido?",
    a: "Claro. Una vez que el pedido salga de almacén, te enviaremos el número de guía para que puedas verificar el avance en línea.",
  },
];

function FaqItem({ qa, idx, open, onToggle }: { qa: QA; idx: number; open: boolean; onToggle: (i: number) => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Smooth height & opacity per item
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.style.transition = "height 300ms ease, opacity 250ms ease";
    el.style.overflow = "hidden";
    if (open) {
      el.style.height = el.scrollHeight + "px";
      el.style.opacity = "1";
    } else {
      el.style.height = "0px";
      el.style.opacity = "0";
    }
  }, [open]);

  return (
    <div className="w-full">
      <button
        onClick={() => onToggle(idx)}
        className={[
          "group relative mx-auto block w-full text-center",
          "ls--3 text-3xl font-medium leading-[55px]",
          inter.className,
          "text-lucero-light transition-colors duration-500 ease-in-out hover:text-black",
        ].join(" ")}
        aria-expanded={open}
      >
        {qa.q}
      </button>

      <div
        ref={panelRef}
        className={["mx-auto mt-1 max-w-4xl text-center text-lg text-neutral-700", "ls--3"].join(" ")}
        style={{ height: 0, opacity: 0 }}
      >
        <p className="px-4">{qa.a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((curr) => (curr === i ? null : i));
  };

  return (
    <section className="container mx-auto max-w-7xl px-6 py-24">
      <h2 className={[inter.className, "mb-6 text-6xl font-medium text-lucero-light ls--3"].join(" ")}>Preguntas</h2>
      <h3 className={[inter.className, "-mt-4 mb-10 text-6xl font-medium text-zinc-900 ls--3"].join(" ")}>Frecuentes.</h3>

      <div className="space-y-3">
        {FAQS.map((qa, i) => (
          <FaqItem key={qa.q} qa={qa} idx={i} open={openIndex === i} onToggle={toggle} />
        ))}
      </div>
    </section>
  );
}
