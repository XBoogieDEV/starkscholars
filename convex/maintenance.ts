import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const wipeAllData = mutation({
    args: { confirm: v.string() },
    handler: async (ctx, { confirm }) => {
        if (confirm !== "CONFIRM_WIPE") {
            throw new Error("Safety check failed. Pass 'CONFIRM_WIPE' to execute.");
        }
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

        for (const table of tables) {
            const docs = await ctx.db.query(table as any).collect();
            await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
        }

        return { success: true, message: "All data wiped successfully" };
    },
});
