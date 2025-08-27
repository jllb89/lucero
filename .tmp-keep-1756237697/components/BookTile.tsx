"use client";

import { useId, useRef, useState, useLayoutEffect } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useCart } from "@/hooks/useCart";

const inter = Inter({ subsets: ["latin"] });

export type BookTileProps = {
    id: string;
    title: string;
    image: string;      // cover url
    price: string;      // e.g. "$200 MXN"
    description: string;

    /** Controlled API (optional) */
    expanded?: boolean;
    onToggle?: (next: boolean) => void;
};

export default function BookTile({
    id,
    title,
    image,
    price,
    description,
    expanded,
    onToggle,
}: BookTileProps) {
    const { add } = useCart();
    // Uncontrolled fallback for dev/test usage
    const [expandedUncontrolled, setExpandedUncontrolled] = useState(false);
    const isControlled = typeof expanded === "boolean";
    const isOpen = isControlled ? expanded! : expandedUncontrolled;

    const panelRef = useRef<HTMLDivElement | null>(null);
    const panelId = useId();

    // Height + opacity animation per-card
    useLayoutEffect(() => {
        const el = panelRef.current;
        if (!el) return;
        el.style.transition = "height 300ms ease, opacity 250ms ease";
        el.style.overflow = "hidden";

        if (isOpen) {
            const target = el.scrollHeight;
            el.style.height = target + "px";
            el.style.opacity = "1";
        } else {
            el.style.height = "0px";
            el.style.opacity = "0";
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (isControlled) {
            onToggle?.(!isOpen);
        } else {
            setExpandedUncontrolled((v) => !v);
        }
    };

    return (
        <div
            className={[
                "flex flex-col items-start rounded-[20px] bg-lucero-light hover:bg-lucero-light-hover p-6 transition-colors duration-300",
                "w-72 sm:w-80 md:w-72",
            ].join(" ")}
        >
            {/* cover */}
            <img
                src={image}
                alt={title}
                className="h-64 w-full rounded-[10px] object-cover"
            />

            {/* title */}
            <div className={["mt-4 text-xl font-regular text-black ls--3", inter.className].join(" ")}>
                {title}
            </div>

            {/* toggle description */}
            <button
                type="button"
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={handleToggle}
                className="mt-2 flex items-center gap-1 text-sm font-light text-neutral-600 underline"
            >
                {isOpen ? "Cerrar descripción" : "Leer descripción"}
                <Image
                    src="/arrow.svg"
                    alt=""
                    width={4}
                    height={8}
                    className={`h-2 w-auto transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
            </button>

            {/* expandable description */}
            <div
                id={panelId}
                ref={panelRef}
                className="mt-3 text-sm text-neutral-700"
                style={{ height: 0, opacity: 0 }}
            >
                {description}
            </div>

            {/* divider */}
            <div className="mt-4 h-px w-full bg-zinc-300" />

            {/* price + add-to-cart */}
            <div className="mt-3 flex w-full items-center justify-between">
                <span className={["text-lg font-medium text-black ls--3", inter.className].join(" ")}>
                    {price}
                </span>
                <button
                    type="button"
                    className="rounded-full bg-lucero-light-hover px-4 py-2 text-sm font-medium text-black transition-colors duration-300 ease-in hover:bg-black hover:text-white"
                    aria-label="Agregar al carrito"
                    onClick={() => {
                        // Convert price like "$200" or "$200 MXN" to number 200
                        const numeric = Number(String(price).replace(/[^0-9.]/g, "")) || 0;
                        add({ id, title, price: numeric, image }, 1);
                    }}
                >
                    Agregar al carrito
                </button>
            </div>
        </div>
    );
}