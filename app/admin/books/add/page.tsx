"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingFileInput } from "@/components/ui/FloatingFileInput";
import Link from "next/link";
import toast from "react-hot-toast"; // 🔥 UI Feedback

export default function AddBookPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "", author: "", description: "", category: "",
    physicalPrice: "", digitalPrice: "",
    bookCover: null as File | null, bookFile: null as File | null, bookImages: null as FileList | null,
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { key: "PRIMARIA", label: "Primaria" },
    { key: "SECUNDARIA", label: "Secundaria" },
    { key: "BACHILLERATO", label: "Bachillerato" },
    { key: "PARA_MAESTROS", label: "Para Maestros" }
  ];

  // 📌 Retrieve JWT Token from Cookies
  const getTokenFromCookies = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || null;
  };

  // 📌 Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📌 Handle price formatting
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value).toLocaleString("es-MX", {
        style: "currency", currency: "MXN", minimumFractionDigits: 2
      }),
    }));
  };

  // 📌 Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    console.log(`📂 Handling file change for ${name}:`, files[0]);

    setFormData((prev) => ({
      ...prev,
      [name]: files.length > 1 ? files : files[0], // Stores multiple or single files
    }));
  };

  // 📌 Convert file to Base64 for secure upload
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 📌 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.title || !formData.author || !formData.bookFile) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    setLoading(true);
    try {
      console.log("📤 Preparing upload...");
  
      // Convert files to Base64
      const base64BookFile = formData.bookFile ? await convertFileToBase64(formData.bookFile) : null;
      const base64BookCover = formData.bookCover ? await convertFileToBase64(formData.bookCover) : null;
  
      // 🔥 Convert price strings to numbers (removing currency symbols and formatting)
      const parsePrice = (price: string) => {
        return price ? parseFloat(price.replace(/[$,]/g, "")) : 0;
      };
  
      console.log("📤 Uploading book...");
      console.log("📚 Title:", formData.title);
      console.log("📖 Author:", formData.author);
      console.log("📂 Book File (Base64):", base64BookFile?.slice(0, 50) + "...");
  
      // ✅ Send request to API with **parsed price values**
      const res = await fetch("/api/admin/books/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Ensures cookies are sent
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          category: formData.category,
          physicalPrice: parsePrice(formData.physicalPrice), // 💡 Ensure price is a Float
          digitalPrice: parsePrice(formData.digitalPrice),   // 💡 Ensure price is a Float
          bookFile: base64BookFile,
          bookCover: base64BookCover,
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success("Book uploaded successfully!");
        router.push("/admin/books");
      } else {
        throw new Error(data.error || "Upload failed.");
      }
    } catch (error: any) {
      console.error("❌ Upload Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };  
  

  return (
    <div className="p-6 bg-neutral-100">
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">Lucero Admin Dashboard</Link> /
        <Link href="/admin/books" className="hover:underline"> Books</Link> / Add New Book
      </nav>

      <div className="bg-white p-6 rounded-xl w-full max-w-3xl space-y-10 overflow-y-auto max-h-[91vh]">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Add a New Book</h2>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Book Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Information</h3>
            <FloatingInput label="Title" name="title" value={formData.title} onChange={handleChange} />
            <FloatingInput label="Author" name="author" value={formData.author} onChange={handleChange} />
            <FloatingInput label="Description" name="description" value={formData.description} onChange={handleChange} />

            {/* Category Selector */}
            <div className="relative space-y-2 max-w-[300px] z-50">
              <label className="text-sm text-gray-500 font-light">Category</label>
              <Select name="category" onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-gray-400">
                  <SelectValue placeholder="Select a Category" className="text-gray-400" />
                </SelectTrigger>
                <SelectContent className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-md animate-fade-in">
                  {categories.map(({ key, label }) => (
                    <SelectItem key={key} value={key} className="text-gray-700 hover:bg-gray-100 transition-all whitespace-nowrap px-3 py-2">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Book Files */}
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Files</h3>
            <FloatingFileInput label="Book Cover" name="bookCover" accept="image/*" onChange={(file) => handleFileChange(file, "bookCover")} />
            <FloatingFileInput label="Book File" name="bookFile" accept=".pdf,.epub,.mobi" onChange={(file) => handleFileChange(file, "bookFile")} />
            <FloatingFileInput label="Book Images" name="bookImages" accept="image/*" multiple onChange={(file) => handleFileChange(file, "bookImages")} />
          </div>

          {/* Book Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Pricing</h3>
            <FloatingInput label="Physical Price (MXN)" name="physicalPrice" type="text" value={formData.physicalPrice} onChange={handleChange} onBlur={handlePriceBlur} />
            <FloatingInput label="Digital Price (MXN)" name="digitalPrice" type="text" value={formData.digitalPrice} onChange={handleChange} onBlur={handlePriceBlur} />
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-8">
            <Button type="submit"
            style={{ borderRadius: "6px" }}
            className="bg-black text-white px-5 py-2 hover:bg-gray-900 rounded-lg" disabled={loading}>
            {loading ? "Uploading..." : "Save Book"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



