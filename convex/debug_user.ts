
import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const checkUser = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const user = await ctx.db
            .query("user")
            .withIndex("email", (q) => q.eq("email", email))
            .first();
        return user;
    },
});
