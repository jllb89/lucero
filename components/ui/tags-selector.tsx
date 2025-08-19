"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Tag = {
  id: string;
  label: string;
};

type TagsSelectorProps = {
  tags: Tag[];
  selectedTags: Tag[];
  onTagAdd: (tag: Tag) => void;
  onTagRemove: (id: string) => void;
};

export function TagsSelector({
  tags,
  selectedTags: incomingSelectedTags,
  onTagAdd,
  onTagRemove,
}: TagsSelectorProps) {
  const selectedsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // ✅ Sync selectedTags from props
  useEffect(() => {
    setSelectedTags(incomingSelectedTags);
  }, [incomingSelectedTags]);

  const handleRemove = (id: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== id));
    onTagRemove(id);
  };

  const handleAdd = (tag: Tag) => {
    setSelectedTags((prev) => [...prev, tag]);
    onTagAdd(tag);
  };

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [selectedTags]);

  return (
    <div className="max-w-[300px] w-full flex flex-col">
      <motion.h2 layout className="text-md font-light">Books</motion.h2>

      {/* Selected tags */}
      <motion.div
        className="bg-white border border-gray-300 p-2 w-full min-h-[56px] flex flex-wrap gap-2 mt-2 mb-3"
        style={{ borderRadius: 8 }}
        ref={selectedsContainerRef}
        layout
      >
        {selectedTags.map((tag) => (
          <motion.div
            key={tag.id}
            className="flex items-center gap-1 pl-3 pr-1 py-1 bg-black font-light text-white shadow-none border-none h-full shrink-0 text-xs"
            style={{ borderRadius: 20 }}
            layoutId={`tag-${tag.id}`}
          >
            <motion.span
              layoutId={`tag-${tag.id}-label`}
              className="font-medium"
            >
              {tag.label}
            </motion.span>
            <button onClick={() => handleRemove(tag.id)} className="p-1 rounded-full">
              <X className="size-4 text-white" />
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Available tags */}
      {tags.length > selectedTags.length && (
        <motion.div
          className="bg-white border border-gray-300 p-2 w-full"
          style={{ borderRadius: 8 }}
          layout
        >
          <motion.div className="flex flex-wrap gap-2">
            {tags
              .filter((tag) => !selectedTags.some((selected) => selected.id === tag.id))
              .map((tag) => (
                <motion.button
                  key={tag.id}
                  layoutId={`tag-${tag.id}`}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-xs text-black rounded-full shrink-0"
                  onClick={() => handleAdd(tag)}
                  style={{ borderRadius: 20 }}
                >
                  <motion.span
                    layoutId={`tag-${tag.id}-label`}
                    className="font-medium"
                  >
                    {tag.label}
                  </motion.span>
                </motion.button>
              ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
