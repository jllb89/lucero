import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id: userId } = await context.params; // ✅ await context.params
    const body = await req.json();
    const { bookId } = body;

    if (!bookId || !userId) {
      return NextResponse.json({ error: "Missing userId or bookId" }, { status: 400 });
    }

    const cookieStore = await cookies(); // ✅ await cookies()
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [pendingOrder] = await prisma.order.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      take: 1,
    });

    const orderId = pendingOrder
      ? pendingOrder.id
      : (
          await prisma.order.create({
            data: {
              userId,
              total: 0,
              status: "PENDING",
              createdAt: new Date(),
            },
          })
        ).id;

    // 🛑 Prevent duplicate book access
    const existing = await prisma.orderItem.findFirst({
      where: { orderId, bookId },
    });

    if (existing) {
      return NextResponse.json({ error: "Book already granted to user" }, { status: 400 });
    }

    await prisma.orderItem.create({
      data: {
        orderId,
        bookId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to add book:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
