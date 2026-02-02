import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Call Better Auth's forgot password API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starkscholars.com";
    const betterAuthUrl = `${baseUrl}/api/auth/forgot-password`;
    
    const response = await fetch(betterAuthUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        redirectTo: `${baseUrl}/reset-password`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Better Auth forgot password error:", errorData);
      // Still return success to prevent email enumeration
      // but log the error for debugging
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to trigger password reset:", error);
    // Still return success to prevent email enumeration
    return NextResponse.json({ success: true });
  }
}
