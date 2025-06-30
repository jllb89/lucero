// /api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0, // Expire immediately
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  console.log("👋 Token cleared, user logged out");
  return NextResponse.json({ success: true });
}
