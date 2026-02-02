import { fetchAuthAction } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, url } = body;

    if (!email || !url) {
      return NextResponse.json(
        { error: "Email and URL are required" },
        { status: 400 }
      );
    }

    // Call the Convex action to send password reset email
    await fetchAuthAction("emails:sendPasswordResetEmail", {
      email,
      url,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to trigger password reset email:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
