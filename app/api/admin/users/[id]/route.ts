import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// ✅ Fetch a Single User (GET)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // ✅ Await params correctly
  const { id: userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // ✅ Await the cookies function
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify token
    const user = verifyToken(token as string);
    const role = (typeof user === 'object' && user && 'role' in user) ? (user as any).role : undefined;
    if (!role || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`👤 Fetching user details for ID: ${userId}`);

    // ✅ Fetch user details and related books
    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                book: true, // ✅ Fetch the books linked to the user's orders
              },
            },
          },
        },
      },
    });

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Extract user's digital book access
    const books = userDetails.orders.flatMap((order) =>
      order.orderItems.map((orderItem) => ({
        id: orderItem.book.id,
        label: orderItem.book.title,
      }))
    );

    console.log(`✅ User ${userDetails.email} has access to ${books.length} books.`);

    return NextResponse.json({ ...userDetails, books }); // ✅ Return books along with user details
  } catch (error) {
    console.error("❌ Failed to fetch user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Add this below your GET handler

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
  const { id: userId } = await context.params;
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

    const updates = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    console.log(`✅ Updated user ${userId}`);
    return NextResponse.json({ success: true, user: updatedUser }); // ✅ Returns valid JSON
  } catch (error) {
    console.error("❌ Failed to update user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
