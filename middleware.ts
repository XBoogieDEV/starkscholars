import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const config = {
  matcher: [
    "/apply/:path*",
    "/admin/:path*",
    "/committee/:path*",
    "/api/protected/:path*",
  ],
};

export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;
  
  // Not authenticated
  if (!sessionCookie) {
    if (pathname.startsWith("/apply")) {
      return NextResponse.redirect(new URL("/login?redirect=/apply", request.url));
    }
    if (pathname.startsWith("/admin") || pathname.startsWith("/committee")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  return NextResponse.next();
}
