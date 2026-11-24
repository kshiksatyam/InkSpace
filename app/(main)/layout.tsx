import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { PageTransition } from "@/components/providers/PageTransition";

/**
 * 3-column editorial layout:
 *   [LeftSidebar (fixed 200px)] | [Center (scrollable, max-640px)] | [RightSidebar (sticky, 260px)]
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#efefef]">
      {/* Fixed left sidebar */}
      <LeftSidebar />

      {/* Page body offset by sidebar width */}
      <div className="ml-[200px] flex min-h-screen">
        {/* Scrollable center column */}
        <main className="flex-1 min-w-0 border-r border-white/5">
          <div className="max-w-[640px] mx-auto px-6 py-7">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>

        {/* Sticky right sidebar */}
        <aside className="hidden lg:block w-[260px] xl:w-[290px] shrink-0 px-5 py-7 border-r border-white/5">
          <div className="sticky top-7">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
