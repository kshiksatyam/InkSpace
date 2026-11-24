"use client";

import { Sparkles } from "lucide-react";

interface PostSummaryBlockProps {
  summary: string;
}

export function PostSummaryBlock({ summary }: PostSummaryBlockProps) {
  return (
    <div className="border-l-2 border-[#E8C97A] pl-5 py-3 bg-[#E8C97A]/[0.04] rounded-r-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-[#E8C97A]" strokeWidth={1.5} />
        <span className="text-xs font-semibold text-[#E8C97A] uppercase tracking-widest">
          AI Summary
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[#999]">{summary}</p>
    </div>
  );
}
