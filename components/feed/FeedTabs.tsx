"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedTabsProps {
  activeTab: "forYou" | "following";
  onTabChange: (tab: "forYou" | "following") => void;
}

/**
 * Feed mode toggle tabs: "For You" (trending) vs "Following" (chronological).
 */
export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as "forYou" | "following")}
    >
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="forYou" className="flex-1 sm:flex-initial">
          For You
        </TabsTrigger>
        <TabsTrigger value="following" className="flex-1 sm:flex-initial">
          Following
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
