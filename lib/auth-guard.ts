import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Environment variables
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
const BETTER_AUTH_COOKIE_NAME = process.env.BETTER_AUTH_COOKIE_NAME || "better-auth.session_token";

// Role type matching schema
export type UserRole = "applicant" | "admin" | "committee";

/**
 * Validates session and checks role requirements server-side.
 * Usage: await requireAuth(["admin"]) in a layout or page.
 */
export async function requireAuth(allowedRoles: UserRole[]) {
    if (!CONVEX_SITE_URL) {
        console.error("NEXT_PUBLIC_CONVEX_SITE_URL is not set");
        redirect("/login?error=config_error");
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(BETTER_AUTH_COOKIE_NAME)?.value ||
        cookieStore.get("__Secure-better-auth.session_token")?.value ||
        cookieStore.get("session")?.value ||
        cookieStore.get("better-auth.session")?.value;

    if (!token) {
        redirect("/login");
    }

    try {
        // 1. Validate Session via Custom Convex Query (Reliable)
        // We use the System API to call 'verify:session' (Main App Proxy)
        const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/query`, {
            method: "POST",
            body: JSON.stringify({
                path: "users:verifySession",
                args: { sessionToken: token },
            }),
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!sessionResponse.ok) {
            console.error("Session Query Error", await sessionResponse.text());
            redirect("/login?error=server_error");
        }

        const sessionResult = await sessionResponse.json();

        // Convex Query returns wrapped result: { value: { session, user } | null }
        if (!sessionResult || sessionResult.value === null) {
            redirect("/login");
        }

        const { user } = sessionResult.value;

        // Default to 'applicant' if role is missing but user exists (Robustness)
        let userRole: UserRole = "applicant";

        // Note: The 'user' here comes from Better Auth Schema
        // It should have 'role' if we defined it in the schema overrides
        // If getting role fails here, we could fallback to Main DB lookup, but let's try this first.
        if (user && typeof user === "object" && "role" in user) {
            userRole = user.role as UserRole;
        }

        // 2. Check Authorization
        if (!allowedRoles.includes(userRole)) {
            redirect("/unauthorized"); // Or "/"
        }

        return { user, session: sessionResult.value.session };

    } catch (error) {
        console.error("Auth Guard Error:", error);
        redirect("/login?error=server_error");
    }
}
