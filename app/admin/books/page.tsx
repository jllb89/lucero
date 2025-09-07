"use client";

import { useEffect, useState, useId } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Plus, Trash } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  digitalPrice?: number;
  physicalPrice?: number;
  createdAt: string;
  active: boolean;
}

interface ApiResponse {
  books: Book[];
  totalBooks: number;
  totalPages: number;
  currentPage: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const id = useId();
  const router = useRouter();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch(`/api/admin/books?page=${page}&perPage=${perPage}&search=${search}`);
        const data: ApiResponse = await res.json();
        setBooks(data.books);
        setTotalPages(data.totalPages);
        setTotalBooks(data.totalBooks);
      } catch (error) {
        console.error("❌ Error fetching books:", error);
      }
    }
    fetchBooks();
  }, [page, perPage, search]);

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooks((prev) => {
      const updated = new Set(prev);
      updated.has(bookId) ? updated.delete(bookId) : updated.add(bookId);
      return updated;
    });
  };

  const deleteSelectedBooks = async () => {
    if (!selectedBooks.size) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedBooks.size} book(s)?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/books/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookIds: Array.from(selectedBooks) }),
      });

      if (!res.ok) throw new Error("Failed to delete books");

      toast.success("Books deleted successfully!");
      setBooks((prev) => prev.filter((book) => !selectedBooks.has(book.id)));
      setSelectedBooks(new Set());
    } catch (error) {
      console.error("❌ Error deleting books:", error);
      toast.error("Error deleting books.");
    }
  };

  return (
    <div className="p-6 bg-neutral-100 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">Lucero Admin Dashboard</Link> / Books
      </nav>

      <div className="bg-white p-6" style={{ borderRadius: "6px" }}>
        <h2 className="text-xl font-regular text-black mb-6">Books</h2>

        <div className="flex items-center justify-between mb-4">
          {/* Search Input */}
          <div className="relative w-1/3">
            <Label htmlFor={id} className="sr-only">Search</Label>
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-muted-foreground/80 peer-disabled:opacity-50" size={18} />
              <Input
                id={id}
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderRadius: "6px", borderColor: "#ccc" }}
                className="peer w-full pe-9 pl-10 border border-gray-300"
              />
              {search && (
                <X className="absolute right-3 text-muted-foreground/80 cursor-pointer" size={18} onClick={() => setSearch("")} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Delete Button (Only visible if books are selected) */}
            {selectedBooks.size > 0 && (
              <Button
                className="bg-white text-black border border-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all flex items-center"
                style={{ borderRadius: "6px" }}
                onClick={deleteSelectedBooks}
              >
                <Trash className="w-5 h-5 mr-2" /> Delete Selected
              </Button>

            )}

            {/* Add Book Button */}
            <Button
              style={{ borderRadius: "6px" }}
              className="bg-black text-white px-4 py-2 hover:bg-gray-900 transition-all flex items-center"
              onClick={() => router.push("/admin/books/add")}
            >
              <Plus className="w-5 h-5 mr-2" /> Add Book
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  onCheckedChange={(checked) =>
                    setSelectedBooks(
                      checked ? new Set(books.map((book) => book.id)) : new Set()
                    )
                  }
                  checked={selectedBooks.size === books.length}
                  className="cursor-pointer h-5 w-5 align-middle"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Digital Price</TableHead>
              <TableHead>Physical Price</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length ? (
              books.map((book) => (
                <TableRow key={book.id} className={selectedBooks.has(book.id) ? "bg-gray-200" : ""}>
                  <TableCell className="align-middle">
                    <Checkbox
                      checked={selectedBooks.has(book.id)}
                      onCheckedChange={() => toggleBookSelection(book.id)}
                      className="cursor-pointer h-5 w-5 align-middle"
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/books/${book.id}`} className="underline text-black">
                      {book.title}
                    </Link>

                  </TableCell>
                  <TableCell>${book.digitalPrice?.toFixed(2) || "—"}</TableCell>
                  <TableCell>${book.physicalPrice?.toFixed(2) || "—"}</TableCell>
                  <TableCell>{new Date(book.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={book.active}
                        onCheckedChange={async (newActive: boolean) => {
                          try {
                            const res = await fetch(`/api/admin/books/${book.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ active: newActive }),
                            });
                            if (!res.ok) throw new Error("Failed to update status");
                            setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, active: newActive } : b));
                            toast.success(`Book marked as ${newActive ? "active" : "inactive"}`);
                          } catch (error) {
                            toast.error("Error updating status");
                          }
                        }}
                        aria-label={book.active ? "Set inactive" : "Set active"}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-8 mt-4 whitespace-nowrap w-full">
          {/* Rows Per Page Selector */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Label htmlFor={id} className="min-w-max text-xs">Rows per page</Label>
            <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
              <SelectTrigger id={id} className="w-fit" style={{ borderRadius: "6px" }}>
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Count Info */}
          <p className="text-xs text-muted-foreground gap-2 whitespace-nowrap">
            Showing {Math.min((page - 1) * perPage + 1, totalBooks)} - {Math.min(page * perPage, totalBooks)} of {totalBooks}
          </p>

          {/* Pagination Buttons */}
          <Pagination className="ml-auto flex justify-end">
            <PaginationContent>
              <PaginationItem>
                <Button onClick={() => setPage(1)} disabled={page === 1} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronFirst size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronLeft size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronRight size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(totalPages)} disabled={page >= totalPages} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronLast size={16} />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
