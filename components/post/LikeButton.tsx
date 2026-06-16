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

/**
 * Optimistic like/unlike button with heart icon and count.
 * Instantly toggles the UI, then confirms with the server action.
 */
export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    startTransition(async () => {
      const result = await toggleLike(postId);
      if ("error" in result) {
        // Revert on error
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
        "group flex items-center gap-1.5 text-sm transition-colors",
        liked
          ? "text-rose-500"
          : "text-muted-foreground hover:text-rose-500"
      )}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            liked && "fill-current scale-110"
          )}
        />
      )}
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
