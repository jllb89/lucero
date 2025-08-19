// components/blocks/sidebar.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

/* ---------- Context ---------- */

interface SidebarCtx {
  open: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarCtx | null>(null);

function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar.* must be inside <SidebarProvider>");
  return ctx;
}

/* ---------- Provider ---------- */

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((o) => !o);

  return (
    <SidebarContext.Provider value={{ open, toggle }}>
      <div className="flex h-full">{children}</div>
    </SidebarContext.Provider>
  );
}

/* ---------- Layout parts ---------- */

export function Sidebar({ children }: { children: ReactNode }) {
  const { open } = useSidebar();
  return (
    <aside
      className={cn(
        "transition-all duration-300 overflow-y-auto bg-background/50 border-r",
        open ? "w-64" : "w-0"
      )}
    >
      {open && children}
    </aside>
  );
}

/* Acts only as spacing in the 21stdev viewer */
export const SidebarRail = () => null;

export function SidebarContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("pt-4", className)}>{children}</div>;
}

/* Button that shows / hides the sidebar */
export function SidebarTrigger() {
  const { open, toggle } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={toggle}
      aria-label="Toggle sidebar"
    >
      <ChevronRight
        className={cn(
          "size-4 transition-transform",
          open ? "rotate-180" : "rotate-0"
        )}
      />
    </Button>
  );
}
