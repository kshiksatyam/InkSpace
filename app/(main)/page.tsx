import { auth } from "@/lib/auth";
import { FeedList } from "@/components/feed/FeedList";
import { LandingPage } from "@/components/layout/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InkSpace — Where Ideas Flow",
  description:
    "InkSpace is a modern blogging platform where writers share stories, ideas, and knowledge with an engaged community.",
};

/**
 * Root page:
 *   - Unauthenticated → full landing/marketing page
 *   - Authenticated    → personalised feed (sidebar is in the layout)
 */
export default async function HomePage() {
  const session = await auth();

  if (!session) {
    return <LandingPage />;
  }

  return <FeedList />;
}
