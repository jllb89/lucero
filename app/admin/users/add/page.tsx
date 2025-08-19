"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingPasswordInput } from "@/components/ui/FloatingPasswordInput"; // 🔥 Import new component
import Link from "next/link";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

export default function AddUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phoneNumber: "",
    address: "",
    password: generateRandomPassword(),
  });
  const [loading, setLoading] = useState(false);
  const id = useId();

  const roles = [
    { key: "USER", label: "User" },
    { key: "ADMIN", label: "Admin" },
    { key: "SUPER_ADMIN", label: "Super Admin" },
  ];

  function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join("");
  }

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhoneNumber = (phone: string) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    if (name === "phoneNumber" && value.length > 10) return;
  
    setFormData({ ...formData, [name]: value });
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    if (name === "email" && !validateEmail(value)) {
      toast.error("Invalid email format");
    }
  };
  

  const handleGenerateNewPassword = () => {
    const newPassword = generateRandomPassword();
    setFormData((prev) => ({ ...prev, password: newPassword }));
    toast.success("New password generated!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Creating new user...");

      const res = await fetch("/api/admin/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("User added successfully!");
        router.push("/admin/users");
      } else {
        throw new Error(data.error || "Failed to add user.");
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-neutral-100">
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">Lucero Admin Dashboard</Link> /
        <Link href="/admin/users" className="hover:underline"> Users</Link> / Add New User
      </nav>

      <div className="bg-white p-6 rounded-xl w-full max-w-3xl space-y-10 overflow-y-auto max-h-[91vh]">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Add a New User</h2>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* User Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-light text-gray-800">User Information</h3>
            <FloatingInput label="Name" name="name" value={formData.name} onChange={handleChange} />
            <FloatingInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
            <FloatingInput label="Phone Number (10 digits)" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} maxLength={10} />
            <FloatingInput label="Address" name="address" value={formData.address} onChange={handleChange} />

            {/* Role Selector */}
            <div className="relative space-y-2 max-w-[300px] z-50">
              <label className="text-sm text-gray-500 font-light">Role</label>
              <Select name="role" onValueChange={handleRoleChange}>
                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-gray-400">
                  <SelectValue placeholder="Select Role" className="text-gray-400" />
                </SelectTrigger>
                <SelectContent className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-md animate-fade-in">
                  {roles.map(({ key, label }) => (
                    <SelectItem key={key} value={key} className="text-gray-700 hover:bg-gray-100 transition-all whitespace-nowrap px-3 py-2">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-Generated Password */}
          <FloatingPasswordInput
            label="Generated Password"
            name="password"
            value={formData.password}
            onChange={(newPassword) => setFormData((prev) => ({ ...prev, password: newPassword }))}
          />

          {/* Submit */}
          <div className="flex justify-end mt-8 space-x-4">
            <Button style={{ borderRadius: "6px" }} className="bg-white text-black border border-black px-5 py-2 hover:bg-gray-100">Email Information to User</Button>
            <Button style={{ borderRadius: "6px" }} className="bg-black text-white px-5 py-2 hover:bg-gray-900 rounded-lg" disabled={loading}>{loading ? "Creating..." : "Save User"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
