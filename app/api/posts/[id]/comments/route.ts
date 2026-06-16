import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";
import type { CommentData } from "@/types";

/**
 * GET /api/posts/[id]/comments
 * Returns all comments for a post, ordered oldest first.
 *
 * @param params.id - MongoDB ObjectId of the post
 * @returns { comments: CommentData[] }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    const shapedComments: CommentData[] = comments.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        username: c.author.username,
        image: c.author.image,
      },
    }));

    return NextResponse.json({ comments: shapedComments }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/posts/[id]/comments]", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

/**
 * POST /api/posts/[id]/comments
 * Adds a comment to a post. Requires authentication.
 *
 * @requires Authentication
 * @body { text: string }
 * @returns Created CommentData with status 201
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = commentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: { text: validation.data.text, authorId: session.user.id, postId },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    const shapedComment: CommentData = {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.name,
        username: comment.author.username,
        image: comment.author.image,
      },
    };

    return NextResponse.json(shapedComment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts/[id]/comments]", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
