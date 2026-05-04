// Shared helper for updating a user's role in BOTH the main app's user table
// AND the Better Auth component's user table. They are NOT auto-synced — and
// without this dual-write, promoted users get misrouted on next sign-in:
// signIn.email().data.user.role comes from the Better Auth side, so the /login
// form's redirect logic reads stale "applicant" and bounces them to
// /apply/dashboard before the layout-level role check finally re-routes them.
//
// This module exports plain TypeScript helpers (not Convex functions). Import
// them from Convex mutations.

import { components } from "./_generated/api";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "./_generated/dataModel";

export type AppRole = "admin" | "committee" | "applicant";

/**
 * Patch a user's role in the Better Auth component's user table.
 * Safe to call even if no Better Auth user matches (the adapter no-ops).
 */
export async function patchBetterAuthRole(
  ctx: GenericMutationCtx<DataModel>,
  email: string,
  role: AppRole,
): Promise<void> {
  await ctx.runMutation(components.betterAuth.adapter.updateOne, {
    input: {
      model: "user",
      where: [
        {
          field: "email",
          operator: "eq",
          value: email.toLowerCase().trim(),
        },
      ],
      update: { role },
    },
  });
}

/**
 * Set a user's role in BOTH user tables, given the user's main-table _id and
 * email. The caller is responsible for having already looked up or created the
 * main row (so we don't double-query). The Better Auth update is best-effort:
 * the row is matched by email, which is unique in the Better Auth schema.
 */
export async function setUserRoleByMainId(
  ctx: GenericMutationCtx<DataModel>,
  mainUserId: Id<"user">,
  email: string,
  role: AppRole,
): Promise<void> {
  await ctx.db.patch(mainUserId, { role });
  await patchBetterAuthRole(ctx, email, role);
}

/**
 * Convenience: look up the main user by email, set role on both tables.
 * Throws if no main user exists.
 */
export async function setUserRoleByEmail(
  ctx: GenericMutationCtx<DataModel>,
  email: string,
  role: AppRole,
): Promise<Id<"user">> {
  const normalized = email.toLowerCase().trim();
  const user = await ctx.db
    .query("user")
    .withIndex("email", (q) => q.eq("email", normalized))
    .first();
  if (!user) throw new Error(`setUserRoleByEmail: no user with email ${email}`);
  await setUserRoleByMainId(ctx, user._id, normalized, role);
  return user._id;
}
