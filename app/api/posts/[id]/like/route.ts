import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/posts/[id]/like
 * Toggles the like status of a post for the authenticated user.
 * If the user has already liked the post, it unlikes it (delete).
 * If the user has not liked it, it creates a Like record.
 *
 * Uses useOptimistic on the client for instant UI feedback.
 *
 * @requires Authentication
 * @param params.id - MongoDB ObjectId of the post
 * @returns { liked: boolean, likeCount: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id;

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user has already liked this post
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let liked: boolean;

    if (existingLike) {
      // Already liked — remove the like (unlike)
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      liked = false;
    } else {
      // Not liked yet — create a like
      await prisma.like.create({
        data: { userId, postId },
      });
      liked = true;
    }

    // Return the updated like count for the UI
    const likeCount = await prisma.like.count({ where: { postId } });

    return NextResponse.json({ liked, likeCount }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/posts/[id]/like]", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
