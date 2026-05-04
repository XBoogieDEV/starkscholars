// Internal mutations for the e2e test seeder. NOT exposed in the public API.
// Used by scripts/seed-test-users.mjs after better-auth creates the users.
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { components } from "./_generated/api";

const TEST_EMAIL_DOMAIN = "@scholars.test";

function assertTestEmail(email: string) {
  if (!email.toLowerCase().endsWith(TEST_EMAIL_DOMAIN)) {
    throw new Error(
      `seedHelpers: refusing to operate on non-test email "${email}". Only ${TEST_EMAIL_DOMAIN} addresses are allowed.`
    );
  }
}

// The role lives in two places: the main app's user table (used by Convex
// queries like getCurrentUser) AND the better-auth component's user table
// (returned by signIn.email() and used by the /login redirect logic). They
// are NOT auto-synced. This helper updates both so login redirects land on
// the right page.
async function patchBothUserTables(ctx: any, email: string, patch: Record<string, unknown>) {
  const user = await ctx.db
    .query("user")
    .withIndex("email", (q: any) => q.eq("email", email.toLowerCase()))
    .first();
  if (!user) throw new Error(`patchBothUserTables: user not found for ${email}`);
  await ctx.db.patch(user._id, patch);

  // Update better-auth component's user table via the adapter API
  await ctx.runMutation(components.betterAuth.adapter.updateOne, {
    input: {
      model: "user",
      where: [{ field: "email", operator: "eq", value: email.toLowerCase() }],
      update: patch,
    },
  });

  return user;
}

export const seedSetRole = internalMutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("committee"),
      v.literal("applicant")
    ),
  },
  handler: async (ctx, { email, role }) => {
    assertTestEmail(email);
    const user = await patchBothUserTables(ctx, email, { role });
    return user._id;
  },
});

export const seedSetChair = internalMutation({
  args: {
    email: v.string(),
    isChairman: v.boolean(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { email, isChairman, title }) => {
    assertTestEmail(email);
    // Promote to committee in BOTH user tables if not already admin
    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase()))
      .first();
    if (!user) throw new Error(`seedSetChair: user not found for ${email}`);
    if (user.role !== "committee" && user.role !== "admin") {
      await patchBothUserTables(ctx, email, { role: "committee" });
    }

    // Upsert committeeMembers row
    const existing = await ctx.db
      .query("committeeMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isChairman,
        title: title ?? existing.title,
      });
      return existing._id;
    }

    const allMembers = await ctx.db.query("committeeMembers").collect();
    const maxOrder =
      allMembers.length > 0 ? Math.max(...allMembers.map((m) => m.order)) : -1;
    return await ctx.db.insert("committeeMembers", {
      userId: user._id,
      name: user.name || email,
      title: title ?? (isChairman ? "Test Chair" : "Test Committee Member"),
      isChairman,
      isExOfficio: false,
      order: maxOrder + 1,
    });
  },
});

// Cascade-deletes everything tied to a test user. Refuses non-test emails.
// Order matters: child tables first, then user/account/session, then storage refs.
export const seedDeleteUser = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    assertTestEmail(email);
    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase()))
      .first();
    if (!user) return { deleted: false, reason: "user not found" };

    // committeeMembers
    const member = await ctx.db
      .query("committeeMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (member) await ctx.db.delete(member._id);

    // evaluations they authored
    const myEvals = await ctx.db
      .query("evaluations")
      .withIndex("by_evaluator", (q) => q.eq("evaluatorId", user._id))
      .collect();
    for (const e of myEvals) await ctx.db.delete(e._id);

    // sessions
    const sessions = await ctx.db
      .query("session")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of sessions) await ctx.db.delete(s._id);

    // accounts (better-auth credential records)
    const accounts = await ctx.db
      .query("account")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const a of accounts) await ctx.db.delete(a._id);

    // user
    await ctx.db.delete(user._id);

    return { deleted: true };
  },
});
