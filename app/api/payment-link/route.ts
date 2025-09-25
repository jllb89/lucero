import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type CartItem = {
  id: string;
  title: string;
  price: number; // MXN
  qty: number;
};

// POST /api/payment-link
// Body: { items: CartItem[], successUrl?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const items: CartItem[] = body.items;

    // Base success URL (previous behavior) but append session_id placeholder
    const base = body.successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/purchase-confirmation`;
    const successUrl = base.includes("?")
      ? `${base}&session_id={CHECKOUT_SESSION_ID}`
      : `${base}?session_id={CHECKOUT_SESSION_ID}`;

    const subtotal = items.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * Math.max(1, Math.floor(it.qty || 1)),
      0
    );
    const shipping = 100; // flat MXN
    const total = Math.max(0, Math.round((subtotal + shipping) * 100)); // in cents

    // Create a one-off product + price for this order total
    const product = await stripe.products.create({ name: `Orden ${new Date().toISOString()}` });
    const price = await stripe.prices.create({
      unit_amount: total,
      currency: "mxn",
      product: product.id,
    });

    // Add book IDs and quantities as metadata
    const booksMetadata = JSON.stringify(
      items.map((item) => ({ bookId: item.id, quantity: item.qty }))
    );

    // For Payment Links, shipping_address_collection always requires the address if present
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      payment_method_types: ["card", "oxxo"],
      after_completion: { type: "redirect", redirect: { url: successUrl } },
      shipping_address_collection: { allowed_countries: ["MX"] },
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      metadata: { books: booksMetadata },
    } as any);

    // Log the full Payment Link object for debugging
    console.log("[payment-link] Created Payment Link:", link);

    // Return the full Payment Link object for debugging (remove in production)
    return NextResponse.json({
      url: link.url,
      id: link.id,
      shipping_address_collection: link.shipping_address_collection,
      billing_address_collection: link.billing_address_collection,
      metadata: link.metadata,
      full: link, // Remove or comment out in production
    });
  } catch (e: any) {
    console.error("/api/payment-link error", e);
    return NextResponse.json({ error: e?.message || "payment_link_failed" }, { status: 500 });
  }
}
