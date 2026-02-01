import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";

// TODO: Replace with Convex adapter after component setup
// For now using memory adapter to allow deployment
export const auth = betterAuth({
  database: memoryAdapter({}),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Simplified for initial deployment
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
