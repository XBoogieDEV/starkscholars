import { betterAuth } from "better-auth";
import { convexAdapter } from "better-auth/adapters/convex";

export const auth = betterAuth({
  database: convexAdapter(),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }) => {
      // TODO: Implement email sending via Resend
      console.log("Magic link for", email, url);
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
