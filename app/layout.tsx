import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InkSpace — Where Ideas Flow",
    template: "%s | InkSpace",
  },
  description:
    "InkSpace is a focused writing platform where writers share stories, ideas, and knowledge with an engaged community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <SessionProvider>
          <AuthModalProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </AuthModalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
