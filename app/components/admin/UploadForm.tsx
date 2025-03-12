"use client";

import { useState } from "react";

export default function UploadForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [digitalPrice, setDigitalPrice] = useState("");
  const [physicalPrice, setPhysicalPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!file) {
      setMessage("❌ Please select a file.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("description", description);
      formData.append("digitalPrice", digitalPrice);
      formData.append("physicalPrice", physicalPrice);
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-book", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Book uploaded successfully!");
        setTitle("");
        setAuthor("");
        setDescription("");
        setDigitalPrice("");
        setPhysicalPrice("");
        setFile(null);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-4">
      <div>
        <label className="block text-sm font-medium">📖 Book Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">👤 Author</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">📝 Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">💰 Digital Price ($)</label>
          <input
            type="number"
            value={digitalPrice}
            onChange={(e) => setDigitalPrice(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">📦 Physical Price ($)</label>
          <input
            type="number"
            value={physicalPrice}
            onChange={(e) => setPhysicalPrice(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">📂 Upload File (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <button
        type="submit"
        className="admin-button w-full"
        disabled={loading}
      >
        {loading ? "Uploading..." : "📤 Upload Book"}
      </button>

      {message && <p className="text-sm text-center mt-2">{message}</p>}
    </form>
  );
}
