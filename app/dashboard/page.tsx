"use client";

import { useUser } from "@/app/hooks/useUser";

export default function DashboardPage() {
  const { user, loading, error } = useUser();

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !user) return <div className="p-6 text-red-500">Access denied.</div>;

  const books = user.orders.flatMap((order) => order.orderItems.map((item) => item.book));

  return (
    <div className="p-6 text-gray-700">
      <h2 className="text-2xl font-semibold mb-6">📘 Mis Libros</h2>

      {books.length === 0 ? (
        <p className="text-gray-500">No tienes libros comprados aún.</p>
      ) : (
        <ul className="space-y-4">
          {books.map((book) => (
            <li key={book.id} className="border p-4 rounded-lg shadow-sm bg-white">
              <h3 className="text-lg font-medium text-black">{book.title}</h3>
              <p className="text-sm text-gray-500">
                Digital: ${book.digitalPrice.toFixed(2)} | Físico: ${book.physicalPrice.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
