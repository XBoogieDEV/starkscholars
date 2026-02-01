import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";

// Better Auth configuration
// Using memory adapter for now - will migrate to Convex adapter later
export const auth = betterAuth({
  // Base URL for callbacks and redirects
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  database: memoryAdapter({}),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Simplified for initial deployment
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  
  // Enable social providers when ready
  socialProviders: {},
});
