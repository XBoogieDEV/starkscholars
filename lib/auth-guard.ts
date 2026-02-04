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
        // 1. Validate Session via Standard Better Auth Endpoint
        // This validates the cookie signature and expiration automatically
        const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/auth/session`, {
            method: "GET",
            headers: {
                "Cookie": `${BETTER_AUTH_COOKIE_NAME}=${token}`,
            },
            cache: "no-store",
        });

        if (!sessionResponse.ok) {
            // If 401/403/etc, session is invalid
            redirect("/login");
        }

        const sessionData = await sessionResponse.json();

        if (!sessionData?.session || !sessionData?.user) {
            redirect("/login");
        }

        const user = sessionData.user;

        // Default to 'applicant' if role is missing but user exists (Robustness)
        let userRole: UserRole = "applicant";

        if (user && typeof user === "object" && "role" in user) {
            userRole = user.role as UserRole;
        }

        // 2. Check Authorization
        if (!allowedRoles.includes(userRole)) {
            redirect("/unauthorized"); // Or "/"
        }

        return { user, session: sessionData.session };

    } catch (error) {
        console.error("Auth Guard Error:", error);
        redirect("/login?error=server_error");
    }
}
