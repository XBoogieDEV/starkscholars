import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { generateSecureToken } from "./utils";

// Admin auth helper (same pattern as committeeMembers.ts)
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

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================
// CREATE INVITE
// ============================================
export const create = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("committee")),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    phone: v.optional(v.string()),
    isChairman: v.optional(v.boolean()),
    isExOfficio: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const normalizedEmail = args.email.toLowerCase().trim();

    // Check if user already exists with that role
    const existingUser = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existingUser && existingUser.role === args.role) {
      throw new Error(`A user with this email already has the ${args.role} role`);
    }

    // Check for existing pending invite
    const existingInvite = await ctx.db
      .query("userInvites")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("A pending invite already exists for this email");
    }

    const token = generateSecureToken();
    const now = Date.now();

    const inviteId = await ctx.db.insert("userInvites", {
      email: normalizedEmail,
      role: args.role,
      token,
      expiresAt: now + SEVEN_DAYS_MS,
      status: "pending",
      invitedBy: admin._id,
      name: args.name,
      title: args.title,
      phone: args.phone,
      isChairman: args.isChairman,
      isExOfficio: args.isExOfficio,
      createdAt: now,
    });

    // Schedule invite email
    await ctx.scheduler.runAfter(0, api.emails.sendInviteEmail, { inviteId });

    return inviteId;
  },
});

// ============================================
// LIST INVITES
// ============================================
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const invites = await ctx.db.query("userInvites").order("desc").collect();

    // Enrich with inviter name
    const enriched = await Promise.all(
      invites.map(async (invite) => {
        const inviter = await ctx.db.get(invite.invitedBy);
        return {
          ...invite,
          invitedByName: inviter?.name || inviter?.email || "Unknown",
        };
      })
    );

    return enriched;
  },
});

// ============================================
// REVOKE INVITE
// ============================================
export const revoke = mutation({
  args: { id: v.id("userInvites") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const invite = await ctx.db.get(id);
    if (!invite) throw new Error("Invite not found");
    if (invite.status !== "pending") throw new Error("Can only revoke pending invites");

    await ctx.db.patch(id, { status: "revoked" });
  },
});

// ============================================
// RESEND INVITE
// ============================================
export const resend = mutation({
  args: { id: v.id("userInvites") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);

    const invite = await ctx.db.get(id);
    if (!invite) throw new Error("Invite not found");
    if (invite.status !== "pending") throw new Error("Can only resend pending invites");

    // Generate new token and reset expiry
    const newToken = generateSecureToken();
    const now = Date.now();

    await ctx.db.patch(id, {
      token: newToken,
      expiresAt: now + SEVEN_DAYS_MS,
    });

    // Schedule new invite email
    await ctx.scheduler.runAfter(0, api.emails.sendInviteEmail, { inviteId: id });
  },
});

// ============================================
// GET INVITE BY TOKEN (public)
// ============================================
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invite = await ctx.db
      .query("userInvites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invite) return null;
    if (invite.status !== "pending") return null;
    if (invite.expiresAt < Date.now()) return null;

    return invite;
  },
});

// ============================================
// GET INVITE BY ID (internal - for email sending)
// ============================================
export const getById = internalQuery({
  args: { id: v.id("userInvites") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ============================================
// CONSUME INVITE (internal - called by syncUser)
// ============================================
export const consumeInvite = internalMutation({
  args: { id: v.id("userInvites") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });
  },
});
