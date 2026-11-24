"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Search,
  Bell,
  Bookmark,
  Settings,
  LogOut,
  User,
  PenLine,
} from "lucide-react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import type { SessionUser } from "@/types";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Activity", href: "/activity", icon: Bell },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
];

export function LeftSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const { openModal } = useAuthModal();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] flex flex-col bg-[#0f0f0f] border-r border-white/5 z-40 px-3 py-5">
      {/* Logo — compact wordmark */}
      <Link href="/" className="flex items-center gap-1 mb-8 px-3 py-1 group">
        <span className="text-[#E8C97A] font-bold text-lg tracking-tight leading-none">Ink</span>
        <span className="text-white font-bold text-lg tracking-tight leading-none">Space</span>
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-100 group ${
                isActive
                  ? "text-white bg-white/8"
                  : "text-[#666] hover:text-[#ccc] hover:bg-white/4"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-[#E8C97A]" : "text-[#444] group-hover:text-[#888]"
                }`}
                strokeWidth={isActive ? 2 : 1.75}
              />
              {label}
            </Link>
          );
        })}

        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-100 group ${
              pathname.startsWith("/profile")
                ? "text-white bg-white/8"
                : "text-[#666] hover:text-[#ccc] hover:bg-white/4"
            }`}
          >
            <User
              className={`h-4 w-4 shrink-0 transition-colors ${
                pathname.startsWith("/profile")
                  ? "text-[#E8C97A]"
                  : "text-[#444] group-hover:text-[#888]"
              }`}
              strokeWidth={pathname.startsWith("/profile") ? 2 : 1.75}
            />
            Profile
          </Link>
        )}
      </nav>

      {/* Write CTA */}
      <div className="mb-4">
        <Link href="/write" className="block">
          <button className="w-full flex items-center justify-center gap-2 bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-semibold text-sm py-2.5 px-4 rounded transition-colors duration-150 cursor-pointer">
            <PenLine className="h-3.5 w-3.5" strokeWidth={2.5} />
            Write
          </button>
        </Link>
      </div>

      {/* User section */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-white/4 transition-colors outline-none cursor-pointer w-full group">
            <UserAvatar name={user.name} image={user.image} className="h-7 w-7 shrink-0" />
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-white truncate leading-none mb-0.5">{user.name}</p>
              <p className="text-[11px] text-[#555] truncate">@{user.username}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-44 bg-[#1a1a1a] border border-white/8 text-white rounded-sm shadow-xl py-1"
          >
            <DropdownMenuItem
              className="flex items-center gap-2 px-1.5 py-1 text-sm text-[#ccc] cursor-pointer"
            >
              <Link href="/settings" className="flex items-center gap-2 w-full">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-1.5 py-1 text-sm text-red-400 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex flex-col gap-1.5 px-1">
          <button
            onClick={() => openModal("login")}
            className="w-full text-sm text-[#777] hover:text-white py-2 px-3 rounded hover:bg-white/4 transition-colors cursor-pointer text-left font-medium"
          >
            Sign in
          </button>
          <button
            onClick={() => openModal("register")}
            className="w-full bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-semibold text-sm py-2 px-3 rounded transition-colors cursor-pointer"
          >
            Get started
          </button>
        </div>
      )}
    </aside>
  );
}
