'use client';

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import SearchBar from "@/components/SearchBar";
import BookTile from "@/components/BookTile";

const inter = Inter({ subsets: ["latin"] });

type Book = {
  id: string;
  title: string;
  price: string;
  level: "Primaria" | "Secundaria" | "Bachillerato" | "Todos";
  image: string;
  description: string;
};

const CATEGORIES = [
  { label: "Primaria", value: "Primaria" },
  { label: "Secundaria", value: "Secundaria" },
  { label: "Bachillerato", value: "Bachillerato" },
  { label: "Todos los niveles", value: "Todos" },
  { label: "Para maestros", value: "Maestros" },
  { label: "Ver todos", value: "all" },
] as const;

const BOOKS: Book[] = [
  {
    id: "1",
    title: "Matemáticas Avanzadas I",
    price: "$200",
    level: "Secundaria",
    image: "https://placehold.co/300x400",
    description:
      "Este libro introduce a los estudiantes a conceptos avanzados de matemáticas con explicaciones claras, ejemplos y ejercicios prácticos para desarrollar el pensamiento lógico y fortalecer la resolución de problemas.",
  },
  {
    id: "2",
    title: "Historia Universal",
    price: "$250",
    level: "Secundaria",
    image: "https://placehold.co/300x400",
    description:
      "Un recorrido por los acontecimientos clave de la historia mundial, presentado con un lenguaje accesible y apoyado en recursos visuales que fomentan la comprensión crítica del pasado y su relación con el presente.",
  },
  {
    id: "3",
    title: "Literatura Contemporánea",
    price: "$180",
    level: "Bachillerato",
    image: "https://placehold.co/300x400",
    description:
      "Selección curada de autores contemporáneos que abre la puerta a la reflexión y el análisis, promoviendo la lectura crítica con actividades y preguntas guía al final de cada capítulo.",
  },
  {
    id: "4",
    title: "Química Básica",
    price: "$210",
    level: "Primaria",
    image: "https://placehold.co/300x400",
    description:
      "Conceptos esenciales de química explicados de forma sencilla y entretenida, con experimentos seguros para realizar en clase y en casa que refuerzan el aprendizaje por medio de la práctica.",
  },
  {
    id: "5",
    title: "Geografía de México",
    price: "$190",
    level: "Todos",
    image: "https://placehold.co/300x400",
    description:
      "Un panorama completo de la geografía física y humana de México, con mapas, gráficas y actividades que ayudan a comprender el territorio y la diversidad del país.",
  },
];

function CategoryPills() {
  return (
    <nav className="mt-6 flex w-full flex-wrap items-center gap-8 text-2xl">
      {CATEGORIES.map((c, i) => (
        <Link
          key={c.value}
          href="#"
          className={[
            "group relative inline-block align-baseline leading-none ls--3",
            inter.className,
          ].join(" ")}
        >
          <span className={i === 0 ? "text-black" : "text-lucero-light"}>
            {c.label}
          </span>
          <span
            aria-hidden
            className={[
              "absolute inset-0",
              "text-transparent bg-gradient-to-r from-black to-black bg-no-repeat",
              "bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]",
              "bg-[length:0%_100%] group-hover:bg-[length:100%_100%] group-focus-visible:bg-[length:100%_100%]",
              "transition-[background-size] duration-500 ease-out",
              i === 0 ? "bg-[length:100%_100%]" : "",
            ].join(" ")}
          >
            {c.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

/* ----------------------------- FAQ SECTION ----------------------------- */

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

function FaqItem({
  qa,
  idx,
  open,
  onToggle,
}: {
  qa: QA;
  idx: number;
  open: boolean;
  onToggle: (i: number) => void;
}) {
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
      {/* Simple color transition on hover */}
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

      {/* Answer */}
      <div
        ref={panelRef}
        className={[
          "mx-auto mt-1 max-w-4xl text-center text-lg text-neutral-700",
          "ls--3",
        ].join(" ")}
        style={{ height: 0, opacity: 0 }}
      >
        <p className="px-4">{qa.a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((curr) => (curr === i ? null : i));
  };

  return (
    <section className="container mx-auto max-w-7xl px-6 py-24">
      <h2 className={[inter.className, "mb-6 text-6xl font-medium text-lucero-light ls--3"].join(" ")}>
        Preguntas
      </h2>
      <h3 className={[inter.className, "-mt-4 mb-10 text-6xl font-medium text-zinc-900 ls--3"].join(" ")}>
        Frecuentes.
      </h3>

      <div className="space-y-3">
        {FAQS.map((qa, i) => (
          <FaqItem key={qa.q} qa={qa} idx={i} open={openIndex === i} onToggle={toggle} />
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- PAGE ----------------------------- */

export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-[#1D1D1F]">
      <SearchBar />

      {/* HERO */}
      <section className="container mx-auto max-w-7xl px-6 pt-20 pb-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-6xl font-medium ls--3">
            <span className={["block text-lucero-light", inter.className].join(" ")}>
              Bienvenido a la nueva tienda en línea de
            </span>
            <span className={["block text-zinc-900", inter.className].join(" ")}>
              Editorial Lucero.
            </span>
          </h1>
          <CategoryPills />
        </div>
      </section>

      {/* FEATURED / LIST — 4 per row, independent card heights via flex-wrap */}
      <section className="container mx-auto max-w-7xl px-6 pb-24">
        <div className="-mx-2 flex flex-wrap">
          {BOOKS.slice(0, 4).map((b) => (
            <div key={b.id} className="w-full px-2 mb-8 sm:w-1/2 md:w-1/3 lg:w-1/4">
              <BookTile
                id={b.id}
                title={b.title}
                image={b.image}
                price={b.price}
                description={b.description}
              />
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="mt-20 overflow-hidden rounded-2xl">
          <img
            src="https://placehold.co/1728x731"
            alt="Promoción"
            className="h-72 w-full rounded-2xl object-cover sm:h-[28rem]"
          />
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* FOOTER */}
      <footer className="mt-10 bg-[#E3E3E3]">
        <div className="container mx-auto max-w-7xl px-6 py-24">
          <p className={[inter.className, "max-w-3xl text-sm font-medium text-black ls--3"].join(" ")}>
            Nueva Editorial Lucero S.A. de C.V. y Grupo Editorial LAN, S.A. de C.V. son empresas 100% mexicanas,
            dedicadas a la creación, edición, publicación y comercialización de libros de texto, cuadernos de actividades
            y materiales educativos para primaria, secundaria y bachillerato.
            <br />
            <br />
            Crestón 312-2, Col. Jardines del Pedregal, 01900 Álvaro Obregón, Ciudad de México
            <br />
            Contacto:{" "}
            <a className="underline" href="tel:+525611846597" aria-label="Llamar al 5611846597">
              5611846597
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
