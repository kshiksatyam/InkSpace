"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { calculateReadingTime } from "@/lib/utils";
import type { PostInput } from "@/lib/validations";

/**
 * Server Action: createPost
 * Creates a new blog post for the authenticated user.
 * Redirects to the new post page on success.
 *
 * @param data - Validated post fields (title, content, summary, tags, published)
 * @returns { error: string } on failure, redirects on success
 */
export async function createPost(
  data: PostInput
): Promise<{ error: string } | never> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a post" };
  }

  const validation = postSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Invalid post data" };
  }

  const { title, content, summary, tags, published } = validation.data;

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
  });

  revalidatePath("/");
  revalidatePath(`/profile/${session.user.username}`);
  redirect(`/post/${post.id}`);
}

/**
 * Server Action: updatePost
 * Updates an existing post. Only the author may update their post.
 *
 * @param postId - MongoDB ObjectId of the post to update
 * @param data - Updated post fields
 * @returns { error: string } on failure, redirects on success
 */
export async function updatePost(
  postId: string,
  data: PostInput
): Promise<{ error: string } | never> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to edit a post" };
  }

  const existingPost = await prisma.post.findUnique({ where: { id: postId } });
  if (!existingPost) return { error: "Post not found" };
  if (existingPost.authorId !== session.user.id) {
    return { error: "You can only edit your own posts" };
  }

  const validation = postSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Invalid post data" };
  }

  const { title, content, summary, tags, published } = validation.data;

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      summary: summary ?? null,
      tags,
      published,
      readingTime: calculateReadingTime(content),
    },
  });

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  redirect(`/post/${postId}`);
}

/**
 * Server Action: deletePost
 * Permanently deletes a post. Only the author may delete it.
 *
 * @param postId - MongoDB ObjectId of the post to delete
 * @returns { error: string } on failure, { success: true } on success
 */
export async function deletePost(
  postId: string
): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existingPost = await prisma.post.findUnique({ where: { id: postId } });
  if (!existingPost) return { error: "Post not found" };
  if (existingPost.authorId !== session.user.id) {
    return { error: "You can only delete your own posts" };
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/");
  revalidatePath(`/profile/${session.user.username}`);
  return { success: true };
}

/**
 * Server Action: toggleLike
 * Toggles the like status on a post for the current user.
 * Used by the LikeButton component with useOptimistic.
 *
 * @param postId - MongoDB ObjectId of the post to like/unlike
 * @returns { liked: boolean, likeCount: number } or { error: string }
 */
export async function toggleLike(
  postId: string
): Promise<{ liked: boolean; likeCount: number } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in to like posts" };

  const userId = session.user.id;

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  let liked: boolean;
  if (existingLike) {
    await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    liked = false;
  } else {
    await prisma.like.create({ data: { userId, postId } });
    liked = true;
  }

  const likeCount = await prisma.like.count({ where: { postId } });
  revalidatePath(`/post/${postId}`);
  return { liked, likeCount };
}
