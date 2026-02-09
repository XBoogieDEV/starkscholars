"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, LogIn, Home, FileText, Activity } from "lucide-react";

export default function SignOutPage() {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(true);

    useEffect(() => {
        // Perform sign-out via Better Auth
        const performSignOut = async () => {
            try {
                await fetch("/api/auth/sign-out", { method: "POST" });
            } catch (error) {
                console.error("Sign-out error:", error);
            } finally {
                setIsSigningOut(false);
            }
        };

        performSignOut();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                        <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        {isSigningOut ? "Signing you out..." : "Sorry to See You Go!"}
                    </h1>
                </div>

                {/* Message */}
                {!isSigningOut && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            You&apos;ve been securely signed out. Come back anytime to resume your application or check your status — we&apos;re here whenever you&apos;re ready.
                        </p>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <Button asChild className="bg-primary hover:bg-primary/90">
                                <Link href="/apply/dashboard">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Resume Application
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/apply/status">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Check Status
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/login">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In Again
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go to Home
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isSigningOut && (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground/70">
                        William R. Stark Financial Assistance Program
                    </p>
                </div>
            </div>
        </div>
    );
}
