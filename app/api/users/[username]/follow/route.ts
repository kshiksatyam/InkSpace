import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/users/[username]/follow
 * Toggles follow/unfollow for the given username.
 * If already following → unfollows. Otherwise → follows.
 * A user cannot follow themselves.
 *
 * @requires Authentication
 * @param params.username - The username of the user to follow/unfollow
 * @returns { following: boolean, followerCount: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    const followerId = session.user.id;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followingId = targetUser.id;

    if (followerId === followingId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if the follow relationship already exists
    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    let isNowFollowing: boolean;

    if (existingFollow) {
      // Already following — unfollow by deleting the record
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });
      isNowFollowing = false;
    } else {
      // Not following — create a follow record
      await prisma.follow.create({
        data: { followerId, followingId },
      });
      isNowFollowing = true;
    }

    // Return updated follower count for the target user
    const followerCount = await prisma.follow.count({
      where: { followingId },
    });

    return NextResponse.json(
      { following: isNowFollowing, followerCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/users/[username]/follow]", error);
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}
