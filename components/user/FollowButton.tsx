"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toggleFollow } from "@/actions/user.actions";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  className?: string;
}

/**
 * Optimistic follow/unfollow toggle button.
 * Shows different states: Follow, Following (with hover to Unfollow), and loading.
 */
export function FollowButton({
  targetUserId,
  isFollowing: initialIsFollowing,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovered, setIsHovered] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update
    setIsFollowing((prev) => !prev);

    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if ("error" in result) {
        // Revert on error
        setIsFollowing((prev) => !prev);
      } else {
        setIsFollowing(result.following);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant={isFollowing ? "outline" : "default"}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isPending}
      className={cn(
        "min-w-[100px] gap-1.5 transition-all",
        isFollowing && isHovered && "border-destructive/50 text-destructive hover:bg-destructive/5",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          {isHovered ? (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Unfollow
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              Following
            </>
          )}
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </>
      )}
    </Button>
  );
}
