import { NextRequest, NextResponse } from "next/server";
import { verify } from "./lib/jwt";

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"], // ✅ Add /dashboard
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.pathname;

  console.log("🍪 Token from cookie (Middleware):", token);

  // Allow /admin/login and /login pages through
  if (url.startsWith("/admin/login") || url.startsWith("/login")) {
    return NextResponse.next();
  }

  if (!token) {
    console.log("🚨 No token. Redirecting.");
    const redirectPath = url.startsWith("/admin") ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  try {
    const decoded: any = await verify(token, process.env.JWT_SECRET!);
    console.log("✅ Token verified. Role:", decoded.role);

    // Admin route protection
    if (url.startsWith("/admin")) {
      if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
        console.log("⛔ Unauthorized role for /admin");
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Dashboard route protection
    if (url.startsWith("/dashboard")) {
      if (decoded.role !== "USER") {
        console.log("⛔ Unauthorized role for /dashboard");
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  } catch (error) {
    console.log("❌ Token verification failed.");
    console.error(error);
    const redirectPath = url.startsWith("/admin") ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  return NextResponse.next();
}
