"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { PenLine, LogOut, User, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user/UserAvatar";
import { SearchInput } from "./SearchInput";
import type { SessionUser } from "@/types";

/**
 * Main navigation bar displayed on all (main) layout pages.
 * Shows the InkSpace logo, a "Write" CTA, and either a login button
 * or a user avatar dropdown (when authenticated).
 */
export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            InkSpace
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-sm mx-4">
          <SearchInput />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/write">
                <Button size="sm" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  <span className="hidden sm:inline">Write</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all outline-none"
                >
                  <UserAvatar
                    name={user.name}
                    image={user.image}
                    className="h-9 w-9"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-2" />
                  }>
                      <User className="h-4 w-4" />
                      Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem render={
                    <Link href="/settings" className="flex items-center gap-2" />
                  }>
                      <Settings className="h-4 w-4" />
                      Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
