import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalSales = await prisma.order.aggregate({
      _sum: { total: true },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    const totalBooks = await prisma.book.count();

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json({
      totalSales: totalSales._sum.total || 0,
      pendingOrders,
      totalBooks,
      recentOrders: recentOrders.map((order: { id: string; user: { email: string }; total: number; status: string; createdAt: Date }) => ({
        id: order.id,
        userEmail: order.user.email,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
