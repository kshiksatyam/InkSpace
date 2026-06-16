import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InkSpace — Where Ideas Flow",
    template: "%s | InkSpace",
  },
  description:
    "InkSpace is a modern blogging platform where writers share stories, ideas, and knowledge with an engaged community.",
};

/**
 * Root layout — wraps the entire app with:
 *   - Inter font
 *   - NextAuth SessionProvider (client-side session context)
 *   - Sonner toast notifications
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <SessionProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
