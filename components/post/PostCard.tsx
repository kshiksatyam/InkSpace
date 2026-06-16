"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatDate } from "@/lib/utils";
import type { PostCard as PostCardType } from "@/types";

interface PostCardProps {
  post: PostCardType;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group glass-card p-5 sm:p-6"
    >
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${post.author.username}`}>
          <UserAvatar
            name={post.author.name}
            image={post.author.image}
            className="h-8 w-8"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${post.author.username}`}
            className="text-sm font-medium hover:text-primary transition-colors truncate block"
          >
            {post.author.name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* Title & excerpt */}
      <Link href={`/post/${post.id}`} className="block mb-3">
        <h2 className="text-lg font-bold leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      </Link>

      {/* Tags & metadata row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              #{tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <Heart className="h-3.5 w-3.5" />
          <span className="tabular-nums">{post.likeCount}</span>
        </div>
      </div>
    </motion.article>
  );
}
