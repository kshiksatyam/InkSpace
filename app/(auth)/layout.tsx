import { BookOpen } from "lucide-react";
import Link from "next/link";

/**
 * Auth layout — centered card design for login/register pages.
 * Minimal chrome, focused on the auth form.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 text-2xl font-bold tracking-tight"
      >
        <BookOpen className="h-7 w-7 text-primary" />
        <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          InkSpace
        </span>
      </Link>

      {/* Auth form container */}
      <div className="w-full max-w-md">{children}</div>

      {/* Bottom link */}
      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} InkSpace. All rights reserved.
      </p>
    </div>
  );
}
