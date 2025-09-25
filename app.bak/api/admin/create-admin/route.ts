// app/api/auth/login/route.ts
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { sign } from '@/lib/jwt';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  console.log('📩 Received login request for:', email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('❌ User not found');
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  console.log('✅ User found:', user.email, 'Role:', user.role);

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    console.log('❌ Password incorrect');
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  console.log('🔑 Password verified, creating token...');

  const token = await sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);
  console.log('✅ Token created:', token);

  const response = NextResponse.json({ success: true, role: user.role });
  response.cookies.set('token', token, {
    path: '/',
    httpOnly: true,
    maxAge: 604800,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  console.log('🍪 Session cookie set in response');

  return response;
}
