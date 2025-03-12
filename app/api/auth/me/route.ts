import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret_key";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
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
                    title: true,
                    digitalPrice: true,
                    physicalPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
