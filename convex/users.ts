import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { logAction } from "./auditLog";

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

export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("applicant"), v.literal("admin"), v.literal("committee")),
  },
  handler: async (ctx, { email, name, role }) => {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing account with this email
    const existing = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    const userId = await ctx.db.insert("user", {
      email: normalizedEmail,
      name: name || "Applicant",
      role,
      emailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log account creation
    await logAction(ctx, {
      action: "auth:register",
      userId,
      details: { email: normalizedEmail, role },
    });

    // Send welcome email after user creation (only for applicants)
    if (role === "applicant") {
      await ctx.scheduler.runAfter(0, api.emails.sendWelcomeEmail, {
        userId
      });
    }

    return userId;
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
