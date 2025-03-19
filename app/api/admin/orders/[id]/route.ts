import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers"; // ✅ Must be used asynchronously

const prisma = new PrismaClient();

// ✅ Correct API Route Fix
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    // ✅ Correctly await params (per Next.js 15 documentation)
    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // ✅ Correctly await cookies() (per Next.js 15 documentation)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify token
    const user = verifyToken(token);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Extract updated order status
    const body = await req.json();
    const { status } = body;
    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    console.log(`🔄 Updating order status for ID: ${orderId} to ${status}`);

    // ✅ Update order in database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("❌ Failed to update order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
