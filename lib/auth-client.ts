"use client";

import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // CRITICAL: Point to Convex Site URL where Better Auth server runs
  baseURL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    convexClient(),
    // crossDomainClient stores tokens in localStorage instead of relying on cookies
    // This is required for cross-origin auth (starkscholars.com -> convex.site)
    crossDomainClient(),
  ],
});

// Export commonly used methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;
