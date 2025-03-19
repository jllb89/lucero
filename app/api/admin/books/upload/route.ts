import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("📩 Received upload request");

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

    console.log("✅ Token verified. Uploading book...");

    // ✅ Extract data from request
    const { title, author, description, category, bookFile, bookCover, bookImages, digitalPrice, physicalPrice, stock } = await req.json();

    if (!bookFile) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });

    const bookId = crypto.randomUUID();
    const bucket = storage.bucket();

    // ✅ Upload book file (PDF)
    const bookFilePath = `books/${bookId}.pdf`;
    const bookFileRef = bucket.file(bookFilePath);
    console.log("📤 Uploading book file...");
    await bookFileRef.save(Buffer.from(bookFile.split(",")[1], "base64"), {
      contentType: "application/pdf",
    });

    let bookCoverPath = "";
    if (bookCover) {
      // ✅ Upload book cover (Image)
      bookCoverPath = `bookCovers/${bookId}.jpg`;
      const bookCoverRef = bucket.file(bookCoverPath);
      console.log("📤 Uploading book cover...");
      await bookCoverRef.save(Buffer.from(bookCover.split(",")[1], "base64"), {
        contentType: "image/jpeg",
      });
    }

    console.log("✅ Book and cover uploaded. Saving in database...");

    const newBook = await prisma.book.create({
      data: { 
        id: bookId, 
        title, 
        author, 
        description: description || "", 
        category, 
        bookFile: bookFilePath, // ✅ Store book file path
        bookCover: bookCoverPath || "", // ✅ Store book cover path
        digitalPrice: digitalPrice || 0,
        physicalPrice: physicalPrice || 0, 
        stock: stock || 0, 
        images: bookImages?.length ? JSON.stringify(bookImages) : "[]",
      },
    });

    return NextResponse.json({ book: newBook });

  } catch (error) {
    console.error("❌ Upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
