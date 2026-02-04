"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, LogIn, Home } from "lucide-react";

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
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                        <CheckCircle className="h-10 w-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isSigningOut ? "Signing you out..." : "You've been signed out"}
                    </h1>
                </div>

                {/* Message */}
                {!isSigningOut && (
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Thank you for using Stark Scholars. Your session has been securely ended.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                            <Button asChild className="bg-amber-600 hover:bg-amber-700">
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        William R. Stark Financial Assistance Program
                    </p>
                </div>
            </div>
        </div>
    );
}
