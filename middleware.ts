// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from './lib/jwt';

export const config = {
  matcher: '/admin/:path*',
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  console.log('🍪 Token from cookie (Middleware):', token);

  if (req.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      console.log('🚨 No token found. Redirecting to /admin/login');
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      const decoded: any = await verify(token, process.env.JWT_SECRET!);
      console.log('✅ Token verified. User role:', decoded.role);

      if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
        console.log('⛔ Unauthorized role. Redirecting to /admin/login');
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    } catch (error) {
      console.log('❌ Invalid token. Redirecting to /admin/login');
      console.error(error);
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}
