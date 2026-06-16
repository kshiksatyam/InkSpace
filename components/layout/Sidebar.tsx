"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Users } from "lucide-react";

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

interface TrendingTag {
  tag: string;
  count: number;
}

interface SidebarData {
  suggestedUsers: SuggestedUser[];
  trendingTags: TrendingTag[];
}

/**
 * Right-column sidebar for the home feed.
 * Fetches and displays:
 *   - "Who to Follow" — 3 users the current user doesn't already follow
 *   - "Trending Tags" — top 5 most-used tags across all published posts
 */
export function Sidebar() {
  const [data, setData] = useState<SidebarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sidebar")
      .then((res) => res.json())
      .then((json: SidebarData) => setData(json))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <aside className="w-full space-y-6">
      {/* Who to Follow */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Who to Follow</h3>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          ) : data?.suggestedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suggestions right now</p>
          ) : (
            data?.suggestedUsers.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 group"
              >
                <UserAvatar name={user.name} image={user.image} className="h-9 w-9" />
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <Separator />

      {/* Trending Tags */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Trending Tags</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))
          ) : data?.trendingTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trending tags yet</p>
          ) : (
            data?.trendingTags.map(({ tag, count }) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors">
                #{tag}
                <span className="ml-1.5 text-muted-foreground text-xs">{count}</span>
              </Badge>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
