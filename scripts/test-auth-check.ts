
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


async function checkQuery(path: string) {
    console.log("Testing Query " + CONVEX_SITE_URL + "/api/query -> " + path);
    try {
        const res = await fetch(`${CONVEX_SITE_URL}/api/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: path,
                args: { sessionToken: "dummy_token_to_verify_endpoint_exists" }
            })
        });
        console.log(`[${res.status}] ${path}`);
        if (res.ok) console.log(await res.text());
        else console.log(await res.text());
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    // Check the Main App Proxy Path: authQueries:verifySession
    await checkQuery("authQueries:verifySession");
}


run();
