import { v } from "convex/values";
import { query } from "./_generated/server";

export const validate = query({
    args: { sessionToken: v.string() },
    handler: async (ctx, { sessionToken }) => {
        return { session: { id: "test", userId: "test" }, user: { id: "test", email: "test" } };
    },
});
