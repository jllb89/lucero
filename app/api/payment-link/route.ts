import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import crypto from "crypto";

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
    // Normalize and sort items for stable hashing
    const items: CartItem[] = [...body.items]
      .map((it) => ({ id: String(it.id), title: String(it.title), price: Number(it.price) || 0, qty: Math.max(1, Math.floor(Number(it.qty) || 1)) }))
      .sort((a, b) => a.id.localeCompare(b.id));

    // Resolve a robust base URL for redirects
    const envBase = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).replace(/\/$/, "");
    const baseUrl = (body.successUrl as string | undefined)?.startsWith("http")
      ? body.successUrl.replace(/\/$/, "")
      : envBase || "https://lucero-one.vercel.app";

    // Always append the Checkout Session ID placeholder so the confirmation page can fetch details
    const successUrl = `${baseUrl}/purchase-confirmation?session_id={CHECKOUT_SESSION_ID}`;

    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
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
    const booksMetadata = JSON.stringify(items.map((item) => ({ bookId: item.id, quantity: item.qty })));

    // Idempotency: use a cart hash to avoid duplicate links on retries
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ items, shipping }))
      .digest("hex");

    // For Payment Links, shipping_address_collection always requires the address if present
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      payment_method_types: ["card", "oxxo"],
      after_completion: { type: "redirect", redirect: { url: successUrl } },
      shipping_address_collection: { allowed_countries: ["MX"] },
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      metadata: { books: booksMetadata },
      // Optional: create a Stripe Customer for this checkout
      customer_creation: "always",
      allow_promotion_codes: true,
    } as any, { idempotencyKey: `pl_${hash}` });

    return NextResponse.json({ url: link.url, id: link.id });
  } catch (e: any) {
    console.error("/api/payment-link error", e);
    return NextResponse.json({ error: e?.message || "payment_link_failed" }, { status: 500 });
  }
}
