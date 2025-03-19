"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingFileInput } from "@/components/ui/FloatingFileInput";
import Link from "next/link";
import toast from "react-hot-toast"; // 🔥 UI Feedback

export default function EditBookPage() {
  const router = useRouter();
  const { id } = useParams(); // Get book ID from URL
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    physicalPrice: "",
    digitalPrice: "",
    bookCover: null as File | null,
    bookFile: null as File | null,
    bookImages: null as FileList | null,
  });

  const categories = [
    { key: "PRIMARIA", label: "Primaria" },
    { key: "SECUNDARIA", label: "Secundaria" },
    { key: "BACHILLERATO", label: "Bachillerato" },
    { key: "PARA_MAESTROS", label: "Para Maestros" },
  ];

  // 📌 Fetch Book Data on Load
  useEffect(() => {
    async function fetchBook() {
      try {
        console.log(`📡 Fetching book data for ID: ${id}`);
        const res = await fetch(`/api/admin/books/${id}`);
        if (!res.ok) throw new Error("Failed to fetch book details");

        const data = await res.json();
        console.log("✅ Book data received:", data);

        setFormData({
          title: data.title,
          author: data.author,
          description: data.description || "",
          category: data.category || "",
          physicalPrice: data.physicalPrice ? formatPrice(data.physicalPrice) : "",
          digitalPrice: data.digitalPrice ? formatPrice(data.digitalPrice) : "",
          bookCover: data.bookCover || null,
          bookFile: data.bookFile || null,
          bookImages: data.bookImages ? JSON.parse(data.bookImages) : null,
        });
      } catch (error) {
        console.error("❌ Error fetching book:", error);
        toast.error("Failed to load book data.");
      }
    }

    if (id) fetchBook();
  }, [id]);

  // 📌 Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📌 Ensure proper price formatting
  const formatPrice = (value: string | number) => {
    if (!value) return "";
    return parseFloat(value as string).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });
  };

  // ✅ Keep formatted price visible
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value.trim()) return;

    setFormData((prev) => ({
      ...prev,
      [name]: formatPrice(value),
    }));
  };

  // 📌 Handle file uploads and display file names
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    console.log(`📂 Handling file change for ${name}:`, files[0]);

    setFormData((prev) => ({
      ...prev,
      [name]: files.length > 1 ? files : files[0], // Stores multiple or single files
    }));
  };

  // 📌 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Updating book...");

      const res = await fetch(`/api/admin/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          category: formData.category,
          physicalPrice: parseFloat(formData.physicalPrice.replace(/[$,]/g, "")),
          digitalPrice: parseFloat(formData.digitalPrice.replace(/[$,]/g, "")),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Book updated successfully!");
        router.push("/admin/books");
      } else {
        throw new Error(data.error || "Update failed.");
      }
    } catch (error: any) {
      console.error("❌ Update Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-neutral-100">
      {/* Breadcrumb Navigation */}
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">Lucero Admin Dashboard</Link> /
        <Link href="/admin/books" className="hover:underline"> Books</Link> / Edit Book
      </nav>

      {/* Form Container */}
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl space-y-10 overflow-y-auto max-h-[91vh]">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Edit Book</h2>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Book Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Information</h3>
            <FloatingInput label="Title" name="title" value={formData.title} onChange={handleChange} />
            <FloatingInput label="Author" name="author" value={formData.author} onChange={handleChange} />
            <FloatingInput label="Description" name="description" value={formData.description} onChange={handleChange} />

            {/* Category Selector (Pre-selected) */}
            <div className="relative space-y-2 max-w-[300px] z-50">
              <label className="text-sm text-gray-500 font-light">Category</label>
              <Select
                name="category"
                value={formData.category || ""}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-gray-400">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(({ key, label }) => (
                    <SelectItem key={key} value={key} className="text-gray-700 hover:bg-gray-100">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

                    {/* Book Files Section */}
                    <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Files</h3>
            
            {/* Book Cover */}
            <FloatingFileInput
              label="Book Cover"
              name="bookCover"
              accept="image/*"
              onChange={(file) => handleFileChange(file, "bookCover")}
              defaultValue={formData.bookCover} // ✅ Sets existing cover if available
            />
  
            {/* Book File */}
            <FloatingFileInput
              label="Book File"
              name="bookFile"
              accept=".pdf,.epub,.mobi"
              onChange={(file) => handleFileChange(file, "bookFile")}
              defaultValue={formData.bookFile} // ✅ Shows file if already uploaded
            />
  
            {/* Book Images */}
            <FloatingFileInput
              label="Book Images"
              name="bookImages"
              accept="image/*"
              multiple
              onChange={(file) => handleFileChange(file, "bookImages")}
              defaultValue={formData.bookImages} // ✅ Ensures preloaded images are displayed
            />
          </div>

          {/* Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Pricing</h3>
            <FloatingInput label="Physical Price (MXN)" name="physicalPrice" type="text" value={formData.physicalPrice} onChange={handleChange} onBlur={handlePriceBlur} />
            <FloatingInput label="Digital Price (MXN)" name="digitalPrice" type="text" value={formData.digitalPrice} onChange={handleChange} onBlur={handlePriceBlur} />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <Button type="submit" style={{ borderRadius: "6px"}} className="bg-black text-white px-5 py-2 hover:bg-gray-900 rounded-lg" disabled={loading }>
              {loading ? "Updating..." : "Save Book"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}