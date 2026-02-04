import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Wipe all data from main app tables (includes auth tables in shared namespace)
export const wipeAllData = mutation({
    args: {},
    handler: async (ctx) => {
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
            "jwks",
            "rateLimit",
            "twoFactor",
            "passkey",
            "oauthApplication",
            "oauthAccessToken",
            "oauthConsent",
        ];

        const results: Record<string, number> = {};

        for (const table of tables) {
            try {
                const docs = await ctx.db.query(table as any).collect();
                await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
                results[table] = docs.length;
            } catch (e) {
                results[table] = 0;
            }
        }

        return { success: true, deletedCounts: results };
    },
});
