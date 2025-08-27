"use client";

import { useCart } from "@/hooks/useCart";

export default function Cart() {
	const { items, subtotal, count, setQty, remove, clear } = useCart();

	if (items.length === 0) {
		return (
			<div className="rounded-xl border p-4 text-sm text-neutral-600">No hay productos en el carrito.</div>
		);
	}

	return (
		<div className="rounded-xl border p-4">
			<div className="mb-3 text-sm text-neutral-600">{count} artículos</div>
			<ul className="divide-y">
				{items.map((it) => (
					<li key={it.id} className="flex items-center justify-between gap-3 py-3">
						<div className="flex items-center gap-3">
							{it.image ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={it.image} alt={it.title} className="h-12 w-9 rounded object-cover" />
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
								onChange={(e) => setQty(it.id, Math.max(0, Number(e.target.value) || 0))}
								className="w-16 rounded border px-2 py-1 text-right"
							/>
							<button className="text-sm underline" onClick={() => remove(it.id)}>
								Quitar
							</button>
						</div>
					</li>
				))}
			</ul>
			<div className="mt-4 flex items-center justify-between">
				<button className="text-sm underline" onClick={clear}>
					Vaciar carrito
				</button>
				<div className="text-right">
					<div className="text-sm text-neutral-600">Subtotal</div>
					<div className="text-lg font-medium">${subtotal.toFixed(2)}</div>
				</div>
			</div>
		</div>
	);
}

