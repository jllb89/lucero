import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/books?category=PRIMARIA&search=...&limit=12
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const category = searchParams.get("category");
		const search = searchParams.get("search") || "";
		const limit = Math.min(Number(searchParams.get("limit")) || 12, 48);

		const where: any = {
			active: true,
			title: { contains: search, mode: "insensitive" },
		};
		const validCategories = ["PRIMARIA", "SECUNDARIA", "BACHILLERATO", "PARA_MAESTROS"] as const;
		if (category && validCategories.includes(category as any)) {
			where.category = category;
		}

			const books = await prisma.book.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: limit,
			select: {
				id: true,
				title: true,
				description: true,
				digitalPrice: true,
				physicalPrice: true,
				images: true,
				bookCover: true,
				category: true,
			},
		});

			// Build public cover URLs using the configured public bucket
			const bucket = process.env.NEXT_PUBLIC_FIREBASE_BUCKET;
			const withPublic = books.map((b) => {
				let coverUrl: string | null = null;
				if (b.bookCover) {
					coverUrl = /^https?:\/\//i.test(b.bookCover)
						? b.bookCover
						: bucket
							? `https://storage.googleapis.com/${bucket}/${b.bookCover}`
							: null;
				}
				return { ...b, coverUrl };
			});

			return NextResponse.json({ books: withPublic });
	} catch (err) {
		console.error("/api/books GET error", err);
		return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
	}
}
