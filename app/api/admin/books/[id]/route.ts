import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { storage } from "@/lib/firebaseAdmin";
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// ✅ Fetch a Single Book (GET)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
  const { id: bookId } = await context.params;

    // ✅ Retrieve token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify token
    const user = verifyToken(token);
    if (!user || typeof user !== "object" || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
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
    console.log(`📸 Images: ${book.images}`);

    return NextResponse.json(book);
  } catch (error) {
    console.error("❌ Failed to fetch book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// ✅ Update Book (PUT)
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
  const { id: bookId } = await context.params;

    // ✅ Retrieve token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify token
    const user = verifyToken(token);
    if (!user || typeof user !== "object" || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Extract updated fields (all optional), support multipart or JSON
    const ct = req.headers.get('content-type') || '';
    let title: string | undefined;
    let author: string | undefined;
    let description: string | undefined;
    let category: string | undefined;
    let physicalPrice: number | string | undefined;
    let digitalPrice: number | string | undefined;
    let bookCoverBuf: Buffer | null = null;
    let bookFileBuf: Buffer | null = null;

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      title = form.get('title')?.toString();
      author = form.get('author')?.toString();
      description = form.get('description')?.toString();
      category = form.get('category')?.toString();
      physicalPrice = form.get('physicalPrice')?.toString();
      digitalPrice = form.get('digitalPrice')?.toString();
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
      const body = await req.json();
      title = body.title;
      author = body.author;
      description = body.description;
      category = body.category;
      physicalPrice = body.physicalPrice;
      digitalPrice = body.digitalPrice;
      const b64Cover: string | null | undefined = body.bookCover;
      const b64File: string | null | undefined = body.bookFile;
      if (b64Cover) bookCoverBuf = Buffer.from(String(b64Cover).split(',')[1] || '', 'base64');
      if (b64File)  bookFileBuf  = Buffer.from(String(b64File).split(',')[1]  || '', 'base64');
    }

    console.log(`📤 Updating book ID: ${bookId}`);
    const data: Record<string, any> = {};
    const bucket = storage.bucket();

    if (typeof title !== 'undefined') data.title = title;
    if (typeof author !== 'undefined') data.author = author;
    if (typeof description !== 'undefined') data.description = description;
    if (typeof category !== 'undefined') data.category = category;
    if (typeof physicalPrice !== 'undefined') data.physicalPrice = Number(physicalPrice) || 0;
    if (typeof digitalPrice !== 'undefined') data.digitalPrice = Number(digitalPrice) || 0;

    // Optional asset updates
    if (bookCoverBuf) {
      const coverPath = `bookCovers/${bookId}.jpg`;
      console.log('🖼️  Updating cover at', coverPath, 'size=', bookCoverBuf.length);
      await bucket.file(coverPath).save(bookCoverBuf, { contentType: 'image/jpeg' });
      data.bookCover = coverPath;
    }
    if (bookFileBuf) {
      const filePath = `books/${bookId}.pdf`;
      console.log('📄  Updating PDF at', filePath, 'size=', bookFileBuf.length);
      await bucket.file(filePath).save(bookFileBuf, { contentType: 'application/pdf' });
      data.bookFile = filePath;
    }

    // ✅ Update book in DB
  const updatedBook = await prisma.book.update({ where: { id: bookId }, data });

    return NextResponse.json({ success: true, book: updatedBook });
  } catch (error) {
    console.error("❌ Failed to update book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
