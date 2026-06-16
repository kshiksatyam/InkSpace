import { GoogleGenerativeAI } from "@google/generative-ai";
import { stripHtml } from "@/lib/utils";

/**
 * Lazy-initialized Gemini client — only created when first called.
 * This avoids errors if GEMINI_API_KEY is not set during build time.
 */
let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Returns the initialized Gemini client, creating it on first call.
 * @throws Error if GEMINI_API_KEY is not set in environment
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

/**
 * Generates a 2-sentence editorial summary of a blog post using Google Gemini.
 *
 * The function strips HTML tags from the content before sending to the API
 * to avoid confusing the model with markup. Uses the exact system prompt
 * specified in the product spec for consistent, high-quality summaries.
 *
 * @param content - Raw HTML content from the Tiptap rich text editor
 * @returns A 2-sentence plain-text summary of the post
 * @throws Error if the Gemini API call fails or returns no text
 */
export async function generatePostSummary(content: string): Promise<string> {
  const client = getGeminiClient();

  // Strip HTML tags before sending — the model doesn't need markup context
  const plainTextContent = stripHtml(content);

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an editorial assistant for a blogging platform.
A user has written a blog post. Your job is to write a summary
of exactly 2 sentences. The summary must be clear, engaging,
and readable by a general audience. Do not use phrases like
"This post is about" or "The author discusses". Write the
summary as if you are describing the post to a friend.
Return ONLY the 2-sentence summary. Nothing else.`,
  });

  const result = await model.generateContent(plainTextContent);
  const response = result.response;
  const summaryText = response.text();

  if (!summaryText) {
    throw new Error("Gemini returned an empty response");
  }

  return summaryText.trim();
}
