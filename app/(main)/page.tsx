import { auth } from "@/lib/auth";
import { FeedList } from "@/components/feed/FeedList";
import { Sidebar } from "@/components/layout/Sidebar";
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
 *   - Authenticated    → personalised feed + sidebar
 */
export default async function HomePage() {
  const session = await auth();

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex gap-8">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          <FeedList />
        </div>

        {/* Sidebar — hidden on mobile */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
