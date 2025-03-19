"use client";

import { useId, useState } from "react";

export function FloatingFileInput({ label, name, accept, multiple, onChange }: any) {
  const id = useId();
  const [selectedFiles, setSelectedFiles] = useState<string>("No file selected");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFiles("No file selected");
      return;
    }

    // ✅ Store file names
    const fileNames = Array.from(e.target.files)
      .map((file) => file.name)
      .join(", ");
    setSelectedFiles(fileNames);

    // ✅ Pass the event, not just files
    onChange(e);
  };

  return (
    <div className="space-y-2 max-w-[300px]">
      <label htmlFor={id} className="block text-sm text-gray-500 font-light">
        {label}
      </label>

      <div
        className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 h-10 bg-white"
        style={{
          borderRadius: "8px",
          height: "40px",
          borderColor: "#d1d5db",
          backgroundColor: "white",
          overflow: "hidden",
        }}
      >
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange} // ✅ Uses internal handler
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
        />

        <span className="text-gray-500 text-sm font-light">Choose File</span>
        <span className="mx-2 text-gray-400">|</span>
        <span className="text-gray-400 text-sm font-light truncate">{selectedFiles}</span>
      </div>
    </div>
  );
}
