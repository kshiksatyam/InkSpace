"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatDate } from "@/lib/utils";
import type { PostCard as PostCardType } from "@/types";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { toast } from "sonner";

interface PostCardProps {
  post: PostCardType;
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const { openModal } = useAuthModal();
  const [isBookmarked, setIsBookmarked] = useState(!!post.isBookmarkedByCurrentUser);

  async function handleBookmarkToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.id) {
      openModal("login");
      return;
    }

    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setIsBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Added to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Failed to update bookmark");
      setIsBookmarked(previousState);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-5 border-b border-white/5 last:border-0"
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${post.author.username}`}>
            <UserAvatar
              name={post.author.name}
              image={post.author.image}
              className="h-6 w-6"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.author.username}`}
              className="text-xs font-semibold text-[#ccc] hover:text-white transition-colors"
            >
              {post.author.name}
            </Link>
            <span className="text-[#444] text-xs">·</span>
            <span className="text-[#555] text-xs">{formatDate(post.createdAt)}</span>
            {post.readingTime && (
              <>
                <span className="text-[#444] text-xs">·</span>
                <span className="text-[#555] text-xs">{post.readingTime} min</span>
              </>
            )}
          </div>
        </div>

        <button className="text-[#444] hover:text-[#888] transition-colors p-1 rounded cursor-pointer">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title & excerpt */}
      <Link href={`/post/${post.id}`} className="block group mb-3">
        <h2 className="text-[15px] font-bold text-[#e8e8e8] leading-snug mb-1.5 group-hover:text-white transition-colors line-clamp-2 tracking-tight">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-[#666] leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </Link>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-[#555] border border-white/8 px-2 py-0.5 rounded-sm hover:border-white/15 hover:text-[#888] transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-[#555] hover:text-[#E8C97A] transition-colors cursor-pointer group">
            <Heart className="h-3.5 w-3.5" />
            <span className="text-xs tabular-nums">{post.likeCount}</span>
          </button>

          <Link href={`/post/${post.id}#comments`}>
            <button className="flex items-center gap-1.5 text-[#555] hover:text-[#ccc] transition-colors cursor-pointer">
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        <button
          onClick={handleBookmarkToggle}
          className={`p-1 rounded transition-colors cursor-pointer ${
            isBookmarked
              ? "text-[#E8C97A]"
              : "text-[#444] hover:text-[#888]"
          }`}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-[#E8C97A]" : ""}`} />
        </button>
      </div>
    </motion.article>
  );
}
