import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email, name, bookTitle } = await req.json();

    if (!email || !bookTitle) {
      return NextResponse.json({ error: "Missing email or book title" }, { status: 400 });
    }

    const html = `
  <h1>Acceso concedido</h1>
  <p>Hola${name ? ` ${name}` : ""},</p>
  <p>Se te ha concedido acceso al libro <strong>${bookTitle}</strong> en nuestra plataforma de Editorial Lucero.</p>
  <p>Inicia sesión para leerlo en tu panel de usuario:</p>
  <p><a href="${process.env.NEXT_PUBLIC_API_URL}/login">${process.env.NEXT_PUBLIC_API_URL}/login</a></p>
`;


    const result = await sendMail(email, "Acceso a libro concedido", html);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("❌ Error sending book-granted email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
