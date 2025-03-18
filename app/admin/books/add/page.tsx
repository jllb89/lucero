"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/newbook-input";
import { FileInput } from "@/components/ui/FileInput";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

const categories = ["PRIMARIA", "SECUNDARIA", "BACHILLERATO", "PARA_MAESTROS"];

export default function NewBookPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    bookCover: null,
    bookFile: null,
    bookImages: [],
    physicalPrice: "",
    digitalPrice: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, [field]: file });
  };

  return (
    <div className="p-6 bg-neutral-100 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-gray-500 text-sm mb-4">
        <button onClick={() => router.push("/books")} className="flex items-center gap-1 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Books
        </button>{" "}
        / Add New Book
      </nav>

      {/* Form Container */}
      <div className="bg-white p-6" style={{ borderRadius: "6px" }}>
        <h2 className="text-xl font-regular text-black mb-6">Add New Book</h2>

        {/* Book Information */}
        <div className="space-y-4 mb-6">
          <div className="group relative">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="" />
          </div>

          <div className="group relative">
            <Label htmlFor="author">Author</Label>
            <Input id="author" name="author" value={form.author} onChange={handleChange} placeholder="" />
          </div>

          <div className="group relative">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" value={form.description} onChange={handleChange} placeholder="" />
          </div>

          <div className="group relative">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Book Files */}
        <div className="space-y-4 mb-6">
          <div className="group relative">
            <Label htmlFor="bookCover">Book Cover</Label>
            <FileInput id="bookCover" label="Upload Cover" accept="image/*" onChange={(e) => handleFileChange(e, "bookCover")} />
          </div>

          <div className="group relative">
            <Label htmlFor="bookFile">Book File</Label>
            <FileInput id="bookFile" label="Upload Book File" accept=".pdf,.epub" onChange={(e) => handleFileChange(e, "bookFile")} />
          </div>

          <div className="group relative">
            <Label htmlFor="bookImages">Book Images</Label>
            <FileInput id="bookImages" label="Upload Additional Images" accept="image/*" multiple onChange={(e) => handleFileChange(e, "bookImages")} />
          </div>
        </div>

        {/* Book Pricing */}
        <div className="space-y-4 mb-6">
          <div className="group relative">
            <Label htmlFor="physicalPrice">Physical Price</Label>
            <Input id="physicalPrice" name="physicalPrice" type="number" value={form.physicalPrice} onChange={handleChange} placeholder="$0.00" />
          </div>

          <div className="group relative">
            <Label htmlFor="digitalPrice">Digital Price</Label>
            <Input id="digitalPrice" name="digitalPrice" type="number" value={form.digitalPrice} onChange={handleChange} placeholder="$0.00" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button onClick={() => router.push("/books")} style={{ borderRadius: "6px" }} className="bg-gray-200 text-black px-4 py-2">
            Cancel
          </Button>
          <Button style={{ borderRadius: "6px" }} className="bg-black text-white px-4 py-2 flex items-center">
            <Save className="w-5 h-5 mr-2" /> Save Book
          </Button>
        </div>
      </div>
    </div>
  );
}
