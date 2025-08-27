"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from 'gsap';
import BookTile from "@/components/BookTile";

type SearchBook = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  digitalPrice: number | null;
  physicalPrice: number | null;
  images: any;
  bookCover: string | null;
  category: "PRIMARIA" | "SECUNDARIA" | "BACHILLERATO" | "PARA_MAESTROS";
  coverUrl?: string | null;
};

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchBook[]>([]);

  const overlayWrapRef = useRef<HTMLDivElement | null>(null);
  const overlayFillRef = useRef<HTMLDivElement | null>(null);
  const inputRef       = useRef<HTMLInputElement | null>(null);
  const inputWrapRef   = useRef<HTMLDivElement | null>(null);
  const inputGroupRef  = useRef<HTMLDivElement | null>(null);
  const resultsRef     = useRef<HTMLDivElement | null>(null);
  const actionsRef     = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Lock body scroll when open + compensate scrollbar to avoid layout jump
  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    if (open) {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open, mounted]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOverlay(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function openOverlay() {
    if (!overlayWrapRef.current || !overlayFillRef.current) return;

    overlayWrapRef.current.style.visibility = 'visible';
    overlayWrapRef.current.style.pointerEvents = 'auto';
    gsap.set(overlayFillRef.current, { transformOrigin: '50% 100%', scaleY: 0, opacity: 1 });

    gsap.to(overlayFillRef.current, {
      duration: 0.9,
      scaleY: 1,
      ease: 'cubic-bezier(0.33,1,0.68,1)',
      onStart: () => {
        setOpen(true);
        // Results can be visible, but actions (Buscar/✕) should appear only after fully open
        if (resultsRef.current) gsap.set(resultsRef.current, { autoAlpha: 1 });
        if (actionsRef.current) gsap.set(actionsRef.current, { autoAlpha: 0 });
  requestAnimationFrame(() => inputRef.current?.focus());
      },
      onComplete: () => {
        if (actionsRef.current) gsap.to(actionsRef.current, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' });
      },
    });
  }

  function closeOverlay() {
    if (!overlayWrapRef.current || !overlayFillRef.current) {
      setOpen(false);
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    // 1) Fade out actions (Buscar / ✕) and the input text (not the bar)
    const fadeFirst: any[] = [];
    if (actionsRef.current) fadeFirst.push(actionsRef.current);
    if (fadeFirst.length) tl.to(fadeFirst, { autoAlpha: 0, duration: 0.15 });
    if (inputRef.current) {
      if (fadeFirst.length) tl.to(inputRef.current, { color: 'rgba(0,0,0,0)', duration: 0.15 }, '<');
      else tl.to(inputRef.current, { color: 'rgba(0,0,0,0)', duration: 0.15 });
    }
    // 2) Then fade out results
    if (resultsRef.current) {
      tl.to(resultsRef.current, { autoAlpha: 0, duration: 0.2 }, ">");
    }
    // 3) Fade out the white overlay (no height jump)
    tl.to(overlayFillRef.current, { opacity: 0, duration: 0.35 }, ">");
    // 4) Cleanup and restore bar with placeholder
    tl.add(() => {
      // Reset state
      setQ("");
      setResults([]);
      if (inputRef.current) inputRef.current.value = "";

      setOpen(false);
      overlayWrapRef.current!.style.visibility = 'hidden';
      overlayWrapRef.current!.style.pointerEvents = 'none';
      if (resultsRef.current) gsap.set(resultsRef.current, { autoAlpha: 0 });
      if (actionsRef.current) gsap.set(actionsRef.current, { autoAlpha: 0 });
  if (inputRef.current) gsap.set(inputRef.current, { clearProps: 'color' });
      // Ensure the search bar stays visible (placeholder state)
      if (inputWrapRef.current) gsap.set(inputWrapRef.current, { autoAlpha: 1 });
      // Reset for next open (start collapsed but with full opacity so we animate scale on open)
      gsap.set(overlayFillRef.current!, { scaleY: 0, opacity: 1, transformOrigin: '50% 100%' });
    });
  }

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    // keep overlay open to show results
  }

  // Debounced query
  const debouncedQ = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      const term = debouncedQ;
      if (!term || term.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=24`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search_failed");
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [debouncedQ, open]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayWrapRef}
        aria-hidden={!open}
        className="fixed inset-0 z-[60]"
        style={{ visibility: 'hidden', pointerEvents: 'none' }}
      >
        <div
          ref={overlayFillRef}
          onClick={closeOverlay}
          className="absolute inset-0 bg-white transform-gpu will-change-[transform] z-[60]"
        />
      </div>

      {/* Search bar */}
      <div className={`container mx-auto max-w-7xl px-0 pt-10 pb-6 ${open ? 'relative z-[61]' : ''}`}>
  <form onSubmit={submitSearch} className="w-full" autoComplete="off">
          <label className="sr-only" htmlFor="search">Busca un título...</label>

          <div ref={inputWrapRef} className="relative w-full">
            <div ref={inputGroupRef}>
              <input
                ref={inputRef}
                id="search"
                placeholder="Busca un título..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={openOverlay}
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                inputMode="search"
                className={[
                  "w-full rounded-2xl py-4 text-2xl font-medium ls--3",
                  open ? "border-none bg-white focus:text-black" : "border-none bg-white/60 focus:text-black",
                  open ? "placeholder:text-[#ACACAC]" : "placeholder:text-lucero-light",
                  "focus:outline-none transition-colors duration-300 ease-in-out",
                  open ? "pl-5 pr-52" : "px-5",
                ].join(" ")}
                role="searchbox"
                aria-expanded={open}
              />

              {/* Right side actions */}
              <div ref={actionsRef} className="pointer-events-none absolute inset-0 flex items-center justify-end gap-4 px-3">
                <span
                  className={[
                    "select-none text-black text-2xl font-medium ls--3 transition-opacity duration-300 ease-in-out",
                    open ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  aria-hidden={!open}
                >
                  Buscar
                </span>
                <button
                  type="button"
                  onClick={closeOverlay}
                  className={[
                    "pointer-events-auto px-2 py-1 text-lg transition-opacity duration-300 ease-in-out",
                    open ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  aria-label="Cerrar búsqueda"
                  title="Cerrar (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Results positioned absolutely under input to prevent layout jump */}
            <div
              ref={resultsRef}
              className={[
                "absolute left-0 right-0",
                open ? "top-full mt-6 z-[61] pointer-events-auto" : "hidden",
              ].join(" ")}
            >
              <div className="px-6">
                {loading && <div className="py-4 text-neutral-500">Buscando…</div>}
                {!loading && q.trim().length >= 2 && results.length === 0 && (
                  <div className="py-4 text-neutral-500">Sin resultados</div>
                )}
                {!loading && results.length > 0 && (
                  <div className="-mx-2 flex flex-wrap">
                    {results.map((b) => {
                      let cover = b.coverUrl || b.bookCover || "";
                      if (!cover && Array.isArray(b.images) && (b.images as any[]).length) {
                        const first = (b.images as any[])[0] as any;
                        cover = typeof first === "string" ? first : first?.url || "";
                      }
                      if (!cover) cover = "https://placehold.co/300x400";
                      const priceNum = (b.digitalPrice ?? b.physicalPrice ?? 0) as number;
                      const price = `$${priceNum.toFixed(2)}`;
                      return (
                        <div key={b.id} className="w-full px-2 mb-6 sm:w-1/2 md:w-1/3 lg:w-1/4">
                          <BookTile id={b.id} title={b.title} image={cover} price={price} description={b.description ?? ""} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

  {/* Results were moved inside inputWrapRef (absolute) to avoid layout shift */}

      <style jsx>{`
        input::placeholder { transition: color 300ms ease-in-out; }
      `}</style>
    </>
  );
}
