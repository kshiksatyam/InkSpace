"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PostCard } from "@/components/post/PostCard";
import { Loader2, Bookmark, RefreshCw } from "lucide-react";
import type { PostCard as PostCardType } from "@/types";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal();
  const [posts, setPosts] = useState<PostCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/bookmarks");
      if (!res.ok) {
        throw new Error("Failed to load bookmarks");
      }
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      setError("Could not load your bookmarks. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookmarks();
    }
  }, [status, fetchBookmarks]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#CBA6F7]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Bookmark className="h-12 w-12 text-[#333] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sign in to see your bookmarks</h2>
        <p className="text-sm text-[#666] max-w-sm mb-6">
          Keep track of the stories and posts you love. Save them to your private bookmarks to read them at any time.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => openModal("login")}
            className="bg-[#CBA6F7] hover:bg-[#b48fe8] text-[#1a1025] font-semibold px-5 py-2.5 rounded-full text-sm transition-colors cursor-pointer"
          >
            Log in
          </button>
          <button
            onClick={() => openModal("register")}
            className="border border-white/10 hover:bg-white/5 text-white font-medium px-5 py-2.5 rounded-full text-sm transition-colors cursor-pointer"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookmarks</h1>
          <p className="text-sm text-[#666] mt-1">
            Your private list of saved posts
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchBookmarks(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/15 disabled:opacity-40 cursor-pointer font-medium"
          aria-label="Refresh bookmarks"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#CBA6F7]" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={() => fetchBookmarks()}
            className="text-xs text-[#CBA6F7] hover:underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#CBA6F7]/10 border border-[#CBA6F7]/20">
            <Bookmark className="h-7 w-7 text-[#CBA6F7]" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No bookmarked posts</h3>
          <p className="text-sm text-[#666] max-w-xs leading-relaxed">
            Click the bookmark icon on any post in the feed to save it here for later.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
