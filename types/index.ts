/**
 * Shared TypeScript interfaces used across the entire application.
 * These types mirror the Prisma models but are shaped for API responses and UI consumption.
 * Never use 'any' — always reference these interfaces.
 */

/** Minimal user information displayed on post cards and comments */
export interface UserBasic {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

/** Post data shaped for feed display as a card */
export interface PostCard {
  id: string;
  title: string;
  excerpt: string; // first 150 chars of content, HTML stripped
  summary: string | null;
  tags: string[];
  readingTime: number;
  createdAt: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  isBookmarkedByCurrentUser?: boolean;
  author: UserBasic;
}

/** Full post data for the single post view — extends PostCard with full content */
export interface PostFull extends PostCard {
  content: string; // full HTML content from the editor
  published: boolean;
  author: UserBasic & {
    bio: string | null;
    followerCount: number;
    isFollowedByCurrentUser: boolean;
  };
}

/** User profile data for the profile page */
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  image: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowedByCurrentUser: boolean;
}

/** Comment data for the post comment section */
export interface CommentData {
  id: string;
  text: string;
  createdAt: string;
  author: UserBasic;
}

/** API response wrapper for paginated lists */
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
}

/** Shape of the session user object returned by NextAuth */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
}
