import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExcerpt, formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/user/UserAvatar";
import { FollowButton } from "@/components/user/FollowButton";
import { ProfileStats } from "@/components/user/ProfileStats";
import { PostCard } from "@/components/post/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from "next";
import type { PostCard as PostCardType } from "@/types";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, bio: true },
  });

  if (!user) return { title: "User not found" };

  return {
    title: `${user.name} (@${username})`,
    description: user.bio || `Check out ${user.name}'s profile on InkSpace`,
  };
}

/**
 * User profile page — shows user info, stats, follow button, and posts.
 * Tabs: Published posts and Liked posts.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          likes: session?.user?.id
            ? { where: { userId: session.user.id }, select: { id: true } }
            : false,
          _count: { select: { likes: true } },
        },
      },
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

  if (!user) notFound();

  const isOwnProfile = session?.user?.id === user.id;
  const isFollowing = Array.isArray(user.followers) ? user.followers.length > 0 : false;

  const shapedPosts: PostCardType[] = user.posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: getExcerpt(post.content),
    summary: post.summary,
    tags: post.tags,
    readingTime: post.readingTime,
    createdAt: post.createdAt.toISOString(),
    likeCount: post._count.likes,
    isLikedByCurrentUser: Array.isArray(post.likes) ? post.likes.length > 0 : false,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      image: post.author.image,
    },
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        <UserAvatar name={user.name} image={user.image} className="h-20 w-20 sm:h-24 sm:w-24 text-2xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
            {isOwnProfile ? (
              <Link href="/settings">
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-lg px-3 py-1.5">
                  Edit profile
                </button>
              </Link>
            ) : session?.user?.id ? (
              <FollowButton targetUserId={user.id} isFollowing={isFollowing} />
            ) : null}
          </div>
          {user.bio && (
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{user.bio}</p>
          )}
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/10"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
          <ProfileStats
            postCount={user._count.posts}
            followerCount={user._count.followers}
            followingCount={user._count.following}
          />
        </div>
      </div>

      {/* Posts */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full sm:w-auto mb-6">
          <TabsTrigger value="posts" className="flex-1 sm:flex-initial">
            Posts ({shapedPosts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {shapedPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? "You haven't published any posts yet."
                  : "This user hasn't published any posts yet."}
              </p>
              {isOwnProfile && (
                <Link href="/write">
                  <button className="mt-4 text-primary hover:underline">
                    Write your first post →
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {shapedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
