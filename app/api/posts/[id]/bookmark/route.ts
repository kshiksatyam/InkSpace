import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/posts/[id]/bookmark
 * Toggles the bookmarked status of a post for the authenticated user.
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

    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let bookmarked: boolean;

    if (existingBookmark) {
      // Delete bookmark
      await prisma.bookmark.delete({
        where: { userId_postId: { userId, postId } },
      });
      bookmarked = false;
    } else {
      // Create bookmark
      await prisma.bookmark.create({
        data: { userId, postId },
      });
      bookmarked = true;
    }

    return NextResponse.json({ bookmarked }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/posts/[id]/bookmark]", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
