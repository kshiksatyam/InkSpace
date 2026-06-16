import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { getExcerpt, calculateReadingTime } from "@/lib/utils";
import type { PostFull } from "@/types";

/**
 * GET /api/posts/[id]
 * Returns the full content of a single post by ID.
 * Includes author details, like count, and whether current user has liked it.
 *
 * @param params.id - MongoDB ObjectId of the post
 * @returns PostFull on success
 * @returns 404 if post not found or not published (and requester is not the author)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
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
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only the author can see unpublished posts
    const isAuthor = session?.user?.id === post.authorId;
    if (!post.published && !isAuthor) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const followerCount = post.author.followers.length;
    const isFollowedByCurrentUser =
      session?.user?.id
        ? post.author.followers.some((f) => f.followerId === session!.user.id)
        : false;

    const shapedPost: PostFull = {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: getExcerpt(post.content),
      summary: post.summary,
      tags: post.tags,
      readingTime: post.readingTime,
      createdAt: post.createdAt.toISOString(),
      published: post.published,
      likeCount: post._count.likes,
      isLikedByCurrentUser: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      author: {
        id: post.author.id,
        name: post.author.name,
        username: post.author.username,
        image: post.author.image,
        bio: post.author.bio,
        followerCount,
        isFollowedByCurrentUser,
      },
    };

    return NextResponse.json(shapedPost, { status: 200 });
  } catch (error) {
    console.error("[GET /api/posts/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

/**
 * PUT /api/posts/[id]
 * Updates an existing post. Only the author can update their own post.
 *
 * @requires Authentication
 * @param params.id - MongoDB ObjectId of the post
 * @body { title, content, summary?, tags, published }
 * @returns Updated PostFull on success
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own posts" },
        { status: 403 }
      );
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

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        summary: summary ?? null,
        tags,
        published,
        readingTime: calculateReadingTime(content),
      },
      include: {
        author: { select: { id: true, name: true, username: true, image: true, bio: true } },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/posts/[id]]", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id]
 * Permanently deletes a post. Only the author can delete their own post.
 *
 * @requires Authentication
 * @param params.id - MongoDB ObjectId of the post
 * @returns 200 with success message on deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own posts" },
        { status: 403 }
      );
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/posts/[id]]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
