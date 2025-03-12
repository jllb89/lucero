import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, resetLink } = await req.json();

  const html = `<h1>Password Reset</h1><p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;

  const result = await sendMail(email, "Password Recovery", html);

  return NextResponse.json(result);
}
