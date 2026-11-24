"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toggleFollow } from "@/actions/user.actions";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  className?: string;
}

export function FollowButton({
  targetUserId,
  isFollowing: initialIsFollowing,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovered, setIsHovered] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setIsFollowing((prev) => !prev);

    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if ("error" in result) {
        setIsFollowing((prev) => !prev);
      } else {
        setIsFollowing(result.following);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded transition-all duration-150 cursor-pointer disabled:opacity-50",
        isFollowing
          ? isHovered
            ? "border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10"
            : "border border-white/10 text-[#aaa] bg-transparent hover:border-white/20"
          : "bg-[#E8C97A] text-[#0c0c0c] hover:bg-[#dabb65] border border-transparent",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isFollowing ? (
        <>
          {isHovered ? (
            <>
              <UserPlus className="h-3 w-3" />
              Unfollow
            </>
          ) : (
            <>
              <UserCheck className="h-3 w-3" />
              Following
            </>
          )}
        </>
      ) : (
        <>
          <UserPlus className="h-3 w-3" />
          Follow
        </>
      )}
    </button>
  );
}
