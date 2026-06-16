import Link from "next/link";
import { BookOpen } from "lucide-react";

/**
 * Simple site footer with links and copyright notice.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>InkSpace</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/write" className="hover:text-foreground transition-colors">Write</Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            © {currentYear} InkSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
