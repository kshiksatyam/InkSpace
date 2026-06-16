import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/types";

/**
 * GET /api/users/[username]
 * Returns the public profile of a user by their username.
 * Includes follower/following counts, post count, and whether
 * the current user follows this profile.
 *
 * @param params.username - The user's unique username
 * @returns UserProfile on success
 * @returns 404 if user not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            posts: { where: { published: true } },
            followers: true,
            following: true,
          },
        },
        followers: session?.user?.id
          ? { where: { followerId: session.user.id }, select: { id: true } }
          : false,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile: UserProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      postCount: user._count.posts,
      isFollowedByCurrentUser: Array.isArray(user.followers)
        ? user.followers.length > 0
        : false,
    };

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("[GET /api/users/[username]]", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
