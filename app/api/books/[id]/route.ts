import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const user = verifyToken(req);
  if (!user || (user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, author, description, digitalPrice, physicalPrice, stock, images } = await req.json();

  const book = await prisma.book.create({
    data: {
      title,
      author,
      description,
      digitalPrice,
      physicalPrice,
      stock,
      images,
    },
  });

  return NextResponse.json(book);
}