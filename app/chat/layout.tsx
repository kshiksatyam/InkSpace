import { LeftSidebar } from "@/components/layout/LeftSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      {/* Fixed left sidebar */}
      <LeftSidebar />

      {/* Page body offset by left sidebar width */}
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        {/* Full width main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
