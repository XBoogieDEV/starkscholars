
const CONVEX_SITE_URL = "https://necessary-orca-813.convex.site";

async function check(path: string) {
    console.log("Testing " + CONVEX_SITE_URL + path);
    try {
        const res = await fetch(`${CONVEX_SITE_URL}${path}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        console.log(`[${res.status}] ${path}`);
        if (res.ok) console.log(await res.text());
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await check("/api/auth/session");
    // Component Namespaced Paths
    await check("/betterAuth/api/auth/session");
    await check("/betterAuth/session");
    await check("/.well-known/better-auth/session"); // Standard Better Auth discovery
    await check("/betterAuth/.well-known/better-auth/session");
}

run();
