import { NextRequest, NextResponse } from "next/server";

// Environment variables
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
const BETTER_AUTH_COOKIE_NAME = process.env.BETTER_AUTH_COOKIE_NAME || "better-auth.session_token";

// Role type matching schema
type UserRole = "applicant" | "admin" | "committee";

// Route configuration
const PROTECTED_ROUTES = {
  apply: {
    pattern: /^\/apply/,
    allowedRoles: ["applicant"] as UserRole[],
    redirectUnauthenticated: "/login",
    redirectUnauthorized: "/",
  },
  admin: {
    pattern: /^\/admin/,
    allowedRoles: ["admin"] as UserRole[],
    redirectUnauthenticated: "/login",
    redirectUnauthorized: "/unauthorized",
  },
  committee: {
    pattern: /^\/committee/,
    allowedRoles: ["admin", "committee"] as UserRole[],
    redirectUnauthenticated: "/login",
    redirectUnauthorized: "/unauthorized",
  },
} as const;

/**
 * Get session token from request cookies
 * Better Auth stores the session in a cookie (default name: better-auth.session_token)
 */
function getSessionToken(request: NextRequest): string | null {
  // Try to get the session token from cookies
  const token = request.cookies.get(BETTER_AUTH_COOKIE_NAME)?.value;
  if (token) return token;

  // Also try common cookie names used by Better Auth
  const altToken = request.cookies.get("session")?.value ||
    request.cookies.get("better-auth.session")?.value;

  return altToken || null;
}

/**
 * Validate session token and get user info from Convex
 * Uses the Convex HTTP API to call the auth validation
 */
async function validateSession(
  token: string
): Promise<{ userId: string; email: string } | null> {
  if (!CONVEX_SITE_URL) {
    console.error("NEXT_PUBLIC_CONVEX_SITE_URL is not set");
    return null;
  }

  try {
    // Call the Convex action to validate the session token
    const response = await fetch(`${CONVEX_SITE_URL}/api/http`, {
      method: "POST",
      body: JSON.stringify({
        path: "betterAuth/adapter:getSessionAndUser",
        args: { sessionToken: token },
      }),
      headers: {
        "Content-Type": "application/json",
        // Pass the origin to appease trustedOrigins check on backend
        "Origin": process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com",
      },
    });

    if (!response.ok) {
      console.error("Session validation failed:", await response.text());
      return null;
    }

    const result = await response.json();
    const sessionData = result?.value;

    if (!sessionData?.session || !sessionData?.user) {
      return null;
    }

    // Check if session is expired
    if (sessionData.session.expiresAt < Date.now()) {
      return null;
    }

    return {
      userId: sessionData.user.id,
      email: sessionData.user.email,
    };
  } catch (error) {
    console.error("Error validating session:", error);
    return null;
  }
}

/**
 * Fetch the user's role from Convex using their email
 */
async function getUserRole(email: string): Promise<UserRole | null> {
  if (!CONVEX_SITE_URL) {
    console.error("NEXT_PUBLIC_CONVEX_SITE_URL is not set");
    return null;
  }

  try {
    // Call the Convex query to get user by email
    const response = await fetch(`${CONVEX_SITE_URL}/api/query`, {
      method: "POST",
      body: JSON.stringify({
        path: "users/getByEmail",
        args: { email },
      }),
      headers: {
        "Content-Type": "application/json",
        "Origin": process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user role:", await response.text());
      return null;
    }

    const result = await response.json();
    const user = result?.value;

    if (user && typeof user === "object") {
      return ((user as any).role as UserRole) || "applicant";
    }

    return null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Check if the path is an API route
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Get route configuration for the current path
 */
function getRouteConfig(pathname: string) {
  for (const [key, config] of Object.entries(PROTECTED_ROUTES)) {
    if (config.pattern.test(pathname)) {
      return { key, ...config };
    }
  }
  return null;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(
  userRole: UserRole | null,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Build redirect URL with preserved destination
 */
function buildRedirectUrl(
  baseUrl: string,
  currentPath: string,
  redirectParam: string
): string {
  const url = new URL(baseUrl);
  url.pathname = redirectParam;
  url.searchParams.set("redirect", currentPath);
  return url.toString();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies
  const sessionToken = getSessionToken(request);

  // Handle API routes
  if (isApiRoute(pathname)) {
    // Exclude Better Auth routes from auth requirement
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // API routes require authentication
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate the session token
    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // For API routes, session is valid - allow the request
    // Individual API endpoints should handle their own role checking if needed
    return NextResponse.next();
  }

  // Get route configuration
  const routeConfig = getRouteConfig(pathname);

  // If not a protected route, allow the request
  if (!routeConfig) {
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!sessionToken) {
    const redirectUrl = buildRedirectUrl(
      request.url,
      pathname,
      routeConfig.redirectUnauthenticated
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Validate session
  const session = await validateSession(sessionToken);

  // Handle invalid/expired session
  if (!session) {
    const redirectUrl = buildRedirectUrl(
      request.url,
      pathname,
      routeConfig.redirectUnauthenticated
    );
    // Clear the invalid session cookie
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(BETTER_AUTH_COOKIE_NAME);
    return response;
  }

  // Fetch user role from Convex
  const userRole = await getUserRole(session.email);

  // Handle case where user has session but no user record in DB
  if (!userRole) {
    // Redirect to login with error
    const redirectUrl = new URL(routeConfig.redirectUnauthenticated, request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    redirectUrl.searchParams.set("error", "account_not_found");
    return NextResponse.redirect(redirectUrl.toString());
  }

  // Check role authorization
  if (!hasRequiredRole(userRole, routeConfig.allowedRoles)) {
    // User is authenticated but doesn't have the required role
    return NextResponse.redirect(
      new URL(routeConfig.redirectUnauthorized, request.url)
    );
  }

  // User is authenticated and has the required role - allow the request
  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 * Using a matcher pattern that excludes static files automatically
 */
export const config = {
  matcher: [
    // Protected route groups
    "/apply/:path*",
    "/admin/:path*",
    "/committee/:path*",
    // API routes
    "/api/:path*",
  ],
};
