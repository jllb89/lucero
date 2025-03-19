"use client";

import { useId } from "react";

export function FloatingFileInput({ label, name, accept, multiple, onChange }: any) {
  const id = useId();

  return (
    <div className="space-y-2 max-w-[300px]">
      {/* ✅ Styled Label */}
      <label htmlFor={id} className="block text-sm text-gray-500 font-light">
        {label}
      </label>
      
      {/* ✅ Fully Rounded File Input */}
      <div
        className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 h-10 overflow-hidden bg-white"
        style={{
          borderRadius: "8px", // ✅ Ensures full roundness
          height: "40px", // ✅ Matches text inputs
          borderColor: "#d1d5db", // ✅ Consistent border
          backgroundColor: "white", // ✅ Prevents unwanted blending
          overflow: "hidden", // ✅ Prevents edge-cutting
        }}
      >
        {/* 🔥 Invisible File Input with forced roundness */}
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
          style={{
            borderRadius: "8px", // ✅ Ensures internal roundness
            height: "100%",
          }}
        />

        <span className="text-gray-500 text-sm font-light">Choose File</span>
        <span className="mx-2 text-gray-400">|</span> {/* ✅ Separator */}
        <span className="text-gray-400 text-sm font-light truncate">No file selected</span> {/* ✅ Placeholder/File name */}
      </div>
    </div>
  );
}
