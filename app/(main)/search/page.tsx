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
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Search InkSpace</h1>
        <p className="text-muted-foreground">Enter a search term to find posts, people, or tags.</p>
      </div>
    );
  }

  // Search for posts (title, tags, or content) and users (name, username)
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold mb-8">
        Search results for "{query}"
      </h1>

      {users.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">People</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} image={user.image} />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Posts</h2>
        {shapedPosts.length === 0 ? (
          <p className="text-muted-foreground py-8">No posts found matching your search.</p>
        ) : (
          <div className="space-y-4">
            {shapedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
