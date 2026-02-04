import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const wipeAllData = mutation({
    args: {},
    handler: async (ctx) => {
        // List of tables to clear
        const tables = [
            "user",
            "session",
            "account",
            "verification",
            "applications",
            "evaluations",
            "recommendations",
            "committeeMembers",
            "activityLog",
            "settings",
        ];

        const results: Record<string, number> = {};

        for (const table of tables) {
            const docs = await ctx.db.query(table as any).collect();
            await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
            results[table] = docs.length;
        }

        return { success: true, deletedCounts: results };
    },
});
