import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").collect();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  },
});

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { key, value }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = identity.email;
    if (!email) throw new Error("User email not available");

    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("settings", {
        key,
        value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }
  },
});

// Deadline: April 20, 2026 at 11:59 PM EST (UTC-4)
export const DEADLINE_TIMESTAMP = new Date("2026-04-20T23:59:59-04:00").getTime();

export const getDeadline = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "application_deadline"))
      .first();

    // Default deadline: April 15, 2026 at 11:59 PM EST
    return setting ? parseInt(setting.value) : DEADLINE_TIMESTAMP;
  },
});

export const isDeadlinePassed = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "application_deadline"))
      .first();

    const deadline = setting ? parseInt(setting.value) : DEADLINE_TIMESTAMP;
    return Date.now() > deadline;
  },
});

// Internal: update deadline without auth (for CLI/admin use)
export const updateDeadlineInternal = internalMutation({
  args: { isoTimestamp: v.string() },
  handler: async (ctx, { isoTimestamp }) => {
    const timestamp = new Date(isoTimestamp).getTime();
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "application_deadline"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: timestamp.toString(), updatedAt: Date.now() });
    } else {
      await ctx.db.insert("settings", {
        key: "application_deadline",
        value: timestamp.toString(),
        updatedAt: Date.now(),
      });
    }
    return { success: true, deadline: new Date(timestamp).toISOString() };
  },
});
