"use client";

import Link   from "next/link";
import Image  from "next/image";
import { useUser } from "@/app/hooks/useUser";

/* build full GCS URL when the DB stores only the object path */
const bucket   = process.env.NEXT_PUBLIC_FIREBASE_BUCKET;
const coverUrl = (src: string | undefined) =>
  !src || src.startsWith("http")
    ? src ?? "https://placehold.co/218x218"
    : `https://storage.googleapis.com/${bucket}/${src}`;

export default function DashboardPage() {
  const { user, loading, error } = useUser();

  if (loading) return <div className="p-6">Loading…</div>;
  if (error || !user) return <div className="p-6 text-red-500">Access denied.</div>;

  const books = user.orders.flatMap(o => o.orderItems.map(i => i.book));

  return (
    <div className="p-6 text-gray-700">
      <h2 className="mb-6 text-2xl font-semibold text-black">Mis Libros</h2>

      {books.length === 0 ? (
        <p className="text-gray-500">No tienes libros comprados aún.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map(book => (
            <div
              key={book.id}
              className="flex w-64 flex-col items-start rounded-[20px] bg-gray-100 p-4 pb-6 hover:bg-gray-200 transition-colors"
            >
              {/* cover */}
              <img
                src={coverUrl(book.bookCover)}
                alt={book.title}
                className="h-56 w-56 rounded-[10px] object-cover"
              />

              {/* title */}
              <div className="mt-4 text-lg font-normal text-black">
                {book.title}
              </div>

              {/* “Leer libro” link */}
              <Link
                href={`/book/${book.id}`}
                className="mt-2 flex items-center gap-1 text-sm font-light text-neutral-600 underline"
              >
                Leer libro
                <Image src="/arrow.svg" alt="" width={4} height={8} className="h-2 w-auto" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
