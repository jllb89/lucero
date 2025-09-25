// /api/auth/me/route.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret_key";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            orderItems: {
              select: {
                id: true,
                book: {
                  select: {
                    id: true,
                    title: true,
                    digitalPrice: true,
                    physicalPrice: true,
                    bookCover: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ /api/auth/me failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
