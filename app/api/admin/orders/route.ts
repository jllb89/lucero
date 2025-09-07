import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || 10;
    const skip = (page - 1) * perPage;

    // Fetch orders with pagination and include user email
    const orders = await prisma.order.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });
    // Attach quantity to each orderItem (should already be present if schema is correct)
    // No extra logic needed unless you want to sum or transform

    // Get total order count for pagination
    const totalOrders = await prisma.order.count();

    return NextResponse.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / perPage),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
