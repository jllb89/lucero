import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { orderId } = await req.json();
  const adminEmails = (process.env.ORDER_NOTIFY_EMAILS || process.env.EMAIL_USER || "").split(",").map(e => e.trim()).filter(Boolean);
  if (!adminEmails.length) {
    return NextResponse.json({ success: false, error: "No admin emails defined." });
  }

  // Fetch order and related info
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { book: true } },
    },
  });
  if (!order) {
    return NextResponse.json({ success: false, error: "Order not found." });
  }

  const products = order.orderItems.map(item => `${item.book.title}`).join(", ");
  const html = `
    <h1>Nuevo pedido recibido</h1>
    <p><b>Cliente:</b> ${order.name || "-"}</p>
    <p><b>Email:</b> ${order.email || "-"}</p>
    <p><b>Teléfono:</b> ${order.phoneNumber || "-"}</p>
    <p><b>Dirección:</b> ${order.shippingAddress || "-"}</p>
    <p><b>Productos:</b> ${products}</p>
    <p><b>Total:</b> $${order.total?.toFixed(2) || "-"}</p>
    <p><b>Fecha:</b> ${order.createdAt?.toLocaleString?.() || order.createdAt}</p>
    <hr/>
    <p>Este es un aviso automático del sistema Lucero.</p>
  `;

  let allOk = true;
  for (const email of adminEmails) {
    const result = await sendMail(email, "Nuevo pedido recibido", html);
    if (!result.success) {
      allOk = false;
    }
  }
  return NextResponse.json({ success: allOk });
}