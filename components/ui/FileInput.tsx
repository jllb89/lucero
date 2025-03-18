"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";

export function FileInput({ label, accept, multiple }: { label: string; accept: string; multiple?: boolean }) {
  const id = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="file" accept={accept} multiple={multiple} className="border border-gray-300 p-2 rounded-md" />
    </div>
  );
}
