"use client";

import { Sparkles } from "lucide-react";

interface PostSummaryBlockProps {
  summary: string;
}

/**
 * Displays an AI-generated summary in a styled callout block.
 * Shown on the single post view and in the post editor after generation.
 */
export function PostSummaryBlock({ summary }: PostSummaryBlockProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">AI Summary</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
    </div>
  );
}
