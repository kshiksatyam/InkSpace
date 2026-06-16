"use server";

import { auth } from "@/lib/auth";
import { generatePostSummary } from "@/lib/gemini";
import { AI_RATE_LIMIT_MS } from "@/lib/constants";

/** In-memory rate limit store — keyed by userId */
const rateLimitMap = new Map<string, number>();

/**
 * Server Action: generateSummary
 * Calls the Gemini API to generate a 2-sentence post summary.
 * Applies a per-user rate limit of 1 request per AI_RATE_LIMIT_MS.
 *
 * @param content - Raw HTML content from the Tiptap editor
 * @returns { summary: string } on success, or { error: string } on failure
 */
export async function generateSummary(
  content: string
): Promise<{ summary: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to generate a summary" };
  }

  const userId = session.user.id;
  const now = Date.now();
  const lastRequest = rateLimitMap.get(userId);

  if (lastRequest && now - lastRequest < AI_RATE_LIMIT_MS) {
    const waitSeconds = Math.ceil((AI_RATE_LIMIT_MS - (now - lastRequest)) / 1000);
    return { error: `Please wait ${waitSeconds}s before generating another summary` };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Post content is required" };
  }

  rateLimitMap.set(userId, now);

  try {
    const summary = await generatePostSummary(content);
    return { summary };
  } catch (error) {
    console.error("[generateSummary action]", error);
    return { error: "Could not generate summary. Try again." };
  }
}
