import { NextResponse } from "next/server";

// Deprecated: covers are public via GCS URLs now.
export async function GET() {
  return NextResponse.json({ error: "Deprecated. Use public GCS cover URLs." }, { status: 410 });
}
