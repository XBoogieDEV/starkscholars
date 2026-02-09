"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ShieldCheck, Users } from "lucide-react";
import { signUp, authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

export default function InviteAcceptPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const invite = useQuery(
    api.userInvites.getByToken,
    token ? { token } : "skip"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  // Pre-fill name from invite if available
  const inviteName = invite?.name || "";
  const inviteEmail = invite?.email || "";
  const roleName = invite?.role === "admin" ? "Administrator" : "Committee Member";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      const firstName = formData.firstName || inviteName.split(" ")[0] || "";
      const lastName = formData.lastName || inviteName.split(" ").slice(1).join(" ") || "";
      const fullName = `${firstName} ${lastName}`.trim();

      // Redirect based on role after registration
      const callbackURL = invite?.role === "admin" ? "/admin" : "/committee";

      const { error: signUpError } = await signUp.email({
        email: inviteEmail,
        password: formData.password,
        name: fullName || "User",
        image: undefined,
        callbackURL,
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Registration successful - sync session before redirect
      await authClient.getSession();
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Account Created",
        description: `Welcome to Stark Scholars ${roleName} Portal! Redirecting...`,
      });

      window.location.href = `${callbackURL}?t=${Date.now()}`;

    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "An unexpected error occurred";

      if (errorMessage.includes("already exists") || errorMessage.includes("User exists")) {
        setError("An account with this email already exists. Try signing in instead.");
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (invite === undefined && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired invite
  if (!token || invite === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary font-serif cursor-pointer">
                Stark Scholars
              </h1>
            </Link>
            <p className="text-muted-foreground">Financial Assistance Program</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Invalid or Expired Invitation</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  This invitation link is no longer valid. It may have expired or already been used.
                  Please contact the administrator for a new invitation.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <a href="mailto:blackgoldmine@sbcglobal.net">Contact Admin</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Valid invite - show registration form
  if (!invite) return null; // TypeScript guard - unreachable due to null check above

  // Pre-fill name fields from invite
  const defaultFirstName = inviteName.split(" ")[0] || "";
  const defaultLastName = inviteName.split(" ").slice(1).join(" ") || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary font-serif cursor-pointer">
              Stark Scholars
            </h1>
          </Link>
          <p className="text-muted-foreground">Financial Assistance Program</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              {invite.role === "admin" ? (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <CardTitle>You&apos;re Invited!</CardTitle>
            <CardDescription className="space-y-2">
              <span>You&apos;ve been invited to join as</span>
              <div>
                <Badge variant="default" className="text-sm">
                  {roleName}
                </Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName || defaultFirstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName || defaultLastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email is pre-filled from your invitation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                />
                <p className="text-xs text-muted-foreground/70">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Accept Invitation & Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground/70 mt-8">
          <Link href="/" className="hover:underline">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
