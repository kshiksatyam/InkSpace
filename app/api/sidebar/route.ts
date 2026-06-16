import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUGGESTED_USERS_COUNT, TRENDING_TAGS_COUNT } from "@/lib/constants";

/**
 * GET /api/sidebar
 * Returns data for the home feed sidebar:
 *   - suggestedUsers: 3 users the current user doesn't follow
 *   - trendingTags: top 5 most used tags across all published posts
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    // Fetch IDs of users the current user already follows (to exclude them)
    let alreadyFollowingIds: string[] = [];
    if (session?.user?.id) {
      const follows = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      alreadyFollowingIds = follows.map((f) => f.followingId);
      // Also exclude the current user themselves
      alreadyFollowingIds.push(session.user.id);
    }

    // Fetch random suggested users (not already followed)
    const suggestedUsers = await prisma.user.findMany({
      where: { id: { notIn: alreadyFollowingIds } },
      select: { id: true, name: true, username: true, image: true },
      take: SUGGESTED_USERS_COUNT,
    });

    // Aggregate tags from all published posts, count occurrences, take top N
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { tags: true },
    });

    const tagCountMap = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1);
      }
    }

    const trendingTags = Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TRENDING_TAGS_COUNT)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({ suggestedUsers, trendingTags }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/sidebar]", error);
    return NextResponse.json({ error: "Failed to fetch sidebar data" }, { status: 500 });
  }
}
