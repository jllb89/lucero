import { Inter } from "next/font/google";
import SearchBar from "@/components/SearchBar";
import Storefront, { StoreBook } from "@/components/home/Storefront";
import FAQ from "@/components/home/FAQ";
import { prisma } from "@/lib/prisma";
// No signed URLs for covers – build public GCS URL
import { CartProvider } from "@/hooks/useCart";
import CartBadge from "@/components/cart/CartBadge";

const inter = Inter({ subsets: ["latin"] });

/* ----------------------------- PAGE ----------------------------- */

async function getBooks(): Promise<StoreBook[]> {
  const raw = await prisma.book.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
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

  const bucket = process.env.NEXT_PUBLIC_FIREBASE_BUCKET;
  const withPublic = raw.map((b) => {
    let coverUrl: string | null = null;
    if (b.bookCover) {
      coverUrl = b.bookCover.startsWith("http")
        ? b.bookCover
        : `https://storage.googleapis.com/${bucket}/${b.bookCover}`;
    }
    return { ...b, coverUrl } as StoreBook;
  });
  return withPublic;
}

export default async function Home() {
  const books = await getBooks();
  return (
    <CartProvider>
      <main className="min-h-dvh bg-white text-[#1D1D1F]">
      <SearchBar />

      {/* HERO */}
      <section className="container mx-auto max-w-7xl px-6 pt-20 pb-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-6xl font-medium ls--3">
            <span className={["block text-lucero-light", inter.className].join(" ")}>
              Bienvenido a la nueva tienda en línea de
            </span>
            <span className={["block text-zinc-900", inter.className].join(" ")}>
              Editorial Lucero.
            </span>
          </h1>
          <Storefront initialBooks={books} />
        </div>
      </section>

      {/* Banner stays on the server page */}
      <section className="container mx-auto max-w-7xl px-6 pb-6">
        <div className="mt-0 overflow-hidden rounded-2xl">
          <img
            src="https://placehold.co/1728x731"
            alt="Promoción"
            className="h-72 w-full rounded-2xl object-cover sm:h-[28rem]"
          />
        </div>
      </section>

      {/* FAQ */}
  <FAQ />

      {/* FOOTER */}
      <footer className="mt-10 bg-[#E3E3E3]">
        <div className="container mx-auto max-w-7xl px-6 py-24">
          <p className={[inter.className, "max-w-3xl text-sm font-medium text-black ls--3"].join(" ")}>
            Nueva Editorial Lucero S.A. de C.V. y Grupo Editorial LAN, S.A. de C.V. son empresas 100% mexicanas,
            dedicadas a la creación, edición, publicación y comercialización de libros de texto, cuadernos de actividades
            y materiales educativos para primaria, secundaria y bachillerato.
            <br />
            <br />
            Crestón 312-2, Col. Jardines del Pedregal, 01900 Álvaro Obregón, Ciudad de México
            <br />
            Contacto:{" "}
            <a className="underline" href="tel:+525611846597" aria-label="Llamar al 5611846597">
              5611846597
            </a>
          </p>
        </div>
      </footer>
      <CartBadge />
    </main>
    </CartProvider>
  );
}
