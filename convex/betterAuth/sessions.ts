import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const validate = query({
    args: { sessionToken: v.string() },
    handler: async (ctx, { sessionToken }) => {
        const session = await ctx.db
            .query("session")
            .withIndex("token", (q) => q.eq("token", sessionToken))
            .first();

        if (!session) {
            return null;
        }

        if (session.expiresAt < Date.now()) {
            return null;
        }

        const user = await ctx.db.get(session.userId as Id<"user">);

        if (!user) {
            return null;
        }

        return { session, user };
    },
});
