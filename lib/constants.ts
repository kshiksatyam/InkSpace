/**
 * Application-wide constants.
 * Centralizes all magic numbers and reusable strings to avoid hardcoding.
 */

/** Maximum number of tags allowed per post */
export const MAX_TAGS = 5;

/** Character length for post excerpts shown in feed cards */
export const EXCERPT_LENGTH = 150;

/** Number of posts loaded per page (infinite scroll batch size) */
export const POSTS_PER_PAGE = 10;

/** Minimum title length for a valid post */
export const MIN_TITLE_LENGTH = 10;

/** Minimum content length for a valid post (characters) */
export const MIN_CONTENT_LENGTH = 100;

/** Minimum username length */
export const MIN_USERNAME_LENGTH = 3;

/** Average words per minute for reading time calculation */
export const WORDS_PER_MINUTE = 200;

/** Rate limit window for AI summarization in milliseconds (10 seconds) */
export const AI_RATE_LIMIT_MS = 10_000;

/** Number of "Who to Follow" suggestions shown in sidebar */
export const SUGGESTED_USERS_COUNT = 3;

/** Number of trending tags shown in sidebar */
export const TRENDING_TAGS_COUNT = 5;

/** Number of "More from author" posts shown on single post view */
export const MORE_FROM_AUTHOR_COUNT = 3;

/** Maximum allowed profile bio length */
export const MAX_BIO_LENGTH = 500;

/** Default interests shown during onboarding */
export const DEFAULT_INTERESTS = [
  "Technology",
  "Design",
  "Science",
  "Programming",
  "AI & Machine Learning",
  "Web Development",
  "Data Science",
  "Startups",
  "Productivity",
  "Lifestyle",
] as const;

/** Minimum interests to select during onboarding */
export const MIN_INTERESTS = 3;

/** Protected routes that require authentication */
export const PROTECTED_ROUTES = ["/write", "/edit", "/settings", "/welcome"];

/** Routes accessible only when NOT logged in */
export const AUTH_ROUTES = ["/login", "/register"];
