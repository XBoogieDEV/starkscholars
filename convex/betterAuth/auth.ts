import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components, api } from "../_generated/api"; // Added api import
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
    plugins: [convex({ authConfig })],
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
            if ("scheduler" in ctx) {
              // @ts-expect-error - api type not generated yet
              await ctx.scheduler.runAfter(0, api.users.syncUser, {
                email: user.email,
                name: user.name,
                role: user.role || "applicant",
                image: user.image || undefined,
                externalId: user.id, // Better Auth User ID
              });
            }
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            if ("scheduler" in ctx) {
              // @ts-expect-error - api type not generated yet
              await ctx.scheduler.runAfter(0, api.users.syncSession, {
                token: session.token,
                expiresAt: session.expiresAt,
                baUserId: session.userId, // Better Auth User ID (external)
                ipAddress: session.ipAddress || null,
                userAgent: session.userAgent || null,
              });
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
