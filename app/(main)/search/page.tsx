import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/post/PostCard";
import { UserAvatar } from "@/components/user/UserAvatar";
import Link from "next/link";
import { getExcerpt } from "@/lib/utils";
import type { PostCard as PostCardType } from "@/types";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await auth();
  const { q: query } = await searchParams;

  if (!query) {
    return (
      <div className="py-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#444] font-semibold mb-3">
          Search
        </p>
        <h1 className="text-2xl font-bold text-[#efefef] tracking-tight mb-2">Find anything</h1>
        <p className="text-sm text-[#555]">Search for posts, people, or topics.</p>
      </div>
    );
  }

  const [posts, users] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
          { content: { contains: query, mode: "insensitive" } },
          { author: { name: { contains: query, mode: "insensitive" } } },
          { author: { username: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: 10,
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        likes: session?.user?.id
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
        _count: { select: { likes: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
  ]);

  const shapedPosts: PostCardType[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: getExcerpt(post.content),
    summary: post.summary,
    tags: post.tags,
    readingTime: post.readingTime,
    createdAt: post.createdAt.toISOString(),
    likeCount: post._count.likes,
    isLikedByCurrentUser: Array.isArray(post.likes) ? post.likes.length > 0 : false,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      image: post.author.image,
    },
  }));

  return (
    <div className="pb-16">
      <div className="mb-7 border-b border-white/5 pb-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#444] font-semibold mb-1">
          Search results
        </p>
        <h1 className="text-xl font-bold text-[#efefef] tracking-tight">
          &ldquo;{query}&rdquo;
        </h1>
      </div>

      {/* People */}
      {users.length > 0 && (
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#444] font-semibold mb-4">
            People
          </p>
          <div className="space-y-1 divide-y divide-white/5">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 py-3 group"
              >
                <UserAvatar name={user.name} image={user.image} className="h-8 w-8 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#aaa] group-hover:text-white transition-colors">{user.name}</p>
                  <p className="text-xs text-[#444]">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#444] font-semibold mb-4">
          Posts
        </p>
        {shapedPosts.length === 0 ? (
          <p className="text-sm text-[#444] py-8">No posts found for &ldquo;{query}&rdquo;.</p>
        ) : (
          <div>
            {shapedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
