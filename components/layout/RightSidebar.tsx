"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import type { SessionUser } from "@/types";

interface SidebarData {
  trendingTags: { tag: string; count: number }[];
  suggestedUsers: { id: string; name: string; username: string; image: string | null }[];
}

export function RightSidebar() {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { openModal } = useAuthModal();
  const [data, setData] = useState<SidebarData | null>(null);

  useEffect(() => {
    fetch("/api/sidebar")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <aside className="w-full space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444]" />
        <input
          type="search"
          placeholder="Search InkSpace"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded bg-[#131313] border border-white/7 text-sm text-[#ccc] placeholder-[#444] focus:outline-none focus:border-[#E8C97A]/30 focus:ring-1 focus:ring-[#E8C97A]/20 transition-all"
        />
      </form>

      {/* Auth card or user info */}
      {!user ? (
        <div className="border border-white/7 bg-[#131313] p-5 rounded-sm">
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[#E8C97A] font-bold text-sm">Ink</span>
              <span className="text-white font-bold text-sm">Space</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Join the conversation</h3>
            <p className="text-xs text-[#555] leading-relaxed">
              Read, write, and connect with thoughtful people.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => openModal("register")}
              className="w-full bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-semibold text-xs py-2.5 px-4 rounded transition-colors duration-150 cursor-pointer"
            >
              Create free account
            </button>
            <button
              onClick={() => openModal("login")}
              className="w-full bg-transparent hover:bg-white/4 text-[#888] hover:text-white font-medium text-xs py-2 px-4 rounded border border-white/8 hover:border-white/15 transition-colors duration-150 cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-white/7 bg-[#131313] p-4 rounded-sm">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar name={user.name} image={user.image} className="h-9 w-9" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
              <p className="text-xs text-[#555] truncate">@{user.username}</p>
            </div>
          </div>
          <Link href="/write">
            <button className="w-full bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-semibold text-xs py-2 px-4 rounded transition-colors duration-150 cursor-pointer">
              Write a post
            </button>
          </Link>
        </div>
      )}

      {/* Trending tags */}
      {data?.trendingTags && data.trendingTags.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#444] font-semibold mb-3">
            Trending
          </p>
          <div className="space-y-0 divide-y divide-white/5">
            {data.trendingTags.slice(0, 6).map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="flex items-center justify-between py-2.5 group"
              >
                <span className="text-sm text-[#888] group-hover:text-[#ccc] transition-colors font-medium">
                  #{tag}
                </span>
                <span className="text-xs text-[#444] tabular-nums">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Suggested writers */}
      {data?.suggestedUsers && data.suggestedUsers.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#444] font-semibold mb-3">
            Writers to follow
          </p>
          <div className="space-y-3">
            {data.suggestedUsers.slice(0, 4).map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                className="flex items-center gap-3 group"
              >
                <UserAvatar name={u.name} image={u.image} className="h-7 w-7 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#aaa] group-hover:text-white transition-colors truncate">
                    {u.name}
                  </p>
                  <p className="text-[11px] text-[#444] truncate">@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
