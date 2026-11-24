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
    <div className="pb-16">
      {/* Profile header */}
      <div className="border-b border-white/5 pb-7 mb-7">
        <div className="flex items-start gap-5">
          <UserAvatar name={user.name} image={user.image} className="h-16 w-16 sm:h-20 sm:w-20 text-2xl shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h1 className="text-xl font-bold text-[#efefef] tracking-tight">{user.name}</h1>
                <p className="text-sm text-[#555]">@{user.username}</p>
              </div>
              {isOwnProfile ? (
                <Link href="/settings">
                  <button className="text-xs text-[#666] hover:text-[#ccc] transition-colors border border-white/8 hover:border-white/15 rounded px-3 py-1.5 cursor-pointer">
                    Edit profile
                  </button>
                </Link>
              ) : session?.user?.id ? (
                <FollowButton targetUserId={user.id} isFollowing={isFollowing} />
              ) : null}
            </div>
            {user.bio && (
              <p className="text-sm text-[#777] leading-relaxed mt-2 max-w-sm">{user.bio}</p>
            )}
            <div className="mt-4">
              <ProfileStats
                postCount={user._count.posts}
                followerCount={user._count.followers}
                followingCount={user._count.following}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <Tabs defaultValue="posts">
        <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none p-0 mb-5 h-auto">
          <TabsTrigger
            value="posts"
            className="text-xs font-semibold uppercase tracking-widest pb-3 pt-1 px-4 rounded-none data-[state=active]:text-[#E8C97A] data-[state=active]:shadow-none data-[state=active]:border-b-[1px] data-[state=active]:border-[#E8C97A] text-[#444] bg-transparent hover:text-[#888] transition-colors"
          >
            Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {shapedPosts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#444]">
                {isOwnProfile
                  ? "You haven't published any posts yet."
                  : "This user hasn't published any posts yet."}
              </p>
              {isOwnProfile && (
                <Link href="/write">
                  <button className="mt-4 text-xs text-[#E8C97A] hover:underline cursor-pointer">
                    Write your first post →
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div>
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
