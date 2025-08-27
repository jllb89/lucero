"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inter } from "next/font/google";
import { gsap } from "gsap";
import BookTile from "@/components/BookTile";

const inter = Inter({ subsets: ["latin"] });

export type StoreBook = {
  id: string;
  title: string;
  description: string | null;
  digitalPrice: number | null;
  physicalPrice: number | null;
  images: any;
  bookCover: string | null;
  category: "PRIMARIA" | "SECUNDARIA" | "BACHILLERATO" | "PARA_MAESTROS";
  coverUrl?: string | null;
};

const CATEGORIES = [
  { label: "Ver todos", value: "ALL" },
  { label: "Primaria", value: "PRIMARIA" },
  { label: "Secundaria", value: "SECUNDARIA" },
  { label: "Bachillerato", value: "BACHILLERATO" },
  { label: "Para maestros", value: "PARA_MAESTROS" },
] as const;

function CategoryPills({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <nav className="mt-6 flex w-full flex-wrap items-center gap-8 text-2xl">
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onSelect(c.value)}
          className={["group relative inline-block align-baseline leading-none ls--3", inter.className].join(" ")}
          aria-pressed={selected === c.value}
        >
          <span className={selected === c.value ? "text-black" : "text-lucero-light"}>{c.label}</span>
          <span
            aria-hidden
            className={[
              "absolute inset-0",
              "text-transparent bg-gradient-to-r from-black to-black bg-no-repeat",
              "bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]",
              "bg-[length:0%_100%] group-hover:bg-[length:100%_100%] group-focus-visible:bg-[length:100%_100%]",
              "transition-[background-size] duration-500 ease-out",
              selected === c.value ? "bg-[length:100%_100%]" : "",
            ].join(" ")}
          >
            {c.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

export default function Storefront({ initialBooks }: { initialBooks: StoreBook[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Sync from URL
  useEffect(() => {
    const v = searchParams.get("cat") || "ALL";
    setSelectedCat(v);
  }, [searchParams]);

  const onSelect = (value: string) => {
    setSelectedCat(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete("cat");
    else params.set("cat", value);
    const qs = params.toString();
    router.push(qs ? `?${qs}` : `?`, { scroll: false });
  };

  const filteredBooks = useMemo(() => {
    if (selectedCat === "ALL") return initialBooks;
    return initialBooks.filter((b) => b.category === selectedCat);
  }, [initialBooks, selectedCat]);

  // Animate tiles on filter change
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const tiles = grid.querySelectorAll<HTMLElement>('[data-tile="1"]');
    if (!tiles.length) return;
    gsap.set(tiles, { opacity: 0, y: 14 });
    gsap.to(tiles, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.1,
      clearProps: "transform,opacity",
    });
  }, [filteredBooks]);

  return (
    <>
      <CategoryPills selected={selectedCat} onSelect={onSelect} />

      {/* FEATURED / LIST — 4 per row */}
      <section className="container mx-auto max-w-7xl px-10 pb-6 pt-10">
        <div ref={gridRef} className="-mx-12 flex flex-wrap">
          {filteredBooks.length === 0 ? (
            <div className="w-full px-2 py-8 text-center text-neutral-500">Sin resultados</div>
          ) : (
            filteredBooks.map((b) => {
              let cover = b.coverUrl || b.bookCover || "";
              if (!cover && Array.isArray(b.images) && (b.images as any[]).length) {
                const first = (b.images as any[])[0];
                cover = typeof first === "string" ? first : first?.url || "";
              }
              if (!cover) cover = "https://placehold.co/300x400";

              const priceNum = (b.digitalPrice ?? b.physicalPrice ?? 0) as number;
              const price = `$${priceNum.toFixed(2)}`;

              return (
                <div key={b.id} data-tile="1" className="w-full px-2 mb-8 sm:w-1/2 md:w-1/3 lg:w-1/4">
                  <BookTile id={b.id} title={b.title} image={cover} price={price} description={b.description ?? ""} />
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
