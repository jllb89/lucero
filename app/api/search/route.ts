import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Fuse, { type FuseResult } from "fuse.js";

export const dynamic = "force-dynamic";

type ResultBook = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  digitalPrice: number | null;
  physicalPrice: number | null;
  images: any;
  bookCover: string | null;
  category: "PRIMARIA" | "SECUNDARIA" | "BACHILLERATO" | "PARA_MAESTROS";
  coverUrl?: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qRaw = (searchParams.get("q") || "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10) || 24, 50);

    if (!qRaw || qRaw.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Normalize query (basic accent/diacritics insensitivity)
    const q = qRaw.normalize("NFD").replace(/\p{Diacritic}/gu, "");

    // Pre-filter on DB with broad ILIKE ORs to reduce payload size
    const like = `%${qRaw}%`;
    const books = await prisma.book.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: qRaw, mode: "insensitive" } },
          { author: { contains: qRaw, mode: "insensitive" } },
          { description: { contains: qRaw, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        digitalPrice: true,
        physicalPrice: true,
        images: true,
        bookCover: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

  // Fuzzy rank on server for typo tolerance and similarity
    const fuse = new Fuse(books, {
      includeScore: true,
      threshold: 0.38, // typo-friendly but precise
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: "title", weight: 0.55 },
        { name: "author", weight: 0.25 },
        { name: "description", weight: 0.2 },
      ],
      // Normalize accents in text
      getFn: (obj: any, path: string | string[]) => {
        let v: any = obj;
        const parts = Array.isArray(path) ? path : [path];
        for (const p of parts) {
          if (v == null) break;
          v = v[p as any];
        }
        if (typeof v !== "string") return v;
        return v.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      },
    });

    const ranked = fuse.search(q).slice(0, limit).map((r: FuseResult<ResultBook>) => r.item);

    // Build public cover URLs
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_BUCKET;
    const withPublic = ranked.map((b) => {
      let coverUrl: string | null = null;
      if (b.bookCover) {
        coverUrl = /^https?:\/\//i.test(b.bookCover)
          ? b.bookCover
          : bucket
            ? `https://storage.googleapis.com/${bucket}/${b.bookCover}`
            : null;
      }
      return { ...b, coverUrl } as ResultBook;
    });

    return NextResponse.json({ results: withPublic });
  } catch (e) {
    console.error("/api/search error", e);
    return NextResponse.json({ results: [], error: "search_failed" }, { status: 200 });
  }
}
