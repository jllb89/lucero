import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("🗑️ Received delete request");

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

    console.log("✅ Token verified. Processing delete request...");

    // ✅ Extract book IDs from request
    const { bookIds } = await req.json();

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ error: "Invalid request. No book IDs provided." }, { status: 400 });
    }

    console.log("📌 Books to delete:", bookIds);

    // ✅ Fetch books to get file paths before deletion
    const booksToDelete = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, bookFile: true, bookCover: true },
    });

    const bucket = storage.bucket();

    for (const book of booksToDelete) {
      // 🔥 Delete book file from Firebase
      if (book.bookFile) {
        const bookFileRef = bucket.file(book.bookFile);
        await bookFileRef.delete().catch((err) => console.warn(`⚠️ Failed to delete book file ${book.bookFile}:`, err));
      }

      // 🔥 Delete book cover from Firebase
      if (book.bookCover) {
        const bookCoverRef = bucket.file(book.bookCover);
        await bookCoverRef.delete().catch((err) => console.warn(`⚠️ Failed to delete book cover ${book.bookCover}:`, err));
      }
    }

    // ✅ Delete books from DB
    await prisma.book.deleteMany({
      where: { id: { in: bookIds } },
    });

    console.log("✅ Books deleted successfully.");
    return NextResponse.json({ message: "Books deleted successfully." });

  } catch (error) {
    console.error("❌ Delete operation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
