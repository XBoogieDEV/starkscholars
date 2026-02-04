import { v } from "convex/values";
import { query } from "./_generated/server";
import { components } from "./_generated/api";

export const verifySession = query({
    args: { sessionToken: v.string() },
    handler: async (ctx, { sessionToken }) => {
        // Component API should now include sessions
        const result = await ctx.runQuery(components.betterAuth.sessions.validate, {
            sessionToken,
        });
        return result;
    },
});
