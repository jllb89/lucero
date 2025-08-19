"use client";

import { useState, useId } from "react";
import { Input } from "@/components/ui/input";

export function FloatingInput({ label, name, type = "text", value, onChange, onBlur }: any) {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative max-w-[300px] group">
      {/* 🔹 Label moves slightly higher when input is selected */}
      <label
        htmlFor={id}
        className={`absolute left-3 px-1 transition-all text-sm text-gray-500 bg-white font-light
          ${(value || isFocused) ? "-top-2 text-xs font-medium text-gray-700" : "top-1/2 -translate-y-1/2"}
        `}
        style={{
          transition: "all 0.2s ease-in-out",
          pointerEvents: "none",
        }}
      >
        {label}
      </label>

      {/* 🔹 Input field */}
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        onFocus={() => setIsFocused(true)}
        placeholder=" "
        className="h-[40px] rounded-lg border-gray-300 text-gray-700 text-sm px-3 pt-[6px] pb-[4px] focus:border-black"
        style={{
          borderRadius: "6px",
          height: "40px",
          paddingTop: "18px", 
          paddingBottom: "4px",
          borderColor: "#d1d5db",
          backgroundColor: "white",
        }}
      />
    </div>
  );
}
