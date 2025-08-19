import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const link = `${process.env.NEXT_PUBLIC_API_URL}/set-password/${token}`;

    const html = `
      <div style="font-family: sans-serif; font-size: 16px; color: #111">
        <h2>Bienvenido a Editorial Lucero</h2>
        <p>Una cuenta en nuestro portal ha sido creada para ti.</p>
        <p>
          Haz clic en el siguiente enlace para establecer tu contraseña y acceder a tu cuenta:
          <br/>
          <a href="${link}" style="color: #0055ff">${link}</a>
        </p>
        <br/>
        <p>Si no reconoces esta acción, por favor ignora este correo.</p>
      </div>
    `;

    const result = await sendMail(email, "Tu acceso a Editorial Lucero", html);

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
