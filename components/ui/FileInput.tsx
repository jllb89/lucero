"use client";

import { useId } from "react";

export function FileInput({ label, name, accept, multiple, onChange }: { label: string; name: string; accept: string; multiple?: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const id = useId();

  return (
    <div className="space-y-2 max-w-[300px]">
      {/* ✅ Styled Label */}
      <label htmlFor={id} className="text-sm font-light text-gray-500">
        {label}
      </label>

      {/* ✅ Fully Rounded File Input */}
      <div
        className="relative flex items-center border border-gray-300 rounded-lg h-10 px-3 bg-white"
        style={{
          borderRadius: "10px", // ✅ Ensures full roundness
          height: "40px", // ✅ Matches text inputs
          borderColor: "#d1d5db", // ✅ Consistent border
          backgroundColor: "white", // ✅ Prevents unwanted blending
        }}
      >
        {/* 🔥 Invisible File Input with rounded corners */}
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
          style={{ borderRadius: "10px" }} // ✅ Ensures roundness inside
        />

        <span className="text-gray-500 text-sm font-light">Choose File</span>
        <span className="mx-2 text-gray-400">|</span> {/* ✅ Separator */}
        <span className="text-gray-400 text-sm font-light truncate">No file selected</span> {/* ✅ Placeholder/File name */}
      </div>
    </div>
  );
}
