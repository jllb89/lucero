import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth"; // 🔒 New authentication function

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("📩 Received book upload request from", user.email);

    const { title, author, bookFile } = await req.json();
    if (!bookFile) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

    const bookId = crypto.randomUUID();
    const filePath = `books/${bookId}.pdf`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    console.log("📤 Uploading book to Firebase...");
    await file.save(Buffer.from(bookFile.split(",")[1], "base64"), {
      contentType: "application/pdf",
    });

    console.log("✅ Book uploaded. Saving in database...");
    const newBook = await prisma.book.create({
      data: { id: bookId, title, author, bookFile: filePath },
    });

    return NextResponse.json({ book: newBook });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
