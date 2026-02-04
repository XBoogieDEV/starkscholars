import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
    // This file replaces middleware.ts for network boundary operations.
    // Auth logic has been moved to Layouts (Server Components).
    // Use this for rewrites, redirects, or headers.

    return NextResponse.next();
}
