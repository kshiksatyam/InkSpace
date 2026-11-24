import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/activity
 * Aggregates all activity events for the authenticated user:
 *   - Likes received on their posts
 *   - New followers
 *   - Comments received on their posts
 *
 * Each event is normalized into a unified ActivityEvent shape and
 * sorted by date descending (newest first).
 *
 * @requires Authentication
 * @returns { activities: ActivityEvent[] }
 */

export type ActivityType = "like" | "follow" | "comment";

export interface ActivityEvent {
  id: string;          // unique id of the underlying record
  type: ActivityType;
  createdAt: string;   // ISO string

  /** The user who performed the action */
  actor: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };

  /** Optional: the post that was liked / commented on */
  post?: {
    id: string;
    title: string;
  };

  /** Optional: comment text (for comment events) */
  commentText?: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Run all three queries in parallel for efficiency
    const [likes, follows, comments] = await Promise.all([
      // Likes received: someone liked a post authored by the current user
      prisma.like.findMany({
        where: {
          post: { authorId: userId },
          // Don't show if the current user liked their own post
          userId: { not: userId },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
          post: { select: { id: true, title: true } },
        },
      }),

      // Follows received: someone started following the current user
      prisma.follow.findMany({
        where: { followingId: userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          follower: { select: { id: true, name: true, username: true, image: true } },
        },
      }),

      // Comments received: someone commented on a post authored by the current user
      prisma.comment.findMany({
        where: {
          post: { authorId: userId },
          // Don't show if the current user commented on their own post
          authorId: { not: userId },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          post: { select: { id: true, title: true } },
        },
      }),
    ]);

    // Normalize each result into the unified ActivityEvent shape
    const likeEvents: ActivityEvent[] = likes.map((like) => ({
      id: `like-${like.id}`,
      type: "like",
      createdAt: like.createdAt.toISOString(),
      actor: {
        id: like.user.id,
        name: like.user.name,
        username: like.user.username,
        image: like.user.image,
      },
      post: {
        id: like.post.id,
        title: like.post.title,
      },
    }));

    const followEvents: ActivityEvent[] = follows.map((follow) => ({
      id: `follow-${follow.id}`,
      type: "follow",
      createdAt: follow.createdAt.toISOString(),
      actor: {
        id: follow.follower.id,
        name: follow.follower.name,
        username: follow.follower.username,
        image: follow.follower.image,
      },
    }));

    const commentEvents: ActivityEvent[] = comments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: "comment",
      createdAt: comment.createdAt.toISOString(),
      actor: {
        id: comment.author.id,
        name: comment.author.name,
        username: comment.author.username,
        image: comment.author.image,
      },
      post: {
        id: comment.post.id,
        title: comment.post.title,
      },
      commentText: comment.text,
    }));

    // Merge and sort by date descending
    const activities: ActivityEvent[] = [
      ...likeEvents,
      ...followEvents,
      ...commentEvents,
    ].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/activity]", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
