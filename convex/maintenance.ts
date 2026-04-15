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

// Selective purge: delete all data EXCEPT for the specified admin account
export const purgeAllExceptAdmin = mutation({
    args: {
        preserveEmail: v.string(),
    },
    handler: async (ctx, { preserveEmail }) => {
        const results: Record<string, number> = {};

        // 1. Find the admin user to preserve
        const adminUser = await ctx.db
            .query("user")
            .filter((q) => q.eq(q.field("email"), preserveEmail))
            .first();

        if (!adminUser) {
            throw new Error(
                `No user found with email "${preserveEmail}". Aborting purge to prevent accidental full wipe.`
            );
        }

        const adminUserId = adminUser._id;

        // 2. Selectively delete users (all except admin)
        const allUsers = await ctx.db.query("user").collect();
        let userDeleteCount = 0;
        for (const user of allUsers) {
            if (user._id !== adminUserId) {
                await ctx.db.delete(user._id);
                userDeleteCount++;
            }
        }
        results["user"] = userDeleteCount;

        // 3. Selectively delete sessions (keep admin's)
        const allSessions = await ctx.db.query("session").collect();
        let sessionDeleteCount = 0;
        for (const session of allSessions) {
            if (session.userId !== adminUserId) {
                await ctx.db.delete(session._id);
                sessionDeleteCount++;
            }
        }
        results["session"] = sessionDeleteCount;

        // 4. Selectively delete accounts (keep admin's)
        const allAccounts = await ctx.db.query("account").collect();
        let accountDeleteCount = 0;
        for (const account of allAccounts) {
            if (account.userId !== adminUserId) {
                await ctx.db.delete(account._id);
                accountDeleteCount++;
            }
        }
        results["account"] = accountDeleteCount;

        // 5. Fully wipe all other tables
        const tablesToWipe = [
            "applications",
            "evaluations",
            "recommendations",
            "committeeMembers",
            "userInvites",
            "emailLogs",
            "activityLog",
            "settings",
            "verification",
            "rateLimit",
            "twoFactor",
            "passkey",
            "oauthApplication",
            "oauthAccessToken",
            "oauthConsent",
        ];

        for (const table of tablesToWipe) {
            try {
                const docs = await ctx.db.query(table as any).collect();
                for (const doc of docs) {
                    await ctx.db.delete(doc._id);
                }
                results[table] = docs.length;
            } catch (e) {
                results[table] = 0;
            }
        }

        return {
            success: true,
            preservedAdmin: { email: preserveEmail, id: adminUserId },
            deletedCounts: results,
        };
    },
});

// Selective purge: preserve ALL admin + committee users, clean up storage files
export const purgeTestData = mutation({
    args: {},
    handler: async (ctx) => {
        const results: Record<string, number> = {};

        // 1. Find all admin + committee users to preserve
        const allUsers = await ctx.db.query("user").collect();
        const preservedUserIds = new Set<string>();
        for (const user of allUsers) {
            if (user.role === "admin" || user.role === "committee") {
                preservedUserIds.add(String(user._id));
            }
        }

        if (preservedUserIds.size === 0) {
            throw new Error(
                "No admin/committee users found. Aborting purge to prevent accidental full wipe."
            );
        }

        // 2. Delete storage files from applications & recommendations
        let storageDeleteCount = 0;
        const applications = await ctx.db.query("applications").collect();
        for (const app of applications) {
            for (const fieldId of [app.transcriptFileId, app.essayFileId, app.profilePhotoId]) {
                if (fieldId) {
                    try {
                        await ctx.storage.delete(fieldId);
                        storageDeleteCount++;
                    } catch {
                        // File may already be deleted
                    }
                }
            }
        }

        const recommendations = await ctx.db.query("recommendations").collect();
        for (const rec of recommendations) {
            if (rec.letterFileId) {
                try {
                    await ctx.storage.delete(rec.letterFileId);
                    storageDeleteCount++;
                } catch {
                    // File may already be deleted
                }
            }
        }
        results["_storage"] = storageDeleteCount;

        // 3. Delete non-preserved users
        let userDeleteCount = 0;
        for (const user of allUsers) {
            if (!preservedUserIds.has(String(user._id))) {
                await ctx.db.delete(user._id);
                userDeleteCount++;
            }
        }
        results["user"] = userDeleteCount;

        // 4. Delete sessions/accounts for non-preserved users
        const allSessions = await ctx.db.query("session").collect();
        let sessionDeleteCount = 0;
        for (const session of allSessions) {
            if (!preservedUserIds.has(String(session.userId))) {
                await ctx.db.delete(session._id);
                sessionDeleteCount++;
            }
        }
        results["session"] = sessionDeleteCount;

        const allAccounts = await ctx.db.query("account").collect();
        let accountDeleteCount = 0;
        for (const account of allAccounts) {
            if (!preservedUserIds.has(String(account.userId))) {
                await ctx.db.delete(account._id);
                accountDeleteCount++;
            }
        }
        results["account"] = accountDeleteCount;

        // 5. Selectively clean committeeMembers (keep for preserved users)
        const allCommitteeMembers = await ctx.db.query("committeeMembers").collect();
        let committeeMemberDeleteCount = 0;
        for (const member of allCommitteeMembers) {
            if (!preservedUserIds.has(String(member.userId))) {
                await ctx.db.delete(member._id);
                committeeMemberDeleteCount++;
            }
        }
        results["committeeMembers"] = committeeMemberDeleteCount;

        // 6. Fully wipe data tables (applications/recommendations already queried above)
        for (const app of applications) {
            await ctx.db.delete(app._id);
        }
        results["applications"] = applications.length;

        for (const rec of recommendations) {
            await ctx.db.delete(rec._id);
        }
        results["recommendations"] = recommendations.length;

        const tablesToWipe = [
            "evaluations",
            "userInvites",
            "emailLogs",
            "activityLog",
            "settings",
            "verification",
            "rateLimit",
            "twoFactor",
            "passkey",
            "oauthApplication",
            "oauthAccessToken",
            "oauthConsent",
        ] as const;

        for (const table of tablesToWipe) {
            try {
                const docs = await ctx.db.query(table as any).collect();
                for (const doc of docs) {
                    await ctx.db.delete(doc._id);
                }
                results[table] = docs.length;
            } catch {
                results[table] = 0;
            }
        }

        return {
            success: true,
            preservedUsers: preservedUserIds.size,
            deletedCounts: results,
        };
    },
});
