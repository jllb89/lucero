"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FileInput } from "@/components/ui/FileInput";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingFileInput } from "@/components/ui/FloatingFileInput";
import Link from "next/link";


export default function AddBookPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "", author: "", description: "", category: "",
    physicalPrice: "", digitalPrice: "",
    bookCover: null, bookFile: null, bookImages: null,
  });

  const categories = [
    { key: "PRIMARIA", label: "Primaria" },
    { key: "SECUNDARIA", label: "Secundaria" },
    { key: "BACHILLERATO", label: "Bachillerato" },
    { key: "PARA_MAESTROS", label: "Para Maestros" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.files?.[0] || null });
  };

  return (
    <div className="p-6 bg-neutral-100">
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">Lucero Admin Dashboard</Link> / 
        <Link href="/admin/books" className="hover:underline">Books</Link> / Add New Book
      </nav>

      <div className="bg-white p-6 rounded-xl w-full max-w-3xl space-y-10 overflow-y-auto max-h-[91vh]">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Add a New Book</h2>

        <form className="space-y-10">
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
            <FloatingFileInput label="Book Cover" name="bookCover" accept="image/*" onChange={handleFileChange} />
            <FloatingFileInput label="Book File" name="bookFile" accept=".pdf,.epub,.mobi" onChange={handleFileChange} />
            <FloatingFileInput label="Book Images" name="bookImages" accept="image/*" multiple onChange={handleFileChange} />
          </div>

          {/* Book Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">Book Pricing</h3>
            <FloatingInput label="Physical Price (MXN)" name="physicalPrice" type="text" value={formData.physicalPrice} onChange={handleChange} onBlur={handlePriceBlur} />
            <FloatingInput label="Digital Price (MXN)" name="digitalPrice" type="text" value={formData.digitalPrice} onChange={handleChange} onBlur={handlePriceBlur} />
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-8">
            <Button type="submit" className="bg-black text-white px-5 py-2 hover:bg-gray-900 rounded-lg">
              Save Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
