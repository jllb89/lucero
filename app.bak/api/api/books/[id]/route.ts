import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user || (user as any).role !== 'ADMIN') {
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
      category: category || "PRIMARIA", // Use provided or default category
    },
  });

  return NextResponse.json(book);
}