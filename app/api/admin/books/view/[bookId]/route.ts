import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { storage } from "@/lib/firebaseAdmin";

const prisma = new PrismaClient();
const MAX_DEVICES = 3;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ bookId: string }> }
) {
  try {
    /* params are a Promise in Next 15 dynamic routes */
    const { bookId } = await context.params;

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required." },
        { status: 400 }
      );
    }

    /* ─────── auth ─────── */
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const user = verifyToken(token);
    if (!user || typeof user === "string") {
      return NextResponse.json({ error: "Invalid user token." }, { status: 403 });
    }

    /* ─────── device cap ─────── */
    const deviceId = req.headers.get("x-device-id") ?? undefined;
    if (!deviceId)
      return NextResponse.json({ error: "No device ID supplied." }, { status: 400 });

    let device = await prisma.device.findFirst({
      where: { userId: user.id, deviceId },
    });

    if (!device) {
      const count = await prisma.device.count({ where: { userId: user.id } });
      if (count >= MAX_DEVICES)
        return NextResponse.json({ error: "DEVICE_LIMIT" }, { status: 403 });

      device = await prisma.device.create({
        data: { userId: user.id, deviceId },
      });
    }

    /* ─────── ownership check (skipped for SUPER_ADMIN) ─────── */
    if (user.role !== "SUPER_ADMIN") {
      const hasAccess = await prisma.orderItem.findFirst({
        where: {
          bookId,
          order: { userId: user.id }, // ← no status filter anymore
        },
      });

      if (!hasAccess) {
        return NextResponse.json({ error: "NO_ACCESS" }, { status: 403 });
      }
    }

    /* ─────── generate signed URL ─────── */
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || !book.bookFile) {
      return NextResponse.json(
        { error: "Book not found or missing file." },
        { status: 404 }
      );
    }

    const [url] = await storage
      .bucket()
      .file(book.bookFile)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 5 * 60 * 1000,
        responseDisposition: "inline",
      });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("❌ view-book route error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
