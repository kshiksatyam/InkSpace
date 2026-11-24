import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { getExcerpt, calculateReadingTime } from "@/lib/utils";
import { POSTS_PER_PAGE } from "@/lib/constants";
import type { PostCard } from "@/types";

/**
 * GET /api/posts
 * Returns a paginated list of published posts.
 * Supports two feed modes via `?feed=forYou|following`.
 * Supports `?page=N` for pagination (10 posts per page).
 *
 * @query feed - "forYou" (default) or "following"
 * @query page - page number (default 1)
 * @returns { posts: PostCard[], hasMore: boolean }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const feed = searchParams.get("feed") ?? "forYou";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const skip = (page - 1) * POSTS_PER_PAGE;

    let authorIdFilter: { in: string[] } | undefined;

    if (feed === "following") {
      // Following feed: only show posts from users the current user follows
      if (!session?.user?.id) {
        return NextResponse.json({ posts: [], hasMore: false }, { status: 200 });
      }

      const followedRelations = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });

      const followingUserIds = followedRelations.map((f) => f.followingId);
      authorIdFilter = { in: followingUserIds };
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          ...(authorIdFilter ? { authorId: authorIdFilter } : {}),
        },
        // "For You": sort by like count desc, then newest first
        // "Following": sort newest first
        orderBy:
          feed === "forYou"
            ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
            : { createdAt: "desc" },
        skip,
        take: POSTS_PER_PAGE,
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          likes: session?.user?.id
            ? { where: { userId: session.user.id }, select: { id: true } }
            : false,
          bookmarks: session?.user?.id
            ? { where: { userId: session.user.id }, select: { id: true } }
            : false,
          _count: { select: { likes: true } },
        },
      }),
      prisma.post.count({
        where: {
          published: true,
          ...(authorIdFilter ? { authorId: authorIdFilter } : {}),
        },
      }),
    ]);

    const shapedPosts: PostCard[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: getExcerpt(post.content),
      summary: post.summary,
      tags: post.tags,
      readingTime: post.readingTime,
      createdAt: post.createdAt.toISOString(),
      likeCount: post._count.likes,
      isLikedByCurrentUser: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      isBookmarkedByCurrentUser: Array.isArray(post.bookmarks) ? post.bookmarks.length > 0 : false,
      author: {
        id: post.author.id,
        name: post.author.name,
        username: post.author.username,
        image: post.author.image,
      },
    }));

    return NextResponse.json(
      { posts: shapedPosts, hasMore: skip + POSTS_PER_PAGE < totalCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/posts]", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

/**
 * POST /api/posts
 * Creates a new blog post for the authenticated user.
 *
 * @requires Authentication
 * @body { title, content, summary?, tags, published }
 * @returns Created PostCard on success with status 201
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = postSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { title, content, summary, tags, published } = validationResult.data;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        summary: summary ?? null,
        tags,
        published,
        readingTime: calculateReadingTime(content),
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        _count: { select: { likes: true } },
      },
    });

    const shapedPost: PostCard = {
      id: post.id,
      title: post.title,
      excerpt: getExcerpt(post.content),
      summary: post.summary,
      tags: post.tags,
      readingTime: post.readingTime,
      createdAt: post.createdAt.toISOString(),
      likeCount: 0,
      isLikedByCurrentUser: false,
      author: {
        id: post.author.id,
        name: post.author.name,
        username: post.author.username,
        image: post.author.image,
      },
    };

    return NextResponse.json(shapedPost, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
