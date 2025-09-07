import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/orders
// Body: { userId, email, shippingAddress, isDigitalOnly, total, books: [{ bookId }], status, source }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, shippingAddress, isDigitalOnly, total, books, status, source } = body;
    if (!books || !Array.isArray(books) || books.length === 0) {
      return NextResponse.json({ error: "Missing books" }, { status: 400 });
    }
    // Prevent order creation for Stripe checkouts; only webhook should create these
    if (source === "stripe" || source === "STRIPE") {
      return NextResponse.json({ error: "Orders for Stripe must be created by the webhook." }, { status: 400 });
    }
    // ...existing code for non-Stripe orders...
    const order = await prisma.order.create({
      data: {
        userId,
        email,
        shippingAddress,
        isDigitalOnly: !!isDigitalOnly,
        total,
        status: status || "COMPLETED",
        source: source || "manual",
        orderItems: {
          create: books.map((b: { bookId: string }) => ({ bookId: b.bookId })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Trigger notification email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/mail/new-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
    } catch (e) {
      console.error("❌ Failed to trigger new order email:", e);
    }

    return NextResponse.json({ id: order.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "order_create_failed" }, { status: 500 });
  }
}
