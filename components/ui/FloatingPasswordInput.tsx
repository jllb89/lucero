"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface FloatingPasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export function FloatingPasswordInput({ label, name, value, onChange }: FloatingPasswordInputProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(value);
    toast.success("Password copied to clipboard!");
  };

  return (
    <div className="space-y-3 max-w-[300px]">
      <label htmlFor={id} className="block text-sm text-gray-500 font-light">
        {label}
      </label>

      <div className="relative flex items-center border border-gray-300 bg-white px-3 py-2 h-10"
           style={{ borderRadius: "8px", overflow: "hidden" }}>
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          readOnly
          className="w-full bg-transparent border-none focus:ring-0 shadow-none text-gray-900"
          style={{ borderRadius: "8px" }}
        />
        
        {/* Icons inside the input */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-8 text-gray-300 hover:text-black"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        
        <button
          type="button"
          onClick={handleCopyPassword}
          className="absolute right-2 text-gray-300 hover:text-black"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
