import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;
  const role = (typeof user === 'object' && user && 'role' in user) ? (user as any).role : undefined;
  if (!role || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, author, description, digitalPrice, physicalPrice, stock, images, category } = await req.json();

  const book = await prisma.book.create({
    data: {
      title,
      author,
      description,
      digitalPrice,
      physicalPrice,
      stock,
      images,
      category: category ?? 'PRIMARIA',
    },
  });

  return NextResponse.json(book);
}