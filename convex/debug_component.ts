import { mutation, query } from "./_generated/server";
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
