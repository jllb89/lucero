import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name } = await req.json();

  const html = `<h1>Welcome, ${name}!</h1><p>Thank you for signing up.</p>`;

  const result = await sendMail(email, "Welcome to Lucero!", html);

  return NextResponse.json(result);
}
