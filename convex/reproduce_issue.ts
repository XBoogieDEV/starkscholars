import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const attemptCreate = internalMutation({
    args: {},
    handler: async (ctx) => {
        const email = "get2aaron@yahoo.com";

        // 1. Check for existing 'user' (singular)
        const existingSingular = await ctx.db
            .query("user")
            .withIndex("email", (q) => q.eq("email", email.toLowerCase().trim()))
            .first();

        const singularStats = await ctx.db.query("user").collect();

        // 2. Check for potentially created 'users' (plural) table?
        let pluralStats: any[] = [];
        try {
            // @ts-ignore
            pluralStats = await ctx.db.query("users").collect();
        } catch (e) {
            // Expected if table doesn't exist
        }

        // 3. Attempt Insert (Simulate users:create)
        let insertResult = "Skipped (Exists)";
        if (!existingSingular) {
            try {
                await ctx.db.insert("user", {
                    email: email.toLowerCase().trim(),
                    name: "Test Debug",
                    emailVerified: false,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    role: "applicant" // Required by schema
                });
                insertResult = "Success (Created)";
            } catch (e: any) {
                insertResult = `Failed: ${e.message}`;
            }
        }

        return {
            emailChecked: email,
            singularTable: {
                exists: !!existingSingular,
                totalCount: singularStats.length,
                samples: singularStats.slice(0, 3)
            },
            pluralTable: {
                count: pluralStats.length
            },
            insertAttempt: insertResult
        };
    },
});
