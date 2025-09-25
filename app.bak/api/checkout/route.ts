import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type CartItem = {
  id: string;
  title: string;
  price: number; // in MXN
  qty: number;
};

// POST /api/checkout
// Body: { items: CartItem[], successUrl?: string, cancelUrl?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const items: CartItem[] = body.items;
    const successUrl = body.successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/account`;
    const cancelUrl = body.cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout`;

    // Build line items from cart
    const line_items = items.map((it) => ({
      quantity: Math.max(1, Math.floor(it.qty || 1)),
      price_data: {
        currency: "mxn",
        unit_amount: Math.max(0, Math.round((it.price || 0) * 100)),
        product_data: { name: it.title },
      },
    }));

    // Flat shipping fee MXN 100
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "mxn",
        unit_amount: 10000, // $100.00 MXN
        product_data: { name: "Envío" },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "oxxo"],
      payment_method_options: {
        oxxo: { expires_after_days: 3 },
      },
      currency: "mxn",
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (e: any) {
    console.error("/api/checkout error", e);
    return NextResponse.json({ error: e?.message || "checkout_failed" }, { status: 500 });
  }
}
