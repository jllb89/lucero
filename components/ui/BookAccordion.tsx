"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import { Input } from "@/components/ui/input";
import { FileInput } from "@/components/ui/FileInput";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DollarSign, Book, File, ChevronDown } from "lucide-react";
import "@/styles/animations.css"; // Ensure animations are applied

const categories = ["PRIMARIA", "SECUNDARIA", "BACHILLERATO", "PARA_MAESTROS"];

export function BookAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {/* Book Information */}
      <AccordionItem value="book-info">
        <AccordionTrigger className="p-3 w-full flex items-center justify-between hover:underline transition-all">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-gray-600" />
            <span>Book Information</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
        </AccordionTrigger>
        <AccordionContent className="accordion-content">
          <div className="space-y-4"> {/* ✅ SPACING BETWEEN INPUTS FIXED */}
            <div>
              <Label>Title</Label>
              <Input type="text" placeholder="Book Title" className="grey-outline" />
            </div>
            <div>
              <Label>Author</Label>
              <Input type="text" placeholder="Author Name" className="grey-outline" />
            </div>
            <div>
              <Label>Description</Label>
              <Input type="text" placeholder="Short Description" className="grey-outline" />
            </div>
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="grey-outline">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent className="grey-outline">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Book Files */}
      <AccordionItem value="book-files">
        <AccordionTrigger className="p-3 w-full flex items-center justify-between hover:underline transition-all">
          <div className="flex items-center gap-2">
            <File className="w-5 h-5 text-gray-600" />
            <span>Book Files</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
        </AccordionTrigger>
        <AccordionContent className="accordion-content">
          <div className="space-y-4"> {/* ✅ SPACING BETWEEN FILE INPUTS FIXED */}
            <div>
              <Label>Book Cover</Label>
              <FileInput
                label="Book Cover"
                name="bookCover"
                accept="image/*"
                onChange={() => {}}
              />
            </div>
            <div>
              <Label>Book File</Label>
              <FileInput
                label="Book File"
                name="bookFile"
                accept=".pdf,.epub"
                onChange={() => {}}
              />
            </div>
            <div>
              <Label>Book Images</Label>
              <FileInput
                label="Book Images"
                name="bookImages"
                accept="image/*"
                multiple
                onChange={() => {}}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Book Pricing */}
      <AccordionItem value="book-pricing">
        <AccordionTrigger className="p-3 w-full flex items-center justify-between hover:underline transition-all">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <span>Book Pricing</span>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
        </AccordionTrigger>
        <AccordionContent className="accordion-content">
          <div className="space-y-4"> {/* ✅ SPACING BETWEEN PRICING INPUTS FIXED */}
            <div>
              <Label>Physical Price</Label>
              <Input type="number" placeholder="$0.00" className="grey-outline" />
            </div>
            <div>
              <Label>Digital Price</Label>
              <Input type="number" placeholder="$0.00" className="grey-outline" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
