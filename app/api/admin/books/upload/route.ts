import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = 'nodejs';

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

    const ct = req.headers.get('content-type') || '';
    let title = '' as string;
    let author = '' as string;
    let description = '' as string;
    let category = '' as string;
    let physicalPrice = 0 as number;
    let digitalPrice = 0 as number;
    let stock = 0 as number;
    let bookCoverBuf: Buffer | null = null;
    let bookFileBuf: Buffer | null = null;
    let bookImages: any[] | undefined = undefined;

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      title = String(form.get('title') || '');
      author = String(form.get('author') || '');
      description = String(form.get('description') || '');
      category = String(form.get('category') || '');
      physicalPrice = Number(form.get('physicalPrice') || 0) || 0;
      digitalPrice = Number(form.get('digitalPrice') || 0) || 0;
      stock = Number(form.get('stock') || 0) || 0;
      const cover = form.get('bookCover');
      const pdf = form.get('bookFile');
      if (cover && typeof cover !== 'string') {
        const ab = await (cover as File).arrayBuffer();
        bookCoverBuf = Buffer.from(ab);
      }
      if (pdf && typeof pdf !== 'string') {
        const ab = await (pdf as File).arrayBuffer();
        bookFileBuf = Buffer.from(ab);
      }
    } else {
      // Fallback: JSON base64
      const body = await req.json();
      title = body.title;
      author = body.author;
      description = body.description ?? '';
      category = body.category;
      physicalPrice = Number(body.physicalPrice || 0) || 0;
      digitalPrice = Number(body.digitalPrice || 0) || 0;
      stock = Number(body.stock || 0) || 0;
      bookImages = body.bookImages;
      const b64Cover: string | null | undefined = body.bookCover;
      const b64File: string | null | undefined = body.bookFile;
      if (b64Cover) bookCoverBuf = Buffer.from(String(b64Cover).split(',')[1] || '', 'base64');
      if (b64File)  bookFileBuf  = Buffer.from(String(b64File).split(',')[1]  || '', 'base64');
    }

    console.log("📝  Parsed fields:", {
      title, author, category, digitalPrice, physicalPrice, stock,
      hasBookFile: !!bookFileBuf, hasBookCover: !!bookCoverBuf,
    });

  if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });

    /* ───── Upload to Firebase Storage ───── */
    const bookId = crypto.randomUUID();
  const bucket = getStorage().bucket();

    let bookFilePath = "";
    if (bookFileBuf) {
      bookFilePath = `books/${bookId}.pdf`;
      const bookFileRef = bucket.file(bookFilePath);
      console.log("📤  Uploading PDF to", bookFilePath);
      await bookFileRef.save(bookFileBuf, { contentType: "application/pdf" });
    }

    let bookCoverPath = "";
    if (bookCoverBuf) {
      bookCoverPath = `bookCovers/${bookId}.jpg`;
      console.log("📤  Uploading cover to", bookCoverPath);
      await bucket.file(bookCoverPath).save(bookCoverBuf, { contentType: "image/jpeg" });
    }

    /* ───── Write DB row ───── */
    console.log("💾  Writing record to Postgres (Book.id = %s)", bookId);
    const newBook = await prisma.book.create({
      data: {
        id:          bookId,
        title,
        author,
        description,
        category: category as any,
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
  await getStorage().bucket().file((err as any).bookFilePath).delete();
        console.warn("🧹  Orphaned file removed:", (err as any).bookFilePath);
      } catch {
        console.warn("⚠️  Could not delete orphaned file; may not exist yet.");
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
