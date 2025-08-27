"use client";

import { useCart } from "@/hooks/useCart";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const bucket = process.env.NEXT_PUBLIC_FIREBASE_BUCKET;
const toPublicUrl = (src?: string) => {
	if (!src) return undefined;
	if (/^https?:\/\//i.test(src)) return src;
	return `https://storage.googleapis.com/${bucket}/${src}`;
};

export default function Cart({ isOpen = false }: { isOpen?: boolean }) {
	const { items, subtotal, count, setQty, remove, clear } = useCart();
	const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
	const prevIdsRef = useRef<Set<string>>(new Set());

	const removeAnimated = (id: string) => {
		const el = itemRefs.current[id];
		if (!el) return remove(id);
		const h = el.offsetHeight;
		gsap.set(el, { height: h });
		gsap.to(el, {
			opacity: 0,
			height: 0,
			paddingTop: 0,
			paddingBottom: 0,
			marginTop: 0,
			marginBottom: 0,
			duration: 0.35,
			ease: "power2.inOut",
			onComplete: () => remove(id),
		});
	};

	const clearAnimated = () => {
		if (!items.length) return;
		const elements = items
			.map((i) => itemRefs.current[i.id])
			.filter((el): el is HTMLLIElement => !!el);
		if (!elements.length) return clear();
		// Set fixed heights for smooth collapse
		elements.forEach((el) => gsap.set(el, { height: el.offsetHeight }));
		const tl = gsap.timeline({ defaults: { duration: 0.35, ease: "power2.inOut" } });
		tl.to(elements, {
			opacity: 0,
			height: 0,
			paddingTop: 0,
			paddingBottom: 0,
			marginTop: 0,
			marginBottom: 0,
			stagger: 0.05,
		});
		tl.add(() => clear());
	};

	// Fade in newly added items when the cart is open
	useEffect(() => {
		const prev = prevIdsRef.current;
		if (!items || items.length === 0) {
			prevIdsRef.current = new Set();
			return;
		}
		const currentSet = new Set(items.map((i) => i.id));
		if (isOpen) {
			items.forEach((i) => {
				if (!prev.has(i.id)) {
					const el = itemRefs.current[i.id];
					if (el) {
						gsap.fromTo(
							el,
							{ opacity: 0 },
							{ opacity: 1, duration: 0.35, ease: "power2.out" }
						);
					}
				}
			});
		}
		prevIdsRef.current = currentSet;
	}, [items, isOpen]);

	if (items.length === 0) {
		return (
			<div className="rounded-xl p-2 text-sm text-neutral-600">No hay productos en el carrito.</div>
		);
	}

	return (
		<div className="rounded-xl p-2">
			<div className="mb-3 flex items-center justify-between text-sm text-neutral-600">
				<span>{count} artículos</span>
				<button className="text-xs underline" onClick={clearAnimated}>
					Vaciar carrito
				</button>
			</div>
			<ul className="divide-y">
				{items.map((it) => (
					<li
						key={it.id}
						ref={(el) => {
							itemRefs.current[it.id] = el;
						}}
						className="flex items-center justify-between gap-3 py-3"
					>
						<div className="flex items-center gap-3">
							{it.image ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={toPublicUrl(it.image)} alt={it.title} className="h-12 w-9 rounded object-cover" />
							) : null}
							<div>
								<div className="text-sm font-medium">{it.title}</div>
								<div className="text-xs text-neutral-600">${it.price.toFixed(2)}</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<input
								aria-label={`Cantidad para ${it.title}`}
								type="number"
								min={0}
								value={it.qty}
								onChange={(e) => {
									const next = Math.max(0, Number(e.target.value) || 0);
									if (next <= 0) removeAnimated(it.id);
									else setQty(it.id, next);
								}}
								className="w-12 rounded border px-2 py-1 text-right"
							/>
							<button className="text-xs underline" onClick={() => removeAnimated(it.id)}>
								Quitar
							</button>
						</div>
					</li>
				))}
			</ul>
			<div className="mt-4 flex items-center justify-between">
				<div className="text-sm text-neutral-600">Subtotal</div>
				<div className="text-lg font-medium">${subtotal.toFixed(2)}</div>
			</div>
		</div>
	);
}

