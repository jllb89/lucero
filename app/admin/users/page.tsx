"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminUserManagement() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "ADMIN" }),
    });

    setLoading(false);
    if (!res.ok) {
      toast.error("Failed to create admin.");
      return;
    }

    toast.success("Admin created successfully!");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Admins</h1>
      <form onSubmit={handleCreateAdmin} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Admin"}
        </Button>
      </form>
    </div>
  );
}
