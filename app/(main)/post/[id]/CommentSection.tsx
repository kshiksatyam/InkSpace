"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import type { CommentData } from "@/types";

interface CommentSectionProps {
  postId: string;
}

/**
 * Comment section with list + add form.
 * Fetches comments client-side and allows posting new ones.
 */
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
      <h2 className="text-xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {/* Add comment form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isSubmitting || !text.trim()} className="gap-1.5">
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Post comment
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          <Link href="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.author.username}`} className="shrink-0">
                <UserAvatar
                  name={comment.author.name}
                  image={comment.author.image}
                  className="h-8 w-8"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link
                    href={`/profile/${comment.author.username}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
