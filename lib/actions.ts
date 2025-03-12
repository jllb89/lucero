import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "secret_key";

export async function getUser() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

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

    return user;
  } catch {
    return null;
  }
}
