"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toggleLike } from "@/actions/post.actions";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    startTransition(async () => {
      const result = await toggleLike(postId);
      if ("error" in result) {
        setLiked((prev) => !prev);
        setCount((prev) => (liked ? prev + 1 : prev - 1));
      } else {
        setLiked(result.liked);
        setCount(result.likeCount);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "group flex items-center gap-1.5 text-sm transition-colors cursor-pointer",
        liked
          ? "text-[#E8C97A]"
          : "text-[#555] hover:text-[#E8C97A]"
      )}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            liked && "fill-current"
          )}
        />
      )}
      <span className="tabular-nums text-xs">{count}</span>
    </button>
  );
}
