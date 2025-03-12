import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { orderId, customerEmail } = await req.json();
  const adminEmail = process.env.EMAIL_USER; // Admin email from .env

  if (!adminEmail) {
    console.error("❌ Admin email is not defined in the environment variables.");
    return NextResponse.json({ success: false, error: "Admin email is not defined." });
  }

  console.log(`📩 Sending order notification to: ${adminEmail}`);

  const html = `<h1>New Order Received</h1>
                <p>Order #${orderId} placed by ${customerEmail}.</p>`;

  const result = await sendMail(adminEmail, "New Order Notification", html);

  if (!result.success) {
    console.error("❌ Email sending failed:", result.error);
  }

  return NextResponse.json(result);
}