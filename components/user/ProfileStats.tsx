"use client";

import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  postCount: number;
  followerCount: number;
  followingCount: number;
  className?: string;
}

/**
 * Displays a user's Posts / Followers / Following counts in a horizontal row.
 */
export function ProfileStats({
  postCount,
  followerCount,
  followingCount,
  className,
}: ProfileStatsProps) {
  const stats = [
    { label: "Posts", value: postCount },
    { label: "Followers", value: followerCount },
    { label: "Following", value: followingCount },
  ];

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {stats.map(({ label, value }) => (
        <div key={label} className="text-center">
          <p className="text-xl font-bold tabular-nums">{formatNumber(value)}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
