import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    console.log("📥 Receiving books request...");
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || 10;
    const skip = (page - 1) * perPage;
    const search = searchParams.get("search") || "";

    console.log(`🔍 Fetching books - Page: ${page}, PerPage: ${perPage}, Search: "${search}"`);

    // Fetch books with pagination & search (only active)
    const books = await prisma.book.findMany({
      where: {
        active: true,
        title: { contains: search, mode: "insensitive" },
      },
      skip,
      take: perPage,
      select: {
        id: true,
        title: true,
        digitalPrice: true,
        physicalPrice: true,
        createdAt: true,
        active: true,
      },
    });

    // Count total books
    const totalBooks = await prisma.book.count({
      where: { active: true, title: { contains: search, mode: "insensitive" } },
    });

    console.log(`✅ Fetched ${books.length} books`);

    return NextResponse.json({
      books,
      totalBooks,
      totalPages: Math.ceil(totalBooks / perPage),
      currentPage: page,
    });
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}
