import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePostSummary } from "@/lib/gemini";
import { AI_RATE_LIMIT_MS } from "@/lib/constants";

/**
 * In-memory rate limit map: userId → timestamp of last summarize request.
 * Simple per-user throttle — 1 request per AI_RATE_LIMIT_MS window.
 * NOTE: In production with multiple serverless instances, use Redis instead.
 */
const rateLimitMap = new Map<string, number>();

/**
 * POST /api/ai/summarize
 * Generates a 2-sentence AI summary of a blog post using Google Gemini.
 *
 * @requires Authentication — user must be logged in
 * @body { content: string } — raw HTML post content from the editor
 * @returns { summary: string } on success
 * @returns 401 if not authenticated
 * @returns 429 if rate limit exceeded
 * @returns 400 if content is missing
 * @returns 500 if Gemini API call fails
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate a summary" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const now = Date.now();
    const lastRequestTime = rateLimitMap.get(userId);

    // Enforce 1 request per AI_RATE_LIMIT_MS per user
    if (lastRequestTime && now - lastRequestTime < AI_RATE_LIMIT_MS) {
      const retryAfterSeconds = Math.ceil(
        (AI_RATE_LIMIT_MS - (now - lastRequestTime)) / 1000
      );
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${retryAfterSeconds}s before trying again.` },
        {
          status: 429,
          headers: { "Retry-After": retryAfterSeconds.toString() },
        }
      );
    }

    const body = await request.json();
    const { content } = body as { content: string };

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Post content is required to generate a summary" },
        { status: 400 }
      );
    }

    // Record the timestamp before calling Gemini
    rateLimitMap.set(userId, now);

    const summary = await generatePostSummary(content);

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    console.error("[AI Summarize] Gemini call failed:", error);
    return NextResponse.json(
      { error: "Summary generation failed. Please try again." },
      { status: 500 }
    );
  }
}
