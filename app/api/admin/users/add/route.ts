import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendMail } from "@/lib/mailer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken"; // ✅ Import for JwtPayload type

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("📩 Received request to create a new user");

    // ✅ Retrieve token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.error("❌ Unauthorized: No token found in cookies");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify the token and assert type
    const decoded = verifyToken(token) as jwt.JwtPayload;

    if (!decoded || typeof decoded !== "object" || !("role" in decoded)) {
      console.error("❌ Forbidden: Invalid user token");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(decoded.role)) {
      console.error("❌ Forbidden: Insufficient privileges");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Extract request body
    const { name, email, password, role, phoneNumber, address } = await req.json();

    if (!email || !password || !role || !phoneNumber) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: "Phone number must be 10 digits." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const resetToken = crypto.randomUUID(); // 🔑 Token used in welcome email

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        phoneNumber,
        address,
        resetToken,
      },
    });

    // ✅ Send welcome email
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/set-password/${resetToken}`;
    const html = `
      <h2>¡Bienvenido a Editorial Lucero!</h2>
      <p>Se ha creado una cuenta para ti. Da clic en el siguiente enlace para establecer tu contraseña:</p>
      <p><a href="${link}" target="_blank">${link}</a></p>
    `;
    await sendMail(newUser.email, "Tu cuenta en Editorial Lucero", html);

    console.log("✅ User created and welcome email sent:", newUser.email);
    return NextResponse.json({ success: true, user: newUser });

  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
