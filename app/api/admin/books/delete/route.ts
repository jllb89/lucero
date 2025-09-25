import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
export const runtime = 'nodejs';

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

  if (!user || typeof user === "string" || !["ADMIN", "SUPER_ADMIN"].includes((user as any).role)) {
      console.error("❌ Forbidden: Invalid user role");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("✅ Token verified. Processing delete request...");

    // ✅ Extract book IDs from request
    const { bookIds } = await req.json();

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ error: "Invalid request. No book IDs provided." }, { status: 400 });
    }

    console.log("📌 Books requested for deletion:", bookIds);

    // 1) Figure out which books are referenced by orders (FK), and which are safe to hard-delete
    const referenced = await prisma.orderItem.findMany({
      where: { bookId: { in: bookIds } },
      select: { bookId: true },
    });
    const referencedIds = new Set(referenced.map((r) => r.bookId));
    const toSoftDelete = bookIds.filter((id: string) => referencedIds.has(id));
    const toHardDelete = bookIds.filter((id: string) => !referencedIds.has(id));

    console.log(`🧮 Partitioned - hardDelete: ${toHardDelete.length}, softDelete: ${toSoftDelete.length}`);

    const result = {
      hardDeletedIds: [] as string[],
      softDeactivatedIds: [] as string[],
      failedIds: [] as string[],
    };

    // 2) Soft delete (deactivate) books that are referenced
    if (toSoftDelete.length) {
      await prisma.book.updateMany({
        where: { id: { in: toSoftDelete } },
        data: { active: false },
      });
      result.softDeactivatedIds.push(...toSoftDelete);
      console.log("🟡 Soft-deactivated (active=false):", toSoftDelete);
    }

    // 3) Hard delete: remove files then delete DB rows
    if (toHardDelete.length) {
      // Fetch file paths only for those we will hard-delete
      const booksToDelete = await prisma.book.findMany({
        where: { id: { in: toHardDelete } },
        select: { id: true, bookFile: true, bookCover: true },
      });

  const bucket = getStorage().bucket();

      for (const book of booksToDelete) {
        // Try deleting assets first; log but don't fail the entire operation
        if (book.bookFile) {
          const bookFileRef = bucket.file(book.bookFile);
          await bookFileRef
            .delete()
            .catch((err) => console.warn(`⚠️ Failed to delete book file ${book.bookFile}:`, err));
        }
        if (book.bookCover) {
          const bookCoverRef = bucket.file(book.bookCover);
          await bookCoverRef
            .delete()
            .catch((err) => console.warn(`⚠️ Failed to delete book cover ${book.bookCover}:`, err));
        }
      }

      // Now delete DB rows for hard delete
      const deleteRes = await prisma.book.deleteMany({ where: { id: { in: toHardDelete } } });
      console.log(`🗑️ Hard-deleted ${deleteRes.count} books.`);
      result.hardDeletedIds.push(...toHardDelete);
    }

    // 4) Return a detailed response for the UI
    const totalHandled = result.hardDeletedIds.length + result.softDeactivatedIds.length;
    console.log(`✅ Delete request processed. Hard-deleted: ${result.hardDeletedIds.length}, Soft-deactivated: ${result.softDeactivatedIds.length}`);
    return NextResponse.json({
      message:
        totalHandled === bookIds.length
          ? "Delete completed"
          : "Delete completed with some issues",
      ...result,
    });

  } catch (error) {
    console.error("❌ Delete operation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
