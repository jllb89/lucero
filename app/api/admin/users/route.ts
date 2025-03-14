import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || 10;
    const skip = (page - 1) * perPage;

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      skip,
      take: perPage,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        address: true,
        createdAt: true,
      },
    });

    // Get total user count for pagination
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / perPage),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
