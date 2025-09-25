import { NextResponse } from "next/server";

// Simple health endpoint for /api/cover until implemented
export async function GET() {
	return NextResponse.json({ ok: true });
}

