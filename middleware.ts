import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly Middleware) that protects routes requiring authentication.
 * Checks for the NextAuth session token cookie.
 * Redirects unauthenticated users to the login page, preserving
 * the original URL as a `callbackUrl` query parameter.
 *
 * NOTE: Uses a simple cookie check instead of importing auth() to avoid
 * pulling Prisma and other Node.js-only modules into the proxy bundle.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/write", "/edit", "/settings", "/welcome"];
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtectedPath) {
    // NextAuth stores session in either a secure or non-secure cookie
    const sessionToken =
      request.cookies.get("__Secure-authjs.session-token") ??
      request.cookies.get("authjs.session-token") ??
      request.cookies.get("__Secure-next-auth.session-token") ??
      request.cookies.get("next-auth.session-token");

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/** Only run proxy on non-static, non-API-auth routes */
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
