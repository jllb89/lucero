import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    /* ───── Auth ───── */
    console.log("📩  Upload request received");

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      console.error("❌  Unauthorized – no token cookie");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    console.log("🔍  Token payload:", user);
    if (!user || typeof user === "string" || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      console.error("❌  Forbidden – user role not allowed");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ───── Parse body ───── */
    const body = await req.json();
    const {
      title, author, description = "",
      category, bookFile, bookCover,
      digitalPrice = 0, physicalPrice = 0, stock = 0,
      bookImages,
    } = body;

    console.log("📝  Parsed fields:", {
      title, author, category, digitalPrice, physicalPrice, stock,
      hasBookFile: !!bookFile, hasBookCover: !!bookCover,
    });

    if (!bookFile) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });

    /* ───── Upload to Firebase Storage ───── */
    const bookId = crypto.randomUUID();
    const bucket = storage.bucket();

    const bookFilePath = `books/${bookId}.pdf`;
    const bookFileRef  = bucket.file(bookFilePath);

    console.log("📤  Uploading PDF to", bookFilePath);
    await bookFileRef.save(Buffer.from(bookFile.split(",")[1], "base64"), {
      contentType: "application/pdf",
    });

    let bookCoverPath = "";
    if (bookCover) {
      bookCoverPath = `bookCovers/${bookId}.jpg`;
      console.log("📤  Uploading cover to", bookCoverPath);
      await bucket
        .file(bookCoverPath)
        .save(Buffer.from(bookCover.split(",")[1], "base64"), { contentType: "image/jpeg" });
    }

    /* ───── Write DB row ───── */
    console.log("💾  Writing record to Postgres (Book.id = %s)", bookId);
    const newBook = await prisma.book.create({
      data: {
        id:          bookId,
        title,
        author,
        description,
        category,
        bookFile:    bookFilePath,
        bookCover:   bookCoverPath,
        digitalPrice,
        physicalPrice,
        stock,
        images: bookImages?.length ? JSON.stringify(bookImages) : "[]",
      },
    });

    console.log("✅  Book saved:", newBook.id);
    return NextResponse.json({ book: newBook });
  } catch (err) {
    /* Log full Prisma, validation, or file errors */
    console.error("💥  Upload failed:", err);

    // Attempt to delete orphaned PDF if it exists
    if (err && typeof err === "object" && "bookFilePath" in err) {
      try {
        await storage.bucket().file((err as any).bookFilePath).delete();
        console.warn("🧹  Orphaned file removed:", (err as any).bookFilePath);
      } catch {
        console.warn("⚠️  Could not delete orphaned file; may not exist yet.");
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
