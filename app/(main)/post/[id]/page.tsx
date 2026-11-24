import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExcerpt, formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/user/UserAvatar";
import { LikeButton } from "@/components/post/LikeButton";
import { FollowButton } from "@/components/user/FollowButton";
import { PostSummaryBlock } from "@/components/post/PostSummaryBlock";
import { Clock, Edit, MessageCircle, ArrowLeft } from "lucide-react";
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
    <article className="pb-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#555] hover:text-[#aaa] transition-colors mb-6"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to feed
      </Link>

      {/* Draft badge */}
      {!post.published && (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8C97A] border border-[#E8C97A]/30 bg-[#E8C97A]/5 px-2.5 py-1 rounded-sm mb-5">
          Draft — not published
        </div>
      )}

      {/* Title */}
      <header className="mb-7">
        <h1 className="text-3xl sm:text-[2rem] font-bold leading-tight tracking-tight text-[#efefef] mb-5">
          {post.title}
        </h1>

        {/* Author meta row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author.username}`}>
              <UserAvatar name={post.author.name} image={post.author.image} className="h-9 w-9" />
            </Link>
            <div>
              <Link
                href={`/profile/${post.author.username}`}
                className="text-sm font-semibold text-[#ddd] hover:text-white transition-colors"
              >
                {post.author.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-[#555] mt-0.5">
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
              <Link
                href={`/edit/${post.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-[#666] border border-white/8 hover:border-white/15 hover:text-[#ccc] px-3 py-1.5 rounded transition-all"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Link>
            ) : session?.user?.id ? (
              <FollowButton targetUserId={post.author.id} isFollowing={isFollowing} />
            ) : null}
          </div>
        </div>
      </header>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-[#555] border border-white/8 px-2 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {post.summary && (
        <div className="mb-7">
          <PostSummaryBlock summary={post.summary} />
        </div>
      )}

      {/* Post content */}
      <div
        className="prose max-w-none mb-10"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Divider */}
      <div className="border-t border-white/5 my-8" />

      {/* Actions row */}
      <div className="flex items-center gap-5 mb-8">
        <LikeButton
          postId={post.id}
          initialLiked={isLiked}
          initialCount={post._count.likes}
        />
        <div className="flex items-center gap-1.5 text-[#555] text-xs">
          <MessageCircle className="h-4 w-4" />
          <span className="tabular-nums">{post._count.comments}</span>
        </div>
      </div>

      {/* Author card */}
      <div className="border border-white/7 bg-[#131313] p-5 rounded-sm mb-10">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${post.author.username}`}>
            <UserAvatar name={post.author.name} image={post.author.image} className="h-11 w-11" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-sm text-[#ddd] hover:text-white transition-colors"
              >
                {post.author.name}
              </Link>
              {!isAuthor && session?.user?.id && (
                <FollowButton targetUserId={post.author.id} isFollowing={isFollowing} />
              )}
            </div>
            <p className="text-xs text-[#444] mb-1">@{post.author.username}</p>
            {post.author.bio && (
              <p className="text-xs text-[#666] leading-relaxed">{post.author.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div id="comments">
        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}
