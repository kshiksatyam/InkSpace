"use client";

interface FeedTabsProps {
  activeTab: "forYou" | "following";
  onTabChange: (tab: "forYou" | "following") => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs: { id: "forYou" | "following"; label: string }[] = [
    { id: "forYou", label: "For you" },
    { id: "following", label: "Following" },
  ];

  return (
    <div className="flex border-b border-white/5 mb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 pb-3 pt-1 text-xs font-semibold uppercase tracking-widest transition-colors relative cursor-pointer ${
            activeTab === tab.id
              ? "text-[#E8C97A]"
              : "text-[#444] hover:text-[#888]"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#E8C97A]" />
          )}
        </button>
      ))}
    </div>
  );
}
