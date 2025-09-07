import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendMail } from "@/lib/mailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { book: true } } },
  });
  if (!order || !order.email) {
    return NextResponse.json({ success: false, error: "Order or customer email not found" }, { status: 404 });
  }
  const products = order.orderItems.map(item => `${item.book.title}`).join(", ");
  const html = `
    <h1>¡Gracias por tu compra!</h1>
    <p>Hola ${order.name || "cliente"},</p>
    <p>Hemos recibido tu pedido y será procesado en un plazo máximo de <b>2 días hábiles</b>.</p>
    <p><b>Detalles del pedido:</b></p>
    <ul>
      <li><b>Productos:</b> ${products}</li>
      <li><b>Total:</b> $${order.total?.toFixed(2) || "-"}</li>
      <li><b>Dirección de envío:</b> ${order.shippingAddress || "-"}</li>
      <li><b>Fecha:</b> ${order.createdAt?.toLocaleString?.() || order.createdAt}</li>
    </ul>
    <p>Si tienes alguna duda, responde a este correo o contáctanos.</p>
    <hr/>
    <p>Gracias por confiar en Lucero. Pronto recibirás tu pedido.</p>
  `;
  const result = await sendMail(order.email, "Confirmación de tu pedido en Lucero", html);
  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: result.error });
  }
}