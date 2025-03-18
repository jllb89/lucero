import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("📩 Received book upload request");
    const { title, author, bookFile } = await req.json();

    if (!bookFile) {
      console.log("❌ No file uploaded. Rejecting request.");
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const bookId = crypto.randomUUID();
    const filePath = `books/${bookId}.pdf`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    console.log("📤 Uploading book to Firebase Storage...");
    await file.save(Buffer.from(bookFile, "base64"), {
      contentType: "application/pdf",
    });

    console.log("✅ Book uploaded. Saving in database...");
    const newBook = await prisma.book.create({
      data: { id: bookId, title, author, bookFile: filePath },
    });

    console.log("📚 Book saved successfully in DB");
    return NextResponse.json({ book: newBook });

  } catch (error) {
    console.error("❌ Error uploading book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
