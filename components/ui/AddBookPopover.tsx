"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookAccordion } from "./BookAccordion";

export default function AddBookPopover() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          style={{ borderRadius: "6px" }}
          className="bg-black text-white px-4 py-2 hover:bg-gray-900 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Book
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-[400px] p-6 shadow-lg border border-gray-300 bg-white z-50"
        style={{ borderRadius: "6px" }}
      >
        <h3 className="text-lg font-medium mb-3">Add a New Book</h3>
        <BookAccordion />
      </PopoverContent>
    </Popover>
  );
}
