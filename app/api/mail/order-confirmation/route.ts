import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, orderId } = await req.json();

  const html = `<h1>Order Confirmation</h1><p>Your order #${orderId} has been placed.</p>`;

  const result = await sendMail(email, "Your Order Confirmation", html);

  return NextResponse.json(result);
}
