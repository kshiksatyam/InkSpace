"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import type { CommentData } from "@/types";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to post comment");
        return;
      }

      const newComment: CommentData = await res.json();
      setComments((prev) => [...prev, newComment]);
      setText("");
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-[#aaa] uppercase tracking-widest mb-5">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Add comment */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full bg-[#131313] border border-white/7 hover:border-white/12 focus:border-[#E8C97A]/30 focus:ring-1 focus:ring-[#E8C97A]/15 text-[#ddd] rounded-sm px-4 py-3 text-sm placeholder-[#444] outline-none transition-all resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] px-4 py-2 rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3 w-3" />}
              Post
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-[#555] mb-6">
          <Link href="/login" className="text-[#E8C97A] hover:underline">Sign in</Link>{" "}
          to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-7 w-7 rounded-sm shrink-0 bg-white/5" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24 bg-white/5" />
                <Skeleton className="h-3.5 w-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[#444] py-6">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-5 divide-y divide-white/5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pt-5 first:pt-0">
              <Link href={`/profile/${comment.author.username}`} className="shrink-0">
                <UserAvatar
                  name={comment.author.name}
                  image={comment.author.image}
                  className="h-7 w-7"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile/${comment.author.username}`}
                    className="text-xs font-semibold text-[#aaa] hover:text-white transition-colors"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-[11px] text-[#444]">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-[#888] leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
