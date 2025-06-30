"use client";

import { usePathname } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "react-hot-toast";

const adminLinks = [
    { label: "Inicio", href: "/admin", icon: LayoutDashboard },
    { label: "Usuarios", href: "/admin/users", icon: Users },
    { label: "Órdenes", href: "/admin/orders", icon: ShoppingCart },
    { label: "Libros", href: "/admin/books", icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            {/* Sidebar */}
            <Sidebar>
                <SidebarBody className="justify-between gap-10">
                    {/* Navigation */}
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <div className="mt-6 flex flex-col gap-2">
                            {adminLinks.map(({ label, href, icon: Icon }) => (
                                <SidebarLink
                                    key={href}
                                    link={{
                                        label,
                                        href,
                                        icon: <Icon className="h-5 w-5 flex-shrink-0" />,
                                        active: pathname === href,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Admin Profile & Logout */}
                    <div className="mt-6 flex flex-col gap-2">
                        <SidebarLink
                            link={{
                                label: "Admin User",
                                href: "/admin/profile",
                                icon: (
                                    <Avatar className="h-7 w-7 bg-black rounded-full flex items-center justify-center">
                                        <AvatarFallback className="bg-black w-5 h-5 rounded-full" />
                                    </Avatar>
                                ),
                            }}
                            className="flex items-center"
                        />

                        <div
                            className="flex items-center cursor-pointer"
                            onClick={async (e: React.MouseEvent) => {
                                e.preventDefault();
                                try {
                                    const res = await fetch("/api/auth/logout", { method: "POST" });
                                    if (res.ok) {
                                        window.location.href = "/login";
                                    } else {
                                        console.error("❌ Logout failed");
                                    }
                                } catch (err) {
                                    console.error("❌ Logout error:", err);
                                }
                            }}
                        >
                            <SidebarLink
                                link={{
                                    label: "Logout",
                                    href: "#",
                                    icon: <LogOut className="h-5 w-5 flex-shrink-0 text-black" />,
                                }}
                                className="flex items-center"
                            />
                        </div>

                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto h-full">
                {children}
                <Toaster position="top-right" />
            </div>
        </div>
    );
}
