"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Heart, Users, MessageCircle, RefreshCw, Bell, Loader2 } from "lucide-react";
import type { ActivityEvent, ActivityType } from "@/app/api/activity/route";

// ── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Filter tab definitions
const FILTER_TABS: { id: ActivityType | "all"; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: Bell },
  { id: "like", label: "Likes", icon: Heart },
  { id: "follow", label: "Followers", icon: Users },
  { id: "comment", label: "Comments", icon: MessageCircle },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: ActivityType }) {
  if (type === "like") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
        <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
      </div>
    );
  }
  if (type === "follow") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CBA6F7]/10 border border-[#CBA6F7]/20">
        <Users className="h-4 w-4 text-[#CBA6F7]" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20">
      <MessageCircle className="h-4 w-4 text-sky-400" />
    </div>
  );
}

function ActivityMessage({ event }: { event: ActivityEvent }) {
  const actorLink = (
    <Link
      href={`/profile/${event.actor.username}`}
      className="font-semibold text-white hover:text-[#CBA6F7] transition-colors"
    >
      {event.actor.name}
    </Link>
  );

  if (event.type === "like" && event.post) {
    return (
      <p className="text-sm text-[#ccc] leading-snug">
        {actorLink}{" "}
        <span className="text-[#888]">liked your post</span>{" "}
        <Link
          href={`/post/${event.post.id}`}
          className="font-medium text-white hover:text-[#CBA6F7] transition-colors line-clamp-1"
        >
          &ldquo;{event.post.title}&rdquo;
        </Link>
      </p>
    );
  }

  if (event.type === "follow") {
    return (
      <p className="text-sm text-[#ccc] leading-snug">
        {actorLink}{" "}
        <span className="text-[#888]">started following you</span>
      </p>
    );
  }

  if (event.type === "comment" && event.post) {
    return (
      <div>
        <p className="text-sm text-[#ccc] leading-snug">
          {actorLink}{" "}
          <span className="text-[#888]">commented on</span>{" "}
          <Link
            href={`/post/${event.post.id}#comments`}
            className="font-medium text-white hover:text-[#CBA6F7] transition-colors"
          >
            &ldquo;{event.post.title}&rdquo;
          </Link>
        </p>
        {event.commentText && (
          <p className="mt-1 text-xs text-[#666] line-clamp-2 italic pl-0.5">
            &ldquo;{event.commentText}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return null;
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] -mx-4 px-4 rounded-lg transition-colors">
      {/* Actor avatar */}
      <Link href={`/profile/${event.actor.username}`} className="shrink-0 mt-0.5">
        <UserAvatar
          name={event.actor.name}
          image={event.actor.image}
          className="h-9 w-9"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <ActivityMessage event={event} />
        <p className="mt-1 text-[11px] text-[#555]">{timeAgo(event.createdAt)}</p>
      </div>

      {/* Type icon badge */}
      <ActivityIcon type={event.type} />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: ActivityType | "all" }) {
  const messages: Record<ActivityType | "all", { title: string; desc: string }> = {
    all: {
      title: "No activity yet",
      desc: "When people like your posts, follow you, or leave comments, you'll see it all here.",
    },
    like: {
      title: "No likes yet",
      desc: "Share your posts and readers will start liking them.",
    },
    follow: {
      title: "No followers yet",
      desc: "Keep writing great content and your audience will grow.",
    },
    comment: {
      title: "No comments yet",
      desc: "Engage with the community and they'll engage back.",
    },
  };

  const { title, desc } = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#CBA6F7]/10 border border-[#CBA6F7]/20">
        <Bell className="h-7 w-7 text-[#CBA6F7]" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-[#666] max-w-xs leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActivityType | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/activity");
      if (!res.ok) throw new Error("Failed to load activity");
      const data = await res.json();
      setActivities(data.activities ?? []);
    } catch {
      setError("Could not load your activity. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchActivity();
  }, [status, fetchActivity]);

  // Derive filtered list
  const filtered =
    activeFilter === "all"
      ? activities
      : activities.filter((a) => a.type === activeFilter);

  // Count per type for badge numbers
  const counts = {
    all: activities.length,
    like: activities.filter((a) => a.type === "like").length,
    follow: activities.filter((a) => a.type === "follow").length,
    comment: activities.filter((a) => a.type === "comment").length,
  };

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Bell className="h-12 w-12 text-[#333] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sign in to see your activity</h2>
        <p className="text-sm text-[#666]">
          <Link href="/login" className="text-[#CBA6F7] hover:underline">Log in</Link>{" "}
          or{" "}
          <Link href="/register" className="text-[#CBA6F7] hover:underline">create an account</Link>{" "}
          to view your notifications.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Activity</h1>
          <p className="text-sm text-[#666] mt-0.5">
            Likes, follows, and comments you&apos;ve received
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchActivity(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/15 disabled:opacity-40 cursor-pointer"
          aria-label="Refresh activity"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/8 pb-0">
        {FILTER_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className={`relative flex items-center gap-1.5 px-3 pb-3 pt-1 text-sm font-medium transition-colors cursor-pointer ${
              activeFilter === id
                ? "text-white"
                : "text-[#555] hover:text-[#aaa]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {counts[id] > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeFilter === id
                    ? "bg-[#CBA6F7]/20 text-[#CBA6F7]"
                    : "bg-white/8 text-[#555]"
                }`}
              >
                {counts[id]}
              </span>
            )}
            {/* Active underline */}
            {activeFilter === id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#CBA6F7] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#444]" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={() => fetchActivity()}
            className="text-xs text-[#CBA6F7] hover:underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <div className="-mx-0">
          {filtered.map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
