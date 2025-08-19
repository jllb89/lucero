"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MenuItem, MenuContainer } from "@/components/ui/fluid-menu";
import {
  Menu as MenuIcon,
  X,
  BookOpen,
  MonitorSmartphone,
  Eye,
  User,
  LogOut,
} from "lucide-react";
import { useUser } from "@/app/hooks/useUser";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, error } = useUser();

  useEffect(() => {
    if (!loading && (!user || error)) {
      router.push("/login");
    }
  }, [user, loading, error, router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 z-10">
        <h1 className="text-3xl font-bold tracking-tight text-black select-none">
          Editorial Lucero
        </h1>
        <div className="relative">
          <MenuContainer>
            <MenuItem
              title="Menú"
              icon={
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
                    <MenuIcon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                    <X size={24} strokeWidth={1.5} />
                  </div>
                </div>
              }
            />
            <MenuItem title="Mis libros" icon={<BookOpen size={24} strokeWidth={1.5} />} />
            <MenuItem title="Mi perfil" icon={<User size={24} strokeWidth={1.5} />} />
            <MenuItem title="Cerrar sesión" icon={<LogOut size={24} strokeWidth={1.5} />} onClick={handleLogout} />
          </MenuContainer>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8 bg-white">{children}</main>
    </div>
  );
}
