import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WORDS_PER_MINUTE, EXCERPT_LENGTH } from "@/lib/constants";

/**
 * Merges Tailwind CSS class names intelligently, resolving conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 * @param inputs - Class values to merge (strings, arrays, objects, etc.)
 * @returns Merged class name string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Strips all HTML tags from a string, returning plain text.
 * Used to clean editor output before sending to Gemini or generating excerpts.
 * @param html - Raw HTML string from the rich text editor
 * @returns Plain text with all tags removed
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/**
 * Calculates estimated reading time in minutes based on word count.
 * Uses the standard 200 words-per-minute reading speed.
 * @param content - HTML or plain text content of the post
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(content: string): number {
  const plainText = stripHtml(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return Math.max(1, minutes); // minimum 1 minute
}

/**
 * Extracts the first N characters from HTML content as a plain-text excerpt.
 * @param content - HTML content from the editor
 * @param length - Maximum character length for the excerpt (defaults to EXCERPT_LENGTH)
 * @returns Plain text excerpt, truncated with "..." if it exceeds the length
 */
export function getExcerpt(
  content: string,
  length: number = EXCERPT_LENGTH
): string {
  const plainText = stripHtml(content);
  if (plainText.length <= length) return plainText;
  return plainText.slice(0, length).trim() + "...";
}

/**
 * Formats a date string into a human-readable relative or absolute format.
 * Shows "Xm ago", "Xh ago", "Xd ago" for recent dates, otherwise "Mon DD, YYYY".
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generates a slug-safe version of a string (lowercase, hyphens, no special chars).
 * @param text - Input text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
