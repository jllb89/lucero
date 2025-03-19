import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// ✅ Fetch a Single Book (GET)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookId = params.id;

    // ✅ Retrieve token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify token
    const user = verifyToken(token);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`📖 Fetching book details for ID: ${bookId}`);

    // ✅ Fetch book
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // ✅ Log book details to debug file data
    console.log("📂 Book Details Retrieved:");
    console.log(`📚 Title: ${book.title}`);
    console.log(`📖 File Path: ${book.bookFile}`);
    console.log(`🖼️ Cover Path: ${book.bookCover}`);
    console.log(`📸 Images: ${book.bookImages}`);

    return NextResponse.json(book);
  } catch (error) {
    console.error("❌ Failed to fetch book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// ✅ Update Book (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookId = params.id; // ✅ Fixed param retrieval

    // ✅ Retrieve token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify token
    const user = verifyToken(token);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Extract updated book data
    const { title, author, description, category, physicalPrice, digitalPrice } = await req.json();

    console.log(`📤 Updating book ID: ${bookId}`);

    // ✅ Update book in DB
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title,
        author,
        description,
        category,
        physicalPrice,
        digitalPrice,
      },
    });

    return NextResponse.json({ success: true, book: updatedBook });
  } catch (error) {
    console.error("❌ Failed to update book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
