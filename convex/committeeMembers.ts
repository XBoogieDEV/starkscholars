import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Admin auth helper
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const email = identity.email;
  if (!email) throw new Error("Email not available");
  const user = await ctx.db
    .query("user")
    .withIndex("email", (q: any) => q.eq("email", email))
    .first();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const members = await ctx.db.query("committeeMembers").collect();
    // Sort by order
    members.sort((a, b) => a.order - b.order);

    // Get user info for each member
    const membersWithUser = await Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return { ...m, email: user?.email || "" };
      })
    );
    return membersWithUser;
  },
});

export const create = mutation({
  args: {
    userId: v.id("user"),
    name: v.string(),
    title: v.string(),
    phone: v.optional(v.string()),
    isChairman: v.boolean(),
    isExOfficio: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if user is already a committee member
    const existing = await ctx.db
      .query("committeeMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) throw new Error("User is already a committee member");

    // Get max order
    const allMembers = await ctx.db.query("committeeMembers").collect();
    const maxOrder =
      allMembers.length > 0
        ? Math.max(...allMembers.map((m) => m.order))
        : -1;

    // Create member
    const id = await ctx.db.insert("committeeMembers", {
      userId: args.userId,
      name: args.name,
      title: args.title,
      phone: args.phone,
      isChairman: args.isChairman,
      isExOfficio: args.isExOfficio,
      order: maxOrder + 1,
    });

    // Update user role to "committee"
    await ctx.db.patch(args.userId, { role: "committee" });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("committeeMembers"),
    name: v.string(),
    title: v.string(),
    phone: v.optional(v.string()),
    isChairman: v.boolean(),
    isExOfficio: v.boolean(),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("committeeMembers") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(id);
    if (!member) throw new Error("Member not found");

    // Reset user role to "applicant"
    await ctx.db.patch(member.userId, { role: "applicant" });

    // Delete the committee member
    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("committeeMembers")) },
  handler: async (ctx, { orderedIds }) => {
    await requireAdmin(ctx);
    for (let i = 0; i < orderedIds.length; i++) {
      await ctx.db.patch(orderedIds[i], { order: i });
    }
  },
});

export const getEligibleUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all existing committee member userIds
    const members = await ctx.db.query("committeeMembers").collect();
    const memberUserIds = new Set(members.map((m) => m.userId.toString()));

    // Get all users, excluding admins and existing members
    const users = await ctx.db.query("user").collect();
    return users
      .filter(
        (u) => !memberUserIds.has(u._id.toString()) && u.role !== "admin"
      )
      .map((u) => ({ _id: u._id, name: u.name, email: u.email }));
  },
});
