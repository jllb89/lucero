import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// /api/orders/confirmation?orderId=... or /api/orders/confirmation?email=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const email = searchParams.get("email");

  if (orderId) {
    // Fetch by orderId
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { book: true } },
      },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({
      id: order.id,
      books: order.orderItems.map((item: any) => item.book.title).join(", "),
      shippingAddress: order.shippingAddress,
      total: order.total,
      createdAt: order.createdAt,
      status: order.status,
      email: order.email,
    });
  }

  if (email) {
    // Fetch latest order by email
    const order = await prisma.order.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: { include: { book: true } },
      },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({
      id: order.id,
      books: order.orderItems.map((item: any) => item.book.title).join(", "),
      shippingAddress: order.shippingAddress,
      total: order.total,
      createdAt: order.createdAt,
      status: order.status,
      email: order.email,
    });
  }

  return NextResponse.json({ error: "Missing orderId or email" }, { status: 400 });
}
