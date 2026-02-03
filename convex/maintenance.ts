import { internalMutation } from "./_generated/server";

export const wipeAllData = internalMutation({
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

        for (const table of tables) {
            const docs = await ctx.db.query(table as any).collect();
            await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
        }

        return { success: true, message: "All data wiped successfully" };
    },
});
