import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// ✅ Update Order Status (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;

    // ✅ Retrieve token from cookies
    const cookieStore = cookies();
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
    const { status } = await req.json();
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
