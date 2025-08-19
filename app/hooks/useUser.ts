"use client";

import { useEffect, useState } from "react";

interface Book {
  id: string;
  title: string;
  digitalPrice: number;
  physicalPrice: number;
  bookCover?: string;
}

interface OrderItem {
  id: string;
  book: Book;
}

interface Order {
  id: string;
  total: number;
  createdAt: string;
  orderItems: OrderItem[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  orders: Order[];
}

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();

        /* 🐛 DEBUG — see full payload in the browser console */
        console.log("[useUser] fetched user ↓", data);

        setUser(data);
      } catch (err: any) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
