import { internalMutation, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";

// List users in Better Auth component's internal storage
export const listComponentUsers = query({
    args: {},
    handler: async (ctx) => {
        try {
            const users = await ctx.runQuery(components.betterAuth.adapter.findMany, {
                model: "user",
                limit: 100,
                paginationOpts: { cursor: null, numItems: 100 },
            });
            return { success: true, count: users?.page?.length ?? 0, users: users?.page ?? [] };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    },
});

// Backfill: Copy all users from Better Auth component DB into main user table
export const backfillUsers = internalMutation({
    args: {},
    handler: async (ctx) => {
        const results: { synced: string[]; skipped: string[]; errors: string[] } = {
            synced: [],
            skipped: [],
            errors: [],
        };

        try {
            // Fetch all users from the Better Auth component DB
            const baUsers = await ctx.runQuery(components.betterAuth.adapter.findMany, {
                model: "user",
                limit: 200,
                paginationOpts: { cursor: null, numItems: 200 },
            });

            const users = baUsers?.page ?? [];
            console.log(`[backfillUsers] Found ${users.length} users in Better Auth component DB`);

            for (const baUser of users) {
                try {
                    const email = (baUser.email as string)?.toLowerCase().trim();
                    if (!email) {
                        results.errors.push(`User ${baUser.id} has no email`);
                        continue;
                    }

                    // Check if user already exists in main DB
                    const existing = await ctx.db
                        .query("user")
                        .withIndex("email", (q) => q.eq("email", email))
                        .first();

                    if (existing) {
                        // Update userId link if missing
                        if (!existing.userId && baUser.id) {
                            await ctx.db.patch(existing._id, { userId: baUser.id as string });
                        }
                        results.skipped.push(email);
                        continue;
                    }

                    // Create user in main DB
                    await ctx.db.insert("user", {
                        email,
                        name: (baUser.name as string) || "Applicant",
                        role: (baUser.role as string) || "applicant",
                        emailVerified: !!(baUser.emailVerified),
                        image: (baUser.image as string) || undefined,
                        userId: baUser.id as string,
                        createdAt: typeof baUser.createdAt === "number" ? baUser.createdAt : Date.now(),
                        updatedAt: Date.now(),
                    });
                    results.synced.push(email);
                    console.log(`[backfillUsers] Synced: ${email}`);
                } catch (e: any) {
                    results.errors.push(`${baUser.email}: ${e.message || String(e)}`);
                }
            }
        } catch (e: any) {
            results.errors.push(`Failed to fetch BA users: ${e.message || String(e)}`);
        }

        console.log(`[backfillUsers] Done. Synced: ${results.synced.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`);
        return results;
    },
});

// Clear all data from Better Auth component (all models)
export const clearAllComponentData = mutation({
    args: {},
    handler: async (ctx) => {
        const models = ["user", "session", "account", "verification"] as const;
        const results: Record<string, string> = {};

        for (const model of models) {
            try {
                await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
                    input: { model },
                    paginationOpts: { cursor: null, numItems: 1000 },
                });
                results[model] = "cleared";
            } catch (e: any) {
                results[model] = `error: ${e.message || String(e)}`;
            }
        }

        return { success: true, results };
    },
});
