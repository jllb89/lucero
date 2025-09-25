import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// ✅ Remove book access from user (DELETE)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
  const { id: userId } = await context.params;
    const body = await req.json();
    const { bookId } = body;

    // 🔐 Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token as string);
    const role = (typeof user === 'object' && user && 'role' in user) ? (user as any).role : undefined;
    if (!role || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🗑️ Delete the OrderItem (only the book, not the full order)
    const deleted = await prisma.orderItem.deleteMany({
      where: {
        bookId,
        order: {
          userId: userId,
        },
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "No matching book found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to remove book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
