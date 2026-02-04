// Better Auth schema for Convex
// Generated and managed by @convex-dev/better-auth

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  user: defineTable({
    email: v.string(),
    name: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Optional Better Auth fields
    twoFactorEnabled: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
    username: v.optional(v.string()),
    displayUsername: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    phoneNumberVerified: v.optional(v.boolean()),
    userId: v.optional(v.string()),
    role: v.optional(v.string()), // Added to match auth.config and allow field
  })
    .index("email", ["email"])
    .index("name", ["name"])
    .index("userId", ["userId"])
    .index("username", ["username"])
    .index("phoneNumber", ["phoneNumber"]),

  session: defineTable({
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("token", ["token"])
    .index("userId", ["userId"])
    .index("expiresAt", ["expiresAt"])
    .index("expiresAt_userId", ["expiresAt", "userId"]),

  account: defineTable({
    userId: v.string(),
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    idToken: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("accountId", ["accountId"])
    .index("providerId", ["providerId"]),

  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("identifier", ["identifier"]),
});
