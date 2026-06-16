"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  image: string | null;
  className?: string;
}

/**
 * User avatar with image support and initial-letter fallback.
 * Generates a consistent color based on the user's name for the fallback background.
 */
export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn("", className)}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
