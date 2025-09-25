import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/orders/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const { id: orderId } = await params;
	if (!orderId) {
		return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
	}
	try {
			const order = await prisma.order.findUnique({
				where: { id: orderId },
				include: {
					orderItems: {
						include: {
							book: true,
						},
					},
				},
			});
			if (!order) {
				return NextResponse.json({ error: "Order not found" }, { status: 404 });
			}
			const books = order.orderItems.map((item: any) => ({
				id: item.book.id,
				title: item.book.title,
			}));
			return NextResponse.json({
				id: order.id,
				userId: order.userId,
				total: order.total,
				createdAt: order.createdAt,
				status: order.status,
				email: order.email,
				isDigitalOnly: order.isDigitalOnly,
				shippingAddress: order.shippingAddress,
				books,
			});
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || "order_fetch_failed" }, { status: 500 });
	}
}
