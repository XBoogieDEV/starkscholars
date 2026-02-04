import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Environment variables
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
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
        cookieStore.get("session")?.value ||
        cookieStore.get("better-auth.session")?.value;

    if (!token) {
        redirect("/login");
    }

    try {
        // 1. Validate Session
        const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/http`, {
            method: "POST",
            body: JSON.stringify({
                path: "betterAuth/adapter:getSessionAndUser",
                args: { sessionToken: token },
            }),
            headers: {
                "Content-Type": "application/json",
                "Origin": APP_URL,
            },
        });

        if (!sessionResponse.ok) {
            console.error("Session validation error", await sessionResponse.text());
            redirect("/login?error=session_error");
        }

        const sessionResult = await sessionResponse.json();
        const sessionData = sessionResult?.value;

        if (!sessionData?.session || !sessionData?.user) {
            redirect("/login");
        }

        if (sessionData.session.expiresAt < Date.now()) {
            redirect("/login?error=expired");
        }

        // 2. Get User Role
        const userRoleResponse = await fetch(`${CONVEX_SITE_URL}/api/query`, {
            method: "POST",
            body: JSON.stringify({
                path: "users/getByEmail",
                args: { email: sessionData.user.email },
            }),
            headers: {
                "Content-Type": "application/json",
                "Origin": APP_URL,
            },
        });

        if (!userRoleResponse.ok) {
            console.error("Role checks error", await userRoleResponse.text());
            redirect("/login?error=role_error");
        }

        const userRoleResult = await userRoleResponse.json();
        const user = userRoleResult?.value;

        // Default to 'applicant' if role is missing but user exists (Robustness)
        let userRole: UserRole = "applicant";

        if (user && typeof user === "object" && "role" in user) {
            userRole = user.role as UserRole;
        }

        // 3. Check Authorization
        if (!allowedRoles.includes(userRole)) {
            redirect("/unauthorized"); // Or "/"
        }

        return { user, session: sessionData.session };

    } catch (error) {
        console.error("Auth Guard Error:", error);
        redirect("/login?error=server_error");
    }
}
