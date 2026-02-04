import { v } from "convex/values";
import { internalMutation, query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { logAction } from "./auditLog";


// ... existing code ...


export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase().trim()))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("user") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // improved lookup: try by 'userId' (Better Auth ID) first
    // inherited from convex/schema.ts update
    const userBySubject = await ctx.db
      .query("user")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (userBySubject) return userBySubject;

    // Fallback: lookup by email (legacy or pre-sync)
    const email = identity.email;
    if (!email) return null;

    return await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
  },
});

export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase().trim()))
      .first();

    return { exists: !!existing };
  },
});

// Internal mutation called by Better Auth hook
export const syncUser = internalMutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    image: v.optional(v.string()),
    externalId: v.string(), // The Better Auth User ID
  },
  handler: async (ctx, { email, name, role, image, externalId }) => {
    console.log("[syncUser] Syncing user:", email, "BA ID:", externalId);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      // Update external ID if missing
      if (existing.userId !== externalId) {
        await ctx.db.patch(existing._id, { userId: externalId });
      }
      return existing._id;
    }

    // Create new user in Main DB
    const userId = await ctx.db.insert("user", {
      email: normalizedEmail,
      name: name || "Applicant",
      role: role || "applicant",
      emailVerified: false,
      image,
      userId: externalId, // Link to Better Auth ID
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send welcome email to new user
    console.log("[syncUser] Scheduling welcome email for new user:", userId);
    await ctx.scheduler.runAfter(0, api.emails.sendWelcomeEmail, { userId });

    return userId;
  },
});

// Internal mutation called by Better Auth hook to sync sessions
export const syncSession = internalMutation({
  args: {
    token: v.string(),
    expiresAt: v.number(),
    baUserId: v.string(), // Better Auth User ID (external)
    ipAddress: v.optional(v.union(v.null(), v.string())),
    userAgent: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, { token, expiresAt, baUserId, ipAddress, userAgent }) => {
    console.log("[syncSession] Syncing session for BA User ID:", baUserId);

    // Find the Main App user by their external ID
    const user = await ctx.db
      .query("user")
      .withIndex("by_userId", (q) => q.eq("userId", baUserId))
      .first();

    if (!user) {
      console.error("[syncSession] User not found for BA ID:", baUserId);
      return null;
    }

    // Check if session already exists (idempotency)
    const existingSession = await ctx.db
      .query("session")
      .withIndex("token", (q) => q.eq("token", token))
      .first();

    if (existingSession) {
      console.log("[syncSession] Session already exists for token:", token.substring(0, 8) + "...");
      return existingSession._id;
    }

    // Insert session into Main App DB
    const sessionId = await ctx.db.insert("session", {
      token,
      expiresAt,
      userId: user._id, // Main App User ID (Doc ID)
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    console.log("[syncSession] Session synced successfully:", sessionId);
    return sessionId;
  },
});
export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("applicant"), v.literal("admin"), v.literal("committee")),
  },
  handler: async (ctx, { email, name, role }) => {
    // Legacy create - kept for compatibility but should use syncUser flow
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    return await ctx.db.insert("user", {
      email: normalizedEmail,
      name: name || "Applicant",
      role,
      emailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateLastLogin = mutation({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      lastLoginAt: Date.now(),
    });

    // Log login
    await logAction(ctx, {
      action: "auth:login",
      userId,
      details: { timestamp: Date.now() },
    });
  },
});

export const verifySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("session")
      .withIndex("token", (q) => q.eq("token", sessionToken))
      .first();

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);

    if (!user) {
      return null;
    }

    return { session, user };
  },
});
