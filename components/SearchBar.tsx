'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const overlayWrapRef = useRef<HTMLDivElement | null>(null);
  const overlayFillRef = useRef<HTMLDivElement | null>(null);
  const inputRef       = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Lock body scroll when open
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
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
        requestAnimationFrame(() => inputRef.current?.focus());
      },
    });
  }

  function closeOverlay() {
    if (!overlayWrapRef.current || !overlayFillRef.current) {
      setOpen(false);
      return;
    }

    gsap.to(overlayFillRef.current, {
      duration: 0.45,
      opacity: 0,
      ease: 'power2.out',
      onComplete: () => {
        // Reset value so placeholder shows again
        if (inputRef.current) inputRef.current.value = "";

        setOpen(false);
        overlayWrapRef.current!.style.visibility = 'hidden';
        overlayWrapRef.current!.style.pointerEvents = 'none';
        gsap.set(overlayFillRef.current, { scaleY: 0, opacity: 1 });
      },
    });
  }

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    closeOverlay();
  }

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
          className="absolute inset-0 bg-white transform-gpu will-change-[transform]"
        />
      </div>

      {/* Search bar */}
      <div className={`container mx-auto max-w-7xl px-0 pt-10 pb-6 ${open ? 'relative z-[61]' : ''}`}>
        <form onSubmit={submitSearch} className="w-full">
          <label className="sr-only" htmlFor="search">Busca un título...</label>

          <div className="relative w-full">
            <input
              ref={inputRef}
              id="search"
              placeholder="Busca un título..."
              onFocus={openOverlay}
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
            <div className="pointer-events-none absolute inset-0 flex items-center justify-end gap-4 px-3">
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
        </form>
      </div>

      <style jsx>{`
        input::placeholder { transition: color 300ms ease-in-out; }
      `}</style>
    </>
  );
}
