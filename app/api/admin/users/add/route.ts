import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

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

    // ✅ Verify the token
    const user = verifyToken(token);
    console.log("🔍 User from Token:", user);

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      console.error("❌ Forbidden: Invalid user role");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("✅ Token verified. Proceeding to create user...");

    // ✅ Extract data from request
    const { name, email, password, role, phoneNumber, address } = await req.json();

    // ✅ Validate required fields
    if (!email || !password || !role || !phoneNumber) {
      console.error("❌ Missing required fields.");
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    // ✅ Validate phone number format (Mexico - 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format. Must be 10 digits." }, { status: 400 });
    }

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 400 });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        phoneNumber,
        address,
      },
    });

    console.log("✅ User created successfully:", newUser.email);
    return NextResponse.json({ success: true, user: newUser });

  } catch (error) {
    console.error("❌ Failed to create user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
