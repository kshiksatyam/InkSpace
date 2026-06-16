"use client";

import { useState, useEffect, useCallback } from "react";
import { PostCard } from "@/components/post/PostCard";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PostCard as PostCardType } from "@/types";

/**
 * Main feed list with infinite scroll.
 * Supports switching between "For You" and "Following" modes.
 */
export function FeedList() {
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [posts, setPosts] = useState<PostCardType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await fetch(
          `/api/posts?feed=${activeTab}&page=${pageNum}`
        );
        const data = await res.json();

        if (data && Array.isArray(data.posts)) {
          if (append) {
            setPosts((prev) => [...prev, ...data.posts]);
          } else {
            setPosts(data.posts);
          }
          setHasMore(data.hasMore ?? false);
        } else {
          setHasMore(false);
          if (!append) setPosts([]);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab]
  );

  // Reset and fetch when tab changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  }, [activeTab, fetchPosts]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  }

  function handleTabChange(tab: "forYou" | "following") {
    setActiveTab(tab);
  }

  return (
    <div className="space-y-6">
      <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium text-muted-foreground">
            {activeTab === "following"
              ? "Follow some users to see their posts here."
              : "No posts yet. Be the first to write!"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="min-w-[140px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
