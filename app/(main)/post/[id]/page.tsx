import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExcerpt, formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/user/UserAvatar";
import { LikeButton } from "@/components/post/LikeButton";
import { FollowButton } from "@/components/user/FollowButton";
import { PostSummaryBlock } from "@/components/post/PostSummaryBlock";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, Edit, MessageCircle } from "lucide-react";
import { CommentSection } from "./CommentSection";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true, content: true },
  });

  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: getExcerpt(post.content),
  };
}

/**
 * Single post view page — full post content with author info, AI summary,
 * like button, follow button, and comments.
 */
export default async function PostPage({ params }: PostPageProps) {
  const session = await auth();
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          followers: { select: { followerId: true } },
        },
      },
      likes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) notFound();

  const isAuthor = session?.user?.id === post.authorId;
  if (!post.published && !isAuthor) notFound();

  const isLiked = Array.isArray(post.likes) ? post.likes.length > 0 : false;
  const isFollowing = session?.user?.id
    ? post.author.followers.some((f) => f.followerId === session!.user.id)
    : false;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        {!post.published && (
          <Badge variant="outline" className="mb-4 text-amber-600 border-amber-300 bg-amber-50">
            Draft
          </Badge>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {post.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author.username}`}>
              <UserAvatar name={post.author.name} image={post.author.image} className="h-11 w-11" />
            </Link>
            <div>
              <Link
                href={`/profile/${post.author.username}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {post.author.name}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(post.createdAt.toISOString())}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} min read
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthor ? (
              <Link href={`/edit/${post.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            ) : session?.user?.id ? (
              <FollowButton
                targetUserId={post.author.id}
                isFollowing={isFollowing}
              />
            ) : null}
          </div>
        </div>
      </header>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {post.summary && (
        <div className="mb-8">
          <PostSummaryBlock summary={post.summary} />
        </div>
      )}

      {/* Post content */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <Separator className="my-8" />

      {/* Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLiked={isLiked}
            initialCount={post._count.likes}
          />
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span className="tabular-nums">{post._count.comments}</span>
          </div>
        </div>
      </div>

      {/* Author card */}
      <div className="rounded-xl border border-border/60 bg-card p-6 mb-8">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${post.author.username}`}>
            <UserAvatar name={post.author.name} image={post.author.image} className="h-14 w-14" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-lg hover:text-primary transition-colors"
              >
                {post.author.name}
              </Link>
              {!isAuthor && session?.user?.id && (
                <FollowButton targetUserId={post.author.id} isFollowing={isFollowing} />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">@{post.author.username}</p>
            {post.author.bio && (
              <p className="text-sm text-muted-foreground">{post.author.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} />
    </article>
  );
}
