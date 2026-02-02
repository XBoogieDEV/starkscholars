import { fetchAuthAction } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, url, name } = body;

    if (!email || !url) {
      return NextResponse.json(
        { error: "Email and URL are required" },
        { status: 400 }
      );
    }

    // Call the Convex action to send verification email
    await fetchAuthAction("emails:sendEmailVerification", {
      email,
      url,
      name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to trigger verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
