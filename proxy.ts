import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/write", "/edit", "/settings", "/welcome"];
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtectedPath) {
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

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};