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
    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        email,
        shippingAddress,
        isDigitalOnly: !!isDigitalOnly,
        total,
        status: status || "COMPLETED",
        source: source || "stripe",
        orderItems: {
          create: books.map((b: { bookId: string }) => ({ bookId: b.bookId })),
        },
      },
      include: {
        orderItems: true,
      },
    });
    return NextResponse.json({ id: order.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "order_create_failed" }, { status: 500 });
  }
}
