import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // ✅ Correct import for handling cookies
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  console.log("📩 Received login request for:", email);

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ User not found");
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  console.log("✅ User found:", user.email, "Role:", user.role);

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    console.log("❌ Password incorrect");
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  console.log("🔑 Password verified, creating token...");

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  console.log("✅ Token created:", token);

  const cookieStore = await cookies(); // ✅ Get the cookie object
  cookieStore.set("token", token, { 
    path: "/",
    httpOnly: true,
    maxAge: 604800, // 7 days
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // Secure in production only
  });
  

  console.log("🍪 Session cookie set in response");

  return NextResponse.json({ success: true, role: user.role });
}
