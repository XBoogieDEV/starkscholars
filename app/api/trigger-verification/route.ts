import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Call Better Auth's verification API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const betterAuthUrl = `${baseUrl}/api/auth/send-verification-email`;
    
    const response = await fetch(betterAuthUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        callbackURL: `${baseUrl}/verify`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Better Auth verification error:", errorData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to trigger verification email:", error);
    return NextResponse.json({ success: true });
  }
}
