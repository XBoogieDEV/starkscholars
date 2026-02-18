import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { api, components, internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

// Site URL for cross-domain auth (Next.js app origin)
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    appName: "Stark Scholars Platform",
    baseURL: process.env.BETTER_AUTH_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Changed to false for immediate access
      sendResetPassword: async ({ user, url }) => {
        if ("scheduler" in ctx && typeof (ctx as any).scheduler?.runAfter === "function") {
          await (ctx as any).scheduler.runAfter(0, api.emails.sendPasswordResetEmail, {
            email: user.email,
            url,
          });
        } else {
          console.error("[Better Auth] Cannot send reset email: scheduler not available");
        }
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    trustedOrigins: [
      "http://localhost:3000",
      "https://starkscholars.com",
      "https://www.starkscholars.com",
      "https://feature-branch.starkscholars.com" // Optional: for previews
    ],
    // Cross-origin cookie configuration for Convex Site URL
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none", // Required for cross-site requests (starkscholars.com -> convex.site)
        secure: true, // Required when sameSite is "none"
        httpOnly: true,
        path: "/",
      },
    },
    // crossDomain handles localStorage-based tokens for cross-site auth
    plugins: [
      convex({ authConfig }),
      crossDomain({ siteUrl: SITE_URL }),
    ],
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "applicant",
          required: false,
        },
      },
      changeEmail: {
        enabled: true,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            console.log("[databaseHooks] user.create.after fired for:", user.email, "id:", user.id);
            try {
              if ("scheduler" in ctx && typeof (ctx as any).scheduler?.runAfter === "function") {
                console.log("[databaseHooks] scheduler available, scheduling syncUser");
                await (ctx as any).scheduler.runAfter(0, internal.users.syncUser, {
                  email: user.email,
                  name: user.name,
                  role: user.role || "applicant",
                  image: user.image || undefined,
                  externalId: user.id,
                });
                console.log("[databaseHooks] syncUser scheduled successfully");
              } else if ("runMutation" in ctx && typeof (ctx as any).runMutation === "function") {
                console.log("[databaseHooks] No scheduler, trying runMutation");
                await (ctx as any).runMutation(internal.users.syncUser, {
                  email: user.email,
                  name: user.name,
                  role: user.role || "applicant",
                  image: user.image || undefined,
                  externalId: user.id,
                });
                console.log("[databaseHooks] syncUser via runMutation succeeded");
              } else {
                console.error("[databaseHooks] Neither scheduler nor runMutation available on ctx. Keys:", Object.keys(ctx));
              }
            } catch (e: any) {
              console.error("[databaseHooks] Error syncing user:", e.message || String(e));
            }
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            console.log("[databaseHooks] session.create.after fired for userId:", session.userId);
            try {
              if ("scheduler" in ctx && typeof (ctx as any).scheduler?.runAfter === "function") {
                await (ctx as any).scheduler.runAfter(0, internal.users.syncSession, {
                  token: session.token,
                  expiresAt: session.expiresAt,
                  baUserId: session.userId,
                  ipAddress: session.ipAddress || null,
                  userAgent: session.userAgent || null,
                });
                console.log("[databaseHooks] syncSession scheduled successfully");
              } else if ("runMutation" in ctx && typeof (ctx as any).runMutation === "function") {
                await (ctx as any).runMutation(internal.users.syncSession, {
                  token: session.token,
                  expiresAt: session.expiresAt,
                  baUserId: session.userId,
                  ipAddress: session.ipAddress || null,
                  userAgent: session.userAgent || null,
                });
                console.log("[databaseHooks] syncSession via runMutation succeeded");
              } else {
                console.error("[databaseHooks] Neither scheduler nor runMutation available for session sync. Keys:", Object.keys(ctx));
              }
            } catch (e: any) {
              console.error("[databaseHooks] Error syncing session:", e.message || String(e));
            }
          },
        },
      },
    },
  } satisfies BetterAuthOptions;
};

// For `@better-auth/cli`
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
