
import { internalMutation, internalQuery } from "./_generated/server";
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

export const listUsers = internalQuery({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("user").collect();
        return { table: "user", count: users.length, users: users.map((u) => ({ id: u._id, email: u.email, name: u.name, role: u.role })) };
    },
});

export const listUsersPlural = internalQuery({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users" as any).collect();
        return { table: "users", count: users.length, users: users.slice(0, 50) };
    },
});

export const countAllTables = internalQuery({
    args: {},
    handler: async (ctx) => {
        const tables = ["user", "users", "session", "account", "applications", "activityLog", "emailLogs", "verification"] as const;
        const counts: Record<string, number> = {};
        for (const t of tables) {
            const rows = await ctx.db.query(t as any).collect();
            counts[t] = rows.length;
        }
        return counts;
    },
});

export const setRole = internalMutation({
    args: { email: v.string(), role: v.string() },
    handler: async (ctx, { email, role }) => {
        const user = await ctx.db
            .query("user")
            .withIndex("email", (q) => q.eq("email", email))
            .first();
        if (!user) throw new Error(`User not found: ${email}`);
        await ctx.db.patch(user._id, { role });
        return { success: true, userId: user._id, role };
    },
});
