import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExcerpt } from "@/lib/utils";
import type { PostCard } from "@/types";

/**
 * GET /api/bookmarks
 * Returns all bookmarked posts for the authenticated user.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch bookmarks with nested post details
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, username: true, image: true } },
            likes: { where: { userId }, select: { id: true } },
            _count: { select: { likes: true } },
          },
        },
      },
    });

    const bookmarkedPosts: PostCard[] = bookmarks.map((bookmark) => {
      const post = bookmark.post;
      return {
        id: post.id,
        title: post.title,
        excerpt: getExcerpt(post.content),
        summary: post.summary,
        tags: post.tags,
        readingTime: post.readingTime,
        createdAt: post.createdAt.toISOString(),
        likeCount: post._count.likes,
        isLikedByCurrentUser: Array.isArray(post.likes) ? post.likes.length > 0 : false,
        isBookmarkedByCurrentUser: true, // It is in the bookmark list, so true
        author: {
          id: post.author.id,
          name: post.author.name,
          username: post.author.username,
          image: post.author.image,
        },
      };
    });

    return NextResponse.json({ posts: bookmarkedPosts }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/bookmarks]", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}
