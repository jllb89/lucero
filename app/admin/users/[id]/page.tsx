"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { TagsSelector } from "@/components/ui/tags-selector";
import Link from "next/link";
import { toast } from "sonner";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    phoneNumber: "",
    address: "",
  });

  const [userBooks, setUserBooks] = useState<{ id: string; label: string }[]>([]);
  const [availableBooks, setAvailableBooks] = useState([]);

  const roles = [
    { key: "USER", label: "User" },
    { key: "ADMIN", label: "Admin" },
    { key: "SUPER_ADMIN", label: "Super Admin" },
  ];

  // ✅ Fetch user + books
  useEffect(() => {
    if (!id) return;

    async function fetchUserAndBooks() {
      try {
        // Fetch user
        const resUser = await fetch(`/api/admin/users/${id}`);
        if (!resUser.ok) throw new Error("Failed to fetch user details");
        const userData = await resUser.json();

        setUserData({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
        });

        setUserBooks(userData.books || []);

        // Fetch all books
        const resBooks = await fetch(`/api/admin/books`);
        const booksData = await resBooks.json();

        if (!Array.isArray(booksData.books)) {
          console.error("🚨 API response does not contain a 'books' array:", booksData);
          throw new Error("Invalid API response: Expected 'books' array");
        }

        setAvailableBooks(
          booksData.books.map((book: { id: string; title: string }) => ({
            id: book.id,
            label: book.title,
          }))
        );
      } catch (err) {
        console.error("❌ Failed to load user or books:", err);
        toast.error("Could not load user or books.");
      }
    }

    fetchUserAndBooks();
  }, [id]);

  // Other logic (form handling, tag management, etc.) remains unchanged
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber" && value.length > 10) return;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
      toast.error("Invalid email format");
    }
  };

  const handleRoleChange = (role: string) => {
    setUserData((prev) => ({ ...prev, role }));
  };

  const addBookAccess = async (tag: { id: string; label: string }) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/add-book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: tag.id }),
      });

      const data = await res.json();
    console.log("📡 Add book response:", data);

      if (!res.ok) throw new Error("Failed to add book access");

      toast.success("Book access granted!");
      setUserBooks((prev) => [...prev, tag]);
    } catch (error) {
      console.error("❌ Error adding book:", error);
      toast.error("Could not grant book access.");
    }
  };

  const removeBookAccess = async (tagId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/remove-book`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: tagId }),
      });

      if (!res.ok) throw new Error("Failed to remove book access");

      toast.success("Book access removed!");
      setUserBooks((prev) => prev.filter((tag) => tag.id !== tagId));
    } catch (error) {
      console.error("❌ Error removing book:", error);
      toast.error("Could not remove book access.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!userData.name || !userData.email || !userData.role) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      let data: { error?: string } = {};
      try {
        data = await res.json(); // ✅ Try parsing only if valid
      } catch (err) {
        console.warn("⚠️ Response body was empty or invalid JSON");
      }

      if (!res.ok) {
        throw new Error(data.error || "Update failed.");
      }
  
      toast.success("User updated successfully!");
      router.push("/admin/users");
    } catch (error: any) {
      console.error("❌ Update Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-6 bg-neutral-100">
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">Lucero Admin Dashboard</Link> /
        <Link href="/admin/users" className="hover:underline"> Users</Link> / Edit User
      </nav>

      <div className="bg-white p-6 rounded-xl w-full max-w-3xl space-y-10 overflow-y-auto max-h-[91vh]">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Edit User</h2>

        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">User Information</h3>
            <FloatingInput label="Name" name="name" value={userData.name} onChange={handleChange} />
            <FloatingInput label="Email" name="email" type="email" value={userData.email} onChange={handleChange} onBlur={handleBlur} />
            <FloatingInput label="Phone Number (10 digits)" name="phoneNumber" type="tel" value={userData.phoneNumber} onChange={handleChange} maxLength={10} />
            <FloatingInput label="Address" name="address" value={userData.address} onChange={handleChange} />

            <div className="relative space-y-2 max-w-[300px] z-50">
              <label className="text-sm text-gray-500 font-light">Role</label>
              <Select name="role" value={userData.role || ""} onValueChange={handleRoleChange}>
                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-gray-400">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(({ key, label }) => (
                    <SelectItem key={key} value={key} className="text-gray-700 hover:bg-gray-100">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TagsSelector
            tags={availableBooks}
            selectedTags={userBooks}
            onTagAdd={addBookAccess}
            onTagRemove={removeBookAccess}
          />

          <div className="flex justify-end mt-8 space-x-4">
            <Button style={{ borderRadius: "6px" }} className="bg-black text-white px-5 py-2 hover:bg-gray-900 rounded-lg" disabled={loading}>
              {loading ? "Updating..." : "Save User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
