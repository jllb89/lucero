import { NextResponse } from "next/server";

// Deprecated in favor of /api/admin/books/view/[bookId] and public cover URLs.
export async function POST() {
  return NextResponse.json({ error: "Deprecated endpoint" }, { status: 410 });
}
