"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MAX_TAGS } from "@/lib/constants";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

/**
 * Tag input component with pill-style display.
 * Users type a tag and press Enter/comma to add it.
 * Tags can be removed by clicking the X icon.
 * Limited to MAX_TAGS entries.
 */
export function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(rawTag: string) {
    const tag = rawTag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!tag) return;
    if (tags.includes(tag)) return;
    if (tags.length >= MAX_TAGS) return;

    onChange([...tags, tag]);
    setInputValue("");
  }

  function removeTag(tagToRemove: string) {
    onChange(tags.filter((t) => t !== tagToRemove));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="gap-1 pl-2.5 pr-1.5 py-0.5"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {tags.length < MAX_TAGS && (
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
          className="flex-1 min-w-[120px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 h-7 text-sm"
        />
      )}
    </div>
  );
}
